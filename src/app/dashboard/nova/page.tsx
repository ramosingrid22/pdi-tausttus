import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { NovaAvaliacaoForm } from "./NovaAvaliacaoForm";

export default async function NovaAvaliacao() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role === "COLABORADOR") redirect("/dashboard");

  let colaboradores;
  if (user.role === "ADMIN") {
    colaboradores = await prisma.user.findMany({
      where: { role: { not: "ADMIN" }, ativo: true },
      select: { id: true, name: true, cargo: true, unidade: true, liderId: true },
      orderBy: { name: "asc" },
    });
  } else {
    colaboradores = await prisma.user.findMany({
      where: { role: "COLABORADOR", liderId: user.id, ativo: true },
      select: { id: true, name: true, cargo: true, unidade: true, liderId: true },
      orderBy: { name: "asc" },
    });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Nova Avaliação</h1>
        <NovaAvaliacaoForm colaboradores={colaboradores} liderId={user.role === "LIDER" ? user.id : null} />
      </main>
    </div>
  );
}
