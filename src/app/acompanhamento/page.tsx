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
    orderBy: { updatedAt: "desc" },
  });

  type Acao = {
    colaborador: string;
    unidade: string;
    lider: string;
    avaliacaoId: string;
    competencia: string;
    acao: string;
    prazo: string;
    prazoData: string;
    responsavel: string;
    vencida: boolean;
    diasRestantes: number | null;
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const todasAcoes: Acao[] = [];

  for (const av of avaliacoes) {
    const consenso = av.consenso ? JSON.parse(av.consenso as string) : null;
    const acoes = consenso?.acoesDesenvolvimento ?? [];
    for (const a of acoes) {
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

      todasAcoes.push({
        colaborador: av.colaborador.name,
        unidade: av.unidade,
        lider: av.lider.name,
        avaliacaoId: av.id,
        competencia: a.competencia,
        acao: a.acao,
        prazo: a.prazo ? `${a.prazo} dias` : "",
        prazoData: a.prazoData ?? "",
        responsavel: a.responsavel ?? "",
        vencida,
        diasRestantes,
      });
    }
  }

  // Ordenar: vencidas primeiro, depois por dias restantes
  todasAcoes.sort((a, b) => {
    if (a.diasRestantes === null && b.diasRestantes === null) return 0;
    if (a.diasRestantes === null) return 1;
    if (b.diasRestantes === null) return -1;
    return a.diasRestantes - b.diasRestantes;
  });

  const vencidas = todasAcoes.filter((a) => a.vencida);
  const urgentes = todasAcoes.filter((a) => !a.vencida && a.diasRestantes !== null && a.diasRestantes <= 15);
  const normal = todasAcoes.filter((a) => !a.vencida && (a.diasRestantes === null || a.diasRestantes > 15));

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="btn-secondary text-sm">← Voltar</a>
          <div>
            <h1 className="text-xl font-bold text-stone-800">Acompanhamento do PDI</h1>
            <p className="text-sm text-stone-500 mt-0.5">{todasAcoes.length} ações de desenvolvimento em andamento</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-black text-red-600">{vencidas.length}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencidas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-amber-500">{urgentes.length}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Vencem em até 15 dias</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-green-600">{normal.length}</div>
            <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">No prazo</div>
          </div>
        </div>

        {vencidas.length > 0 && (
          <GrupoAcoes titulo="⚠ Vencidas" acoes={vencidas} cor="red" />
        )}
        {urgentes.length > 0 && (
          <GrupoAcoes titulo="⏰ Vencem em até 15 dias" acoes={urgentes} cor="amber" />
        )}
        {normal.length > 0 && (
          <GrupoAcoes titulo="✅ No prazo" acoes={normal} cor="green" />
        )}

        {todasAcoes.length === 0 && (
          <div className="card text-center py-12 text-stone-400">
            Nenhuma ação de PDI registrada ainda.
          </div>
        )}
      </main>
    </div>
  );
}

function GrupoAcoes({ titulo, acoes, cor }: {
  titulo: string;
  acoes: any[];
  cor: "red" | "amber" | "green";
}) {
  const borderCor = cor === "red" ? "border-red-400" : cor === "amber" ? "border-amber-400" : "border-green-400";
  const bgCor = cor === "red" ? "bg-red-50 text-red-700" : cor === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700";

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest">{titulo}</h2>
      {acoes.map((a, i) => (
        <div key={i} className={`card border-l-4 ${borderCor} space-y-2`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="font-semibold text-stone-800 text-sm">{a.colaborador}</span>
              <span className="text-stone-400 text-xs mx-2">·</span>
              <span className="text-stone-500 text-xs">{a.unidade}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {a.prazoData && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bgCor}`}>
                  {a.vencida
                    ? `Venceu ${a.prazoData} (${Math.abs(a.diasRestantes)} dias atrás)`
                    : a.diasRestantes === 0
                    ? `Vence hoje — ${a.prazoData}`
                    : `${a.diasRestantes} dias — ${a.prazoData}`}
                </span>
              )}
              <a
                href={`/avaliacao/${a.avaliacaoId}/relatorio`}
                className="text-xs text-brand-orange hover:underline"
              >
                Ver relatório →
              </a>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-400">{a.competencia}</span>
            <p className="text-sm text-stone-700 mt-0.5">{a.acao}</p>
          </div>
          {a.responsavel && (
            <p className="text-xs text-stone-400">Responsável: {a.responsavel}</p>
          )}
        </div>
      ))}
    </section>
  );
}
