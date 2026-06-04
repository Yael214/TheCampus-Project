const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.addAdminRole = onCall({ cors: true }, async (request) => {
  const context = request.auth;

  if (!context) {
    throw new Error("Must be logged in.");
  }

  if (request.auth.token.role !== "admin") {
    throw new Error("Only admins can assign other admins.");
  }

  const targetEmail = request.data.email;

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);

    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    await admin.firestore().collection("users").doc(user.uid).update({
      role: "admin"
    });

    return { message: `המשתמש ${targetEmail} מונה לאדמין בהצלחה!` };
  } catch (error) {
    console.error("Error in addAdminRole:", error);
    throw new Error("המשתמש לא נמצא במערכת");
  }
});