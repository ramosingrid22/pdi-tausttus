import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ConsensoForm } from "./ConsensoForm";

export default async function ConsensoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: { colaborador: true, lider: { select: { name: true } } },
  });

  if (!avaliacao) redirect("/dashboard");
  if (avaliacao.liderId !== user.id && user.role !== "ADMIN") redirect("/dashboard");
  if (avaliacao.status !== "AGUARDANDO_CONSENSO") redirect("/dashboard");

  const avaliacaoComDados = {
    ...avaliacao,
    autoavaliacao: avaliacao.autoavaliacao ? JSON.parse(avaliacao.autoavaliacao as string) : null,
    avaliacaoLider: avaliacao.avaliacaoLider ? JSON.parse(avaliacao.avaliacaoLider as string) : null,
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ConsensoForm avaliacao={avaliacaoComDados as any} />
      </main>
    </div>
  );
}
