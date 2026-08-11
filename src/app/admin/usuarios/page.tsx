import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { UsuariosClient } from "./UsuariosClient";
import { prisma } from "@/lib/prisma";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, username: true, role: true,
      cargo: true, unidade: true, liderId: true, ativo: true,
      lider: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  const lideres = users.filter((u) => u.role === "LIDER" || u.role === "ADMIN");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <UsuariosClient initialUsers={users} lideres={lideres} />
      </main>
    </div>
  );
}
