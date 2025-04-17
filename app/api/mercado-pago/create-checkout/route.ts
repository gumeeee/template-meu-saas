import { mpClient } from "@/app/lib/mercado-pago";
import { Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { testeId, userEmail } = await req.json();

  const preference = new Preference(mpClient);

  const createdPreference = await preference.create({
    body: {
      external_reference: testeId, // ID do produto ou serviço, isso impacta na pontuação do mercado pago
      metadata: {
        testeId, // Essa varivel vai ser convertida para snake_case no backend do mercado pago = teste_id
      },
      ...(userEmail && { payer: { email: userEmail } }),
      items: [
        {
          id: "",
          title: "",
          description: "Produto de teste",
          quantity: 1,
          unit_price: 1,
          currency_id: "BRL",
          category_id: "services",
        },
      ],
      payment_methods: {
        installments: 12,
      },
      auto_return: "approved",
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercado-pago/pending`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercado-pago/pending`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercado-pago/pending`,
      },
    },
  });

  if (!createdPreference.id) {
    return NextResponse.json(
      { error: "Erro ao criar checkout com Mercado Pago" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    preferenceId: createdPreference.id,
    init_point: createdPreference.init_point,
  });
}
