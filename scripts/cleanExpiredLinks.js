// scripts/cleanExpiredLinks.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// خواندن کلید سرویس از متغیر محیطی (Secret)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanExpiredLinks() {
  const now = new Date();
  const snapshot = await db.collection('subscriptions')
                           .where('expiresAt', '<=', now)
                           .get();

  if (snapshot.empty) {
    console.log("No expired links found.");
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { active: false });
  });

  await batch.commit();
  console.log(`${snapshot.size} expired links deactivated.`);
}

cleanExpiredLinks().catch(error => {
  console.error("Error cleaning expired links:", error);
});