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
    const cashfreeApiKey = functions.config().cashfree.api_key;
    const cashfreeSecretKey = functions.config().cashfree.secret_key;

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

    // Define subscription plans
    const plans = {
      basic: {
        planId: 'basic_monthly',
        amount: 499,
        currency: 'INR',
        interval: 'month'
      }
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid plan ID');
    }

    // Cashfree API endpoint
    const cashfreeUrl = 'https://sandbox.cashfree.com/subscriptions/create';

    // Prepare subscription data
    const subscriptionData = {
      subscriptionId: `sub_${userId}_${planId}_${Date.now()}`,
      planId: plan.planId,
      customerDetails: {
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerName: userData?.displayName || customerEmail
      },
      subscriptionAmount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      returnUrl: `http://localhost:3000/subscription?status=success`,
      notifyUrl: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/subscriptionWebhook`
    };

    // Make API call to Cashfree
    const auth = Buffer.from(`${cashfreeApiKey}:${cashfreeSecretKey}`).toString('base64');
    const response = await axios.post(cashfreeUrl, subscriptionData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'SUCCESS') {
      // Save subscription to Firestore
      await admin.firestore().collection('subscriptions').doc(subscriptionData.subscriptionId).set({
        userId: userId,
        planId: planId,
        subscriptionId: subscriptionData.subscriptionId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        cashfreeResponse: response.data
      });

      return {
        success: true,
        subscriptionId: subscriptionData.subscriptionId,
        redirectUrl: response.data.paymentLink
      };
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to create subscription');
    }

  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw new functions.https.HttpsError('internal', 'Internal server error');
  }
});

// Webhook handler for subscription status updates
export const subscriptionWebhook = onRequest(async (req, res) => {
  const body = req.body;

  // Verify webhook signature (implement verification logic as needed)

  try {
    const subscriptionId = body.data.subscription_id;
    const status = body.data.status;

    // Update subscription status in Firestore
    const subscriptionDoc = await admin.firestore().collection('subscriptions').where('subscriptionId', '==', subscriptionId).get();

    if (!subscriptionDoc.empty) {
      const doc = subscriptionDoc.docs[0];
      await doc.ref.update({
        status: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        webhookData: body
      });

      // Update user subscription tier
      if (status === 'ACTIVE') {
        await admin.firestore().doc(`users/${doc.data().userId}`).update({
          subscriptionTier: 'basic',
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).send('Error');
  }
});
