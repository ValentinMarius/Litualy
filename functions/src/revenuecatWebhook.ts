import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

// RevenueCat trimite evenimente aici la fiecare schimbare de abonament
// (activare, reînnoire, expirare). Sursa de adevăr pentru premium status
// trebuie să fie server-side, nu ce raportează clientul. Vezi AGENTS.md.
export const onRevenueCatEvent = onRequest(async (req, res) => {
  const event = req.body?.event;
  if (!event?.app_user_id) {
    res.status(400).send("Payload invalid");
    return;
  }

  const db = getFirestore();
  const tier = event.entitlement_ids?.includes("premium-plus")
    ? "premium-plus"
    : event.entitlement_ids?.includes("premium")
      ? "premium"
      : "free";

  await db.collection("users").doc(event.app_user_id).update({ premiumTier: tier });
  res.status(200).send("OK");
});
