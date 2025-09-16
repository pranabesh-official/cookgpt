import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a base64 image to Firebase Storage and return the download URL
 * @param base64Data - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param userId - User ID for organizing files
 * @param recipeTitle - Recipe title for file naming
 * @returns Promise<string> - Firebase Storage download URL
 */
export const uploadRecipeImage = async (
  base64Data: string, 
  userId: string, 
  recipeTitle: string
): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  try {
    // Parse base64 data URL
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 data URL format');
    }

    const mimeType = matches[1];
    const base64String = matches[2];
    
    // Convert base64 to Uint8Array
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a unique filename
    const fileExtension = mimeType.split('/')[1] || 'png';
    const sanitizedTitle = recipeTitle.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    const uniqueId = uuidv4().slice(0, 8);
    const fileName = `${sanitizedTitle}_${uniqueId}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `recipe-images/${userId}/${fileName}`);
    
    // Upload the file
    console.log(`📤 Uploading image to Firebase Storage: ${fileName}`);
    const uploadResult = await uploadBytes(storageRef, byteArray, {
      contentType: mimeType,
      customMetadata: {
        recipeTitle,
        userId,
        uploadedAt: new Date().toISOString()
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log(`✅ Image uploaded successfully: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading image to Firebase Storage:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a recipe image from Firebase Storage
 * @param imageUrl - Firebase Storage download URL
 * @returns Promise<void>
 */
export const deleteRecipeImage = async (imageUrl: string): Promise<void> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  try {
    // Extract the storage path from the download URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL');
    }
    
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    
    // Delete the file
    const { deleteObject } = await import('firebase/storage');
    await deleteObject(storageRef);
    console.log(`🗑️ Image deleted successfully: ${storagePath}`);
  } catch (error) {
    console.error('❌ Error deleting image from Firebase Storage:', error);
    // Don't throw error for deletion failures to avoid breaking recipe saves
    console.warn('Image deletion failed, but continuing with recipe save');
  }
};

/**
 * Check if a URL is a base64 data URL
 * @param url - URL to check
 * @returns boolean
 */
export const isBase64DataUrl = (url: string): boolean => {
  return url.startsWith('data:') && url.includes('base64,');
};

/**
 * Check if a URL is a Firebase Storage URL
 * @param url - URL to check
 * @returns boolean
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com');
};

/**
 * Process image URL for recipe saving
 * - If it's a base64 data URL, upload to Storage and return download URL
 * - If it's already a valid HTTP URL, return as-is
 * - If it's empty or invalid, return empty string
 * @param imageUrl - Image URL to process
 * @param userId - User ID for organizing files
 * @param recipeTitle - Recipe title for file naming
 * @returns Promise<string> - Processed image URL
 */
export const processRecipeImageUrl = async (
  imageUrl: string | undefined, 
  userId: string, 
  recipeTitle: string
): Promise<string> => {
  if (!imageUrl) {
    return '';
  }

  try {
    // If it's a base64 data URL, upload to Firebase Storage
    if (isBase64DataUrl(imageUrl)) {
      console.log(`🔄 Processing base64 image for recipe: ${recipeTitle}`);
      return await uploadRecipeImage(imageUrl, userId, recipeTitle);
    }

    // If it's already a valid HTTP URL, return as-is
    if (imageUrl.startsWith('http')) {
      console.log(`✅ Using existing HTTP URL for recipe: ${recipeTitle}`);
      return imageUrl;
    }

    // Invalid URL format
    console.warn(`⚠️ Invalid image URL format for recipe: ${recipeTitle}`);
    return '';
  } catch (error) {
    console.error(`❌ Error processing image URL for recipe: ${recipeTitle}`, error);
    // Return empty string to avoid breaking recipe save
    return '';
  }
};