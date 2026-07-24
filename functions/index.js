/**
 * @file index.js
 * @description Cloud Functions for Firebase. Handles backend functionality such as 
 * custom admin role assignments and automated cascading collection cleanups.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Assigns an Admin role to a specified user.
 * @param {Object} request - Request object containing authentication details and payload data.
 * @param {string} request.data.email - The email address of the user to promote.
 * @returns {Promise<{message: string}>} A status message indicating success.
 * @throws {HttpsError} If unauthenticated, unauthorized, or if the email is missing/invalid.
 */
exports.addAdminRole = onCall({ cors: true }, async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  // Check admin authorization
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can assign other admins.");
  }

  const targetEmail = request.data.email;
  if (!targetEmail) {
    throw new HttpsError("invalid-argument", "No email address provided.");
  }

  try {
    // Find target user by email
    const user = await admin.auth().getUserByEmail(targetEmail);

    // Assign custom admin claim
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    // Synchronize role status in Firestore database
    await db.collection("users").doc(user.uid).update({
      role: "admin"
    });

    return { message: `המשתמש ${targetEmail} מונה לאדמין בהצלחה!` };
  } catch (error) {
    console.error("Error in addAdminRole:", error);
    throw new HttpsError("not-found", "המשתמש לא נמצא במערכת");
  }
});

/**
 * Firestore Trigger: Automatically deletes all associated child comments 
 * when a parent post document is deleted.
 * @param {Object} event - Event context containing document parameters.
 */
exports.deletePostComments = onDocumentDeleted({
    document: "posts/{postId}",
    memory: "512MiB",     // Allocation ceiling for heavy loads
    timeoutSeconds: 300   // Maximum duration
}, async (event) => {
    const postId = event.params.postId;
    const commentsRef = db.collection(`posts/${postId}/comments`);
    
    try {
        // Recursively delete subcollection
        await db.recursiveDelete(commentsRef);
        console.log(`Successfully deleted all comments for post: ${postId}`);
    } catch (error) {
        console.error(`Failed to delete comments for post ${postId}:`, error);
    }
});
