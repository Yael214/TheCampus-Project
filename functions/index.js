const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once at the top of the file
admin.initializeApp();
const db = admin.firestore();

// 1. Function to assign an Admin role to a user
exports.addAdminRole = onCall({ cors: true }, async (request) => {
  // Check if the user making the request is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  // Check if the user making the request is an admin themselves
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can assign other admins.");
  }

  const targetEmail = request.data.email;
  if (!targetEmail) {
    throw new HttpsError("invalid-argument", "No email address provided.");
  }

  try {
    // Step 1: Find the target user by their email address
    const user = await admin.auth().getUserByEmail(targetEmail);

    // Step 2: Set the custom user claim for the admin role
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    // Step 3: Update the user's role inside the Firestore 'users' collection
    await db.collection("users").doc(user.uid).update({
      role: "admin"
    });

    return { message: `המשתמש ${targetEmail} מונה לאדמין בהצלחה!` };
  } catch (error) {
    console.error("Error in addAdminRole:", error);
    // Return a structured error to the client application
    throw new HttpsError("not-found", "המשתמש לא נמצא במערכת");
  }
});

// 2. Background function to delete orphan comments when a post is deleted
// Configured with safety resource ceilings for future scaling and spam protection
exports.deletePostComments = onDocumentDeleted({
    document: "posts/{postId}",
    memory: "512MiB",     // Allocation ceiling. Only consumed if needed by heavy loads.
    timeoutSeconds: 300   // Maximum duration. Shuts down instantly once deletion completes.
}, async (event) => {
    const postId = event.params.postId;
    const commentsRef = db.collection(`posts/${postId}/comments`);
    
    try {
        // Use recursiveDelete to completely wipe out the subcollection safely
        await db.recursiveDelete(commentsRef);
        console.log(`Successfully deleted all comments for post: ${postId}`);
    } catch (error) {
        console.error(`Failed to delete comments for post ${postId}:`, error);
    }
});
