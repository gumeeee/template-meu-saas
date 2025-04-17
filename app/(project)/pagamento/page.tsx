import { auth } from "@/app/lib/auth";
import Pagamentos from "./_component/pagamentos";
import { redirect } from "next/navigation";

export default async function PagamentosPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!session) {
    redirect("/login");
  }

  return <Pagamentos userEmail={userEmail} />;
}
