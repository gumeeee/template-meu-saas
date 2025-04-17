import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";

export default function useMercadoPago() {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY) {
      throw new Error("NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY is not defined");
    }

    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY);
  });
  async function createMercadoPagoCheckout({
    testeId,
    userEmail,
  }: {
    testeId: string;
    userEmail: string;
  }) {
    try {
      const response = await fetch("/api/mercado-pago/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testeId,
          userEmail,
        }),
      });

      const data = await response.json();

      router.push(data.init_point);
    } catch (error) {
      console.error(error);

      throw new Error("Erro ao criar checkout com Mercado Pago");
    }
  }

  return {
    createMercadoPagoCheckout,
  };
}
