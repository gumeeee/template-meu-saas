import stripe from "@/app/lib/stripe";
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !secret) {
      return NextResponse.json(
        { error: "No existing signature." },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "checkout.session.completed": // Pagamento realizado entao status = "paid"
        const metadata = event.data.object.metadata;

        if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
          await handleStripePayment(event);
        }

        if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
          await handleStripeSubscription(event);
        }
        break;
      case "checkout.session.expired": // Pagamento expirado
        console.log(
          "Pagamento expirado, enviar email para o cliente ou algo assim avisando que o pagamento expirou"
        );
        break;
      case "checkout.session.async_payment_succeeded": //Boleto gerado e pago
        console.log(
          "Boleto gerado e pago, enviar email para o cliente ou algo assim avisando que o boleto foi pago"
        );
        break;
      case "checkout.session.async_payment_failed": //Boleto gerado e não pago ou cancelado falhou
        console.log(
          "Boleto gerado e nao pago, enviar email para o cliente ou algo assim avisando que o boleto nao foi pago ou falhou"
        );
        break;
      case "customer.subscription.created": // Assinatura criada
        console.log(
          "Assinatura criada, enviar email para o cliente ou algo assim avisando que a assinatura foi criada dando acesso ao conteudo"
        );
        break;
      case "customer.subscription.deleted": // Assinatura cancelada
        await handleStripeCancelSubscription(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error in Stripe webhook: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
