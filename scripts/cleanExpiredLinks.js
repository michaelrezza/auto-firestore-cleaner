// scripts/cleanExpiredLinks.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// خواندن base64 و تبدیل به JSON
const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString();
const serviceAccount = JSON.parse(decoded);

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
    console.log("هیچ لینک منقضی‌شده‌ای پیدا نشد.");
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { active: false });
  });

  await batch.commit();
  console.log(`${snapshot.size} لینک منقضی غیرفعال شد.`);
}

cleanExpiredLinks().catch(error => {
  console.error("خطا در غیرفعال‌سازی لینک‌ها:", error);
});