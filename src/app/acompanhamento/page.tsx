import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";

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

  type Acao = {
    competencia: string;
    acao: string;
    prazo: string;
    prazoData: string;
    responsavel: string;
    vencida: boolean;
    diasRestantes: number | null;
  };

  type ColaboradorGroup = {
    colaborador: string;
    unidade: string;
    lider: string;
    avaliacaoId: string;
    periodo: string;
    acoes: Acao[];
    temVencida: boolean;
    temUrgente: boolean;
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const grupos: ColaboradorGroup[] = [];
  let totalAcoes = 0;
  let totalVencidas = 0;
  let totalUrgentes = 0;

  for (const av of avaliacoes) {
    const consenso = av.consenso ? JSON.parse(av.consenso as string) : null;
    const acoesBrut = consenso?.acoesDesenvolvimento ?? [];
    const acoes: Acao[] = [];

    for (const a of acoesBrut) {
      if (!a.acao) continue;

      let diasRestantes: number | null = null;
      let vencida = false;

      if (a.prazoData) {
        const [d, m, y] = a.prazoData.split("/").map(Number);
        const dataLimite = new Date(y, m - 1, d);
        dataLimite.setHours(0, 0, 0, 0);
        const diff = Math.round((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        diasRestantes = diff;
        vencida = diff < 0;
      }

      acoes.push({
        competencia: a.competencia,
        acao: a.acao,
        prazo: a.prazo ? `${a.prazo} dias` : "",
        prazoData: a.prazoData ?? "",
        responsavel: a.responsavel ?? "",
        vencida,
        diasRestantes,
      });

      totalAcoes++;
      if (vencida) totalVencidas++;
      else if (diasRestantes !== null && diasRestantes <= 15) totalUrgentes++;
    }

    if (acoes.length === 0) continue;

    // Ordenar ações: vencidas → urgentes → no prazo → sem data
    acoes.sort((a, b) => {
      if (a.diasRestantes === null && b.diasRestantes === null) return 0;
      if (a.diasRestantes === null) return 1;
      if (b.diasRestantes === null) return -1;
      return a.diasRestantes - b.diasRestantes;
    });

    grupos.push({
      colaborador: av.colaborador.name,
      unidade: av.unidade,
      lider: av.lider.name,
      avaliacaoId: av.id,
      periodo: av.periodo,
      acoes,
      temVencida: acoes.some((a) => a.vencida),
      temUrgente: acoes.some((a) => !a.vencida && a.diasRestantes !== null && a.diasRestantes <= 15),
    });
  }

  // Ordenar grupos: com vencidas primeiro, depois urgentes, depois resto
  grupos.sort((a, b) => {
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
            <p className="text-sm text-stone-500 mt-0.5">{grupos.length} colaborador{grupos.length !== 1 ? "es" : ""} · {totalAcoes} ações</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-black text-red-600">{totalVencidas}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencidas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-amber-500">{totalUrgentes}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencem em até 15 dias</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-green-600">{totalAcoes - totalVencidas - totalUrgentes}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">No prazo</div>
          </div>
        </div>

        {grupos.length === 0 && (
          <div className="card text-center py-12 text-stone-400">
            Nenhuma ação de PDI registrada ainda.
          </div>
        )}

        {grupos.map((g) => (
          <div key={g.avaliacaoId} className={`card space-y-4 ${g.temVencida ? "border-l-4 border-red-400" : g.temUrgente ? "border-l-4 border-amber-400" : ""}`}>
            {/* Cabeçalho do colaborador */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800">{g.colaborador}</span>
                  {g.temVencida && <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠ Ação vencida</span>}
                  {!g.temVencida && g.temUrgente && <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏰ Vence em breve</span>}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {g.unidade} · Líder: {g.lider} · {g.periodo}
                </div>
              </div>
              <a href={`/avaliacao/${g.avaliacaoId}/relatorio`} className="text-xs text-brand-orange hover:underline shrink-0">
                Ver relatório →
              </a>
            </div>

            {/* Ações */}
            <div className="divide-y divide-stone-50">
              {g.acoes.map((a, i) => {
                const statusColor = a.vencida
                  ? "bg-red-50 text-red-700"
                  : a.diasRestantes !== null && a.diasRestantes <= 15
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700";

                return (
                  <div key={i} className="py-3 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-400 mb-0.5">{a.competencia}</div>
                      <div className="text-sm text-stone-700">{a.acao}</div>
                      {a.responsavel && <div className="text-xs text-stone-400 mt-0.5">Responsável: {a.responsavel}</div>}
                    </div>
                    {a.prazoData && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor}`}>
                        {a.vencida
                          ? `Venceu ${a.prazoData} (${Math.abs(a.diasRestantes!)} dias atrás)`
                          : a.diasRestantes === 0
                          ? `Vence hoje — ${a.prazoData}`
                          : `${a.diasRestantes} dias — ${a.prazoData}`}
                      </span>
                    )}
                    {!a.prazoData && a.prazo && (
                      <span className="text-xs text-stone-400 shrink-0">{a.prazo}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
