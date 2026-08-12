import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { AcompanhamentoClient } from "./AcompanhamentoClient";

export default async function AcompanhamentoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "LIDER") redirect("/dashboard");

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { status: "CONCLUIDA", consenso: { not: null } },
    include: { colaborador: { select: { name: true } }, lider: { select: { name: true } } },
    orderBy: { colaborador: { name: "asc" } },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let totalAcoes = 0;
  let totalVencidas = 0;
  let totalUrgentes = 0;
  let totalConcluidas = 0;

  const grupos = avaliacoes.flatMap((av) => {
    const consenso = av.consenso ? JSON.parse(av.consenso as string) : null;
    const acoesBrut: any[] = consenso?.acoesDesenvolvimento ?? [];

    const acoes = acoesBrut
      .map((a, originalIndex) => {
        if (!a.acao) return null;

        let diasRestantes: number | null = null;
        let vencida = false;

        if (a.prazoData) {
          const [d, m, y] = a.prazoData.split("/").map(Number);
          const dataLimite = new Date(y, m - 1, d);
          dataLimite.setHours(0, 0, 0, 0);
          const diff = Math.round((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          diasRestantes = diff;
          vencida = diff < 0 && !a.concluida;
        }

        totalAcoes++;
        if (a.concluida) totalConcluidas++;
        else if (vencida) totalVencidas++;
        else if (diasRestantes !== null && diasRestantes <= 15) totalUrgentes++;

        return {
          competencia: a.competencia ?? "",
          acao: a.acao,
          prazo: a.prazo ? `${a.prazo} dias` : "",
          prazoData: a.prazoData ?? "",
          responsavel: a.responsavel ?? "",
          vencida,
          diasRestantes,
          concluida: !!a.concluida,
          originalIndex,
        };
      })
      .filter(Boolean) as any[];

    if (acoes.length === 0) return [];

    acoes.sort((a: any, b: any) => {
      if (a.concluida && !b.concluida) return 1;
      if (!a.concluida && b.concluida) return -1;
      if (a.diasRestantes === null && b.diasRestantes === null) return 0;
      if (a.diasRestantes === null) return 1;
      if (b.diasRestantes === null) return -1;
      return a.diasRestantes - b.diasRestantes;
    });

    return [{
      colaborador: av.colaborador.name,
      unidade: av.unidade,
      lider: av.lider.name,
      avaliacaoId: av.id,
      periodo: av.periodo,
      acoes,
      temVencida: acoes.some((a: any) => a.vencida && !a.concluida),
      temUrgente: acoes.some((a: any) => !a.vencida && !a.concluida && a.diasRestantes !== null && a.diasRestantes <= 15),
    }];
  });

  grupos.sort((a, b) => {
    const aAll = a.acoes.every((x: any) => x.concluida);
    const bAll = b.acoes.every((x: any) => x.concluida);
    if (aAll && !bAll) return 1;
    if (!aAll && bAll) return -1;
    if (a.temVencida && !b.temVencida) return -1;
    if (!a.temVencida && b.temVencida) return 1;
    if (a.temUrgente && !b.temUrgente) return -1;
    if (!a.temUrgente && b.temUrgente) return 1;
    return a.colaborador.localeCompare(b.colaborador);
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="btn-secondary text-sm">← Voltar</a>
          <div>
            <h1 className="text-xl font-bold text-stone-800">Acompanhamento do PDI</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {grupos.length} colaborador{grupos.length !== 1 ? "es" : ""} · {totalAcoes} ações
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-black text-red-600">{totalVencidas}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencidas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-amber-500">{totalUrgentes}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencem em 15 dias</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-stone-600">{totalAcoes - totalVencidas - totalUrgentes - totalConcluidas}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">No prazo</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-green-600">{totalConcluidas}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Concluídas</div>
          </div>
        </div>

        {grupos.length === 0 && (
          <div className="card text-center py-12 text-stone-400">
            Nenhuma ação de PDI registrada ainda.
          </div>
        )}

        <AcompanhamentoClient grupos={grupos} />
      </main>
    </div>
  );
}
