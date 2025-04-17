import { db } from "@/app/lib/firebase";
import "server-only";

import Stripe from "stripe";

export async function handleStripeSubscription(
  event: Stripe.CheckoutSessionCompletedEvent
) {
  if (event.data.object.payment_status === "paid") {
    console.log(
      "Assinatura criada com sucesso. Enviar um email liberando o acesso ao conteudo."
    );

    const metadata = event.data.object.metadata;

    const userId = metadata?.userId;

    if (!userId) {
      console.error("User ID not found in metadata.");
      return;
    }

    await db.collection("users").doc(userId).update({
      stripeSubscriptionId: event.data.object.subscription,
      subscriptionStatus: "active",
    });
  }
}
