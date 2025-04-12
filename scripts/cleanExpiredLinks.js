const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  try {
    const now = new Date();
    const snapshot = await db.collection("subscriptions").get();
    let count = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.active === true && new Date(data.expiresAt) <= now) {
        await doc.ref.update({ active: false });
        count++;
      }
    }

    console.log(`${count} expired links deactivated.`);
  } catch (error) {
    console.error("Error cleaning expired links:", error);
    process.exit(1);
  }
})();