/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest, onCall} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin
admin.initializeApp();

// Cashfree Subscription Creation Function
export const createSubscription = onCall(async (request, response) => {
  const { userId, planId } = request.data;

  if (!userId || !planId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID and Plan ID are required');
  }

  try {
    const cashfreeApiKey = process.env.CASHFREE_API_KEY;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;

    if (!cashfreeApiKey || !cashfreeSecretKey) {
      throw new functions.https.HttpsError('internal', 'Cashfree credentials not configured');
    }

    // Get user details from Firestore
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const customerEmail = userData?.email;
    const customerPhone = userData?.phone || '9999999999'; // Fallback phone

    if (!customerEmail) {
      throw new functions.https.HttpsError('failed-precondition', 'User email is required');
    }

    // Define subscription plans according to Cashfree structure
    const plans = {
      basic: {
        planName: 'CookGPT Basic Plan',
        maxAmount: 499,
        recurringAmount: 499,
        intervalType: 'month',
        intervals: 1,
        description: '20 AI recipes per day, unlimited images, meal planning'
      },
      pro: {
        planName: 'CookGPT Pro Plan',
        maxAmount: 799,
        recurringAmount: 799,
        intervalType: 'month',
        intervals: 1,
        description: 'Unlimited recipes, calorie tracker, grocery export, priority support'
      }
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid plan ID');
    }

    // Cashfree Subscription API endpoint (v2)
    const cashfreeUrl = 'https://sandbox.cashfree.com/api/v2/subscriptions';
    
    const subscriptionId = `sub_${userId}_${planId}_${Date.now()}`;
    const returnUrl = process.env.NODE_ENV === 'production' 
      ? `https://cookgpt-a865a.web.app/subscription?status=success&plan=${planId}`
      : `http://localhost:3000/subscription?status=success&plan=${planId}`;

    // Prepare subscription data according to Cashfree API v2
    const subscriptionData = {
      subscriptionId: subscriptionId,
      planName: plan.planName,
      subscriptionType: 'PERIODIC',
      maxAmount: plan.maxAmount,
      recurringAmount: plan.recurringAmount,
      intervalType: plan.intervalType,
      intervals: plan.intervals,
      description: plan.description,
      customerName: userData?.displayName || customerEmail.split('@')[0],
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      returnUrl: returnUrl,
      notifyUrl: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/subscriptionWebhook`
    };

    // Make API call to Cashfree using proper authentication headers
    const response = await axios.post(cashfreeUrl, subscriptionData, {
      headers: {
        'X-Client-Id': cashfreeApiKey,
        'X-Client-Secret': cashfreeSecretKey,
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01'
      }
    });

    logger.info('Cashfree response:', response.data);

    if (response.data && (response.data.status === 'SUCCESS' || response.data.authLink)) {
      // Save subscription to Firestore
      await admin.firestore().collection('subscriptions').doc(subscriptionId).set({
        userId: userId,
        planId: planId,
        subscriptionId: subscriptionId,
        status: 'pending',
        maxAmount: plan.maxAmount,
        recurringAmount: plan.recurringAmount,
        intervalType: plan.intervalType,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        cashfreeResponse: response.data
      });

      return {
        success: true,
        subscriptionId: subscriptionId,
        redirectUrl: response.data.authLink || response.data.paymentLink
      };
    } else {
      logger.error('Cashfree API error:', response.data);
      throw new functions.https.HttpsError('internal', 'Failed to create subscription with Cashfree');
    }

  } catch (error: any) {
    logger.error('Error creating subscription:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data) {
      throw new functions.https.HttpsError('internal', `Cashfree API error: ${error.response.data.message || 'Unknown error'}`);
    }
    
    throw new functions.https.HttpsError('internal', 'Internal server error');
  }
});

// Webhook handler for subscription status updates from Cashfree
export const subscriptionWebhook = onRequest(async (req, res) => {
  const body = req.body;
  
  logger.info('Received Cashfree webhook:', body);

  // TODO: Implement webhook signature verification for security
  // const signature = req.headers['x-webhook-signature'];
  // Verify signature using Cashfree's webhook secret

  try {
    // Cashfree sends subscription updates in this format
    const subscriptionId = body.data?.subscriptionId || body.subscriptionId;
    const status = body.data?.subscriptionStatus || body.status;
    const eventType = body.eventType || body.type;

    if (!subscriptionId) {
      logger.error('No subscription ID in webhook payload');
      res.status(400).send('Missing subscription ID');
      return;
    }

    // Update subscription status in Firestore
    const subscriptionDoc = await admin.firestore().collection('subscriptions').where('subscriptionId', '==', subscriptionId).get();

    if (!subscriptionDoc.empty) {
      const doc = subscriptionDoc.docs[0];
      const subscriptionData = doc.data();
      
      await doc.ref.update({
        status: status,
        eventType: eventType,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        webhookData: body
      });

      // Update user subscription tier based on status
      if (status === 'ACTIVE' || status === 'active') {
        const planId = subscriptionData.planId;
        const tierMapping = {
          'basic': 'basic',
          'pro': 'pro'
        };
        
        await admin.firestore().doc(`users/${subscriptionData.userId}`).update({
          subscriptionTier: tierMapping[planId as keyof typeof tierMapping] || 'basic',
          subscriptionStatus: status,
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        logger.info(`Updated user ${subscriptionData.userId} to ${planId} tier`);
      } else if (status === 'CANCELLED' || status === 'cancelled' || status === 'EXPIRED' || status === 'expired') {
        // Downgrade user to free tier
        await admin.firestore().doc(`users/${subscriptionData.userId}`).update({
          subscriptionTier: 'free',
          subscriptionStatus: status,
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        logger.info(`Downgraded user ${subscriptionData.userId} to free tier due to ${status}`);
      }
    } else {
      logger.warn(`Subscription ${subscriptionId} not found in database`);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling Cashfree webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});
