import { handleAuth } from "@/app/actions/handle-auth";
import { auth } from "@/app/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
      <p>Email do Usuário Logado: {session?.user?.email}</p>
      {session.user?.email && (
        <form action={handleAuth}>
          <button
            type="submit"
            className="border rounded-lg p-2 cursor-pointer"
          >
            Logout
          </button>
        </form>
      )}
      <Link href="/pagamento">Pagamento</Link>
    </div>
  );
}
