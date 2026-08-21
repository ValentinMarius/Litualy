import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

// Rulează server-side, la interval fix — nu depinde de userul care are
// aplicația deschisă. Vezi 01-features-mvp.docx, feature #5.
// NOTĂ: pentru MVP, notificarea zilnică e LOCALĂ (on-device, expo-notifications),
// nu server-side — vezi 04-roadmap.docx, Faza 1. Această funcție e o îmbunătățire
// de mai târziu (Faza 8): notificări adaptive/inteligente (ex. "ești pe cale să-ți
// pierzi streak-ul"), care chiar au nevoie de un trigger server-side. Nu e nevoie
// de ea pentru lansarea MVP.
export const sendDailyReadingReminders = onSchedule("every day 09:00", async () => {
  const db = getFirestore();
  const usersSnapshot = await db.collection("users").get();

  for (const doc of usersSnapshot.docs) {
    const user = doc.data();
    // TODO: verifică dacă userul a citit deja azi (în fusul lui local,
    // vezi features/streak/streakLogic.ts) înainte să trimiți notificarea.
    // TODO: trimite push notification via Firebase Cloud Messaging.
  }
});
