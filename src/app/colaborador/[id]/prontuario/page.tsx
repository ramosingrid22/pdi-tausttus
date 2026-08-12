import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { PrintButton } from "./PrintButton";

export default async function ProntuarioPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "LIDER") redirect("/dashboard");

  const colaborador = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, cargo: true, unidade: true },
  });

  if (!colaborador) redirect("/acompanhamento");

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { colaboradorId: params.id, status: "CONCLUIDA", consenso: { not: null } },
    include: { lider: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const ciclos = avaliacoes.map((av) => {
    const consenso = av.consenso ? JSON.parse(av.consenso as string) : null;
    const acoes: any[] = (consenso?.acoesDesenvolvimento ?? []).filter((a: any) => a.acao);
    const concluidas = acoes.filter((a) => a.concluida).length;

    return {
      avaliacaoId: av.id,
      periodo: av.periodo,
      lider: av.lider.name,
      unidade: av.unidade,
      acoes,
      concluidas,
      total: acoes.length,
      progresso: acoes.length > 0 ? Math.round((concluidas / acoes.length) * 100) : 0,
    };
  });

  const totalAcoes = ciclos.reduce((s, c) => s + c.total, 0);
  const totalConcluidas = ciclos.reduce((s, c) => s + c.concluidas, 0);
  const dataEmissao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Navegação */}
        <div className="flex items-center gap-3 print:hidden">
          <a href="/acompanhamento" className="btn-secondary text-sm">← Acompanhamento</a>
          <PrintButton />
        </div>

        {/* Cabeçalho */}
        <div className="card border-t-4 border-brand-orange">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-brand-orange uppercase tracking-widest mb-1">Prontuário de Desenvolvimento</p>
              <h1 className="text-2xl font-black text-stone-800">{colaborador.name}</h1>
              <p className="text-stone-500 text-sm mt-1">
                {colaborador.cargo}{colaborador.unidade ? ` · ${colaborador.unidade}` : ""}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-stone-400">{ciclos.length} ciclo{ciclos.length !== 1 ? "s" : ""} registrado{ciclos.length !== 1 ? "s" : ""}</div>
              <div className="text-xs text-stone-400 mt-0.5">{totalConcluidas}/{totalAcoes} ações concluídas no total</div>
              <div className="text-xs text-stone-300 mt-2">Emitido em {dataEmissao}</div>
            </div>
          </div>
        </div>

        {ciclos.length === 0 && (
          <div className="card text-center py-12 text-stone-400">
            Nenhuma avaliação concluída registrada.
          </div>
        )}

        {/* Ciclos */}
        {ciclos.map((c, idx) => (
          <div key={c.avaliacaoId} className="card space-y-4">
            {/* Cabeçalho do ciclo */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">
                    Ciclo {idx + 1}
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="font-semibold text-stone-700">{c.periodo}</span>
                  {c.progresso === 100 && c.total > 0 && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Concluído</span>
                  )}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Líder: {c.lider}{c.unidade ? ` · ${c.unidade}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">{c.concluidas}/{c.total} ações</span>
                <a
                  href={`/pdi/avaliacao/${c.avaliacaoId}/relatorio`}
                  className="text-xs text-brand-orange hover:underline print:hidden"
                  target="_blank"
                >
                  Ver relatório →
                </a>
              </div>
            </div>

            {/* Barra de progresso */}
            {c.total > 0 && (
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-green-500"
                  style={{ width: `${c.progresso}%` }}
                />
              </div>
            )}

            {/* Ações */}
            {c.acoes.length === 0 ? (
              <p className="text-sm text-stone-400 italic">Nenhuma ação de PDI registrada neste ciclo.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {c.acoes.map((a, i) => (
                  <div key={i} className="py-2.5 flex items-start gap-3">
                    {/* Status */}
                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      a.concluida ? "bg-green-500 border-green-500 text-white" : "border-stone-300"
                    }`}>
                      {a.concluida && (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-400 mb-0.5">{a.competencia}</div>
                      <div className={`text-sm text-stone-700 ${a.concluida ? "line-through opacity-60" : ""}`}>{a.acao}</div>

                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                        {a.responsavel && (
                          <span className="text-xs text-stone-400">Responsável: {a.responsavel}</span>
                        )}
                        {a.prazoData && (
                          <span className="text-xs text-stone-400">
                            {a.concluida ? `Prazo era ${a.prazoData}` : `Prazo: ${a.prazoData}`}
                          </span>
                        )}
                      </div>

                      {a.concluida && a.observacaoConclusao && (
                        <div className="mt-1 bg-green-50 rounded px-2.5 py-1.5 text-xs text-green-700">
                          <span className="font-semibold">Observação: </span>{a.observacaoConclusao}
                        </div>
                      )}
                    </div>

                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      a.concluida ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {a.concluida ? "Concluído" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="text-center text-xs text-stone-300 pb-4 print:pt-8">
          Tausttus · Sistema de Avaliação de Desempenho
        </p>
      </main>
    </div>
  );
}
