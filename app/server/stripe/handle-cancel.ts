import { db } from "@/app/lib/firebase";
import "server-only";

import Stripe from "stripe";

export async function handleStripeCancelSubscription(
  event: Stripe.CustomerSubscriptionDeletedEvent
) {
  if (event.data.object.status === "canceled") {
    console.log(
      "Assinatura cancelada com sucesso. Enviar um email informando o cancelamento."
    );

    const customerId = event.data.object.metadata;

    const userRef = await db
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .get();

    if (userRef.empty) {
      console.error("User ID not found in metadata.");
      return;
    }

    const userId = userRef.docs[0].id;

    await db.collection("users").doc(userId).update({
      subscriptionStatus: "deactivated",
    });
  }
}
