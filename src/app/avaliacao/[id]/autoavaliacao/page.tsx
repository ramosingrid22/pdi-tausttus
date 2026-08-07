import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { FormAvaliacao } from "@/components/FormAvaliacao";

export default async function AutoavaliacaoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: { colaborador: true },
  });

  if (!avaliacao) redirect("/dashboard");
  if (avaliacao.colaboradorId !== user.id) redirect("/dashboard");
  if (avaliacao.status !== "AGUARDANDO_COLABORADOR") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <FormAvaliacao
          avaliacaoId={avaliacao.id}
          cargo={avaliacao.cargo}
          fase="autoavaliacao"
          colaboradorNome={avaliacao.colaborador.name}
          periodo={avaliacao.periodo}
          unidade={avaliacao.unidade}
        />
      </main>
    </div>
  );
}
