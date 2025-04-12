const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });

  const db = admin.firestore();

  async function cleanExpiredLinks() {
    const now = new Date();
      const snapshot = await db.collection('links').where('expiresAt', '<=', now).get();

        const batch = db.batch();
          snapshot.forEach((doc) => {
              batch.delete(doc.ref);
                });

                  await batch.commit();
                    console.log(`Deleted ${snapshot.size} expired links.`);
                    }

                    cleanExpiredLinks().catch(console.error);