import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { PrintButton } from "./PrintButton";

export default async function ConclusaoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "LIDER") redirect("/dashboard");

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: {
      colaborador: { select: { name: true, cargo: true, unidade: true } },
      lider: { select: { name: true } },
    },
  });

  if (!avaliacao || avaliacao.status !== "CONCLUIDA") redirect("/acompanhamento");

  const consenso = avaliacao.consenso ? JSON.parse(avaliacao.consenso as string) : null;
  if (!consenso) redirect("/acompanhamento");

  const acoes: any[] = consenso.acoesDesenvolvimento ?? [];
  const totalAcoes = acoes.filter((a) => a.acao).length;
  const acoesConc = acoes.filter((a) => a.acao && a.concluida).length;
  const progresso = totalAcoes > 0 ? Math.round((acoesConc / totalAcoes) * 100) : 0;

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 print:px-0 print:py-0">

        {/* Navegação */}
        <div className="flex items-center gap-3 print:hidden">
          <a href="/acompanhamento" className="btn-secondary text-sm">← Acompanhamento</a>
          <a href={`/avaliacao/${params.id}/relatorio`} className="btn-secondary text-sm">Ver relatório completo</a>
          <PrintButton />
        </div>

        {/* Cabeçalho do prontuário */}
        <div className="card border-t-4 border-brand-orange space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-brand-orange uppercase tracking-widest mb-1">Prontuário de PDI</p>
              <h1 className="text-2xl font-black text-stone-800">{avaliacao.colaborador.name}</h1>
              <p className="text-stone-500 text-sm mt-1">
                {avaliacao.colaborador.cargo} · {avaliacao.colaborador.unidade}
              </p>
              <p className="text-stone-400 text-xs mt-0.5">
                Líder: {avaliacao.lider.name} · Período: {avaliacao.periodo}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-orange">{progresso}%</div>
              <div className="text-xs text-stone-400 mt-0.5">{acoesConc}/{totalAcoes} ações concluídas</div>
              <div className="text-xs text-stone-300 mt-2">Emitido em {dataFormatada}</div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-brand-orange transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        {/* Síntese narrativa */}
        {consenso.sintese && (
          <div className="card border-l-4 border-brand-orange">
            <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">📝 Síntese Narrativa</h2>
            <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed">{consenso.sintese}</p>
          </div>
        )}

        {/* Pontos fortes e de melhoria */}
        {(consenso.pontosFortes?.length > 0 || consenso.pontosMelhoria?.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {consenso.pontosFortes?.length > 0 && (
              <div className="card space-y-2">
                <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">✅ Pontos Fortes</h2>
                <ul className="space-y-1">
                  {consenso.pontosFortes.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-stone-600 flex gap-2">
                      <span className="text-green-500 shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {consenso.pontosMelhoria?.length > 0 && (
              <div className="card space-y-2">
                <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">🎯 Pontos de Melhoria</h2>
                <ul className="space-y-1">
                  {consenso.pontosMelhoria.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-stone-600 flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ações de desenvolvimento */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">📋 Plano de Ação</h2>
          <div className="divide-y divide-stone-100">
            {acoes.filter((a) => a.acao).map((a, i) => (
              <div key={i} className="py-3 flex items-start gap-3">
                {/* Status icon */}
                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  a.concluida ? "bg-green-500 border-green-500 text-white" : "border-stone-300"
                }`}>
                  {a.concluida && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-stone-400 mb-0.5">{a.competencia}</div>
                  <div className={`text-sm text-stone-700 ${a.concluida ? "line-through opacity-60" : ""}`}>{a.acao}</div>
                  {a.concluida && a.observacaoConclusao && (
                    <div className="mt-1.5 bg-green-50 rounded-lg px-3 py-1.5 text-xs text-green-700">
                      <span className="font-semibold">Observação: </span>{a.observacaoConclusao}
                    </div>
                  )}
                  <div className="flex gap-4 mt-1 flex-wrap">
                    {a.responsavel && (
                      <span className="text-xs text-stone-400">Responsável: {a.responsavel}</span>
                    )}
                    {a.prazoData && (
                      <span className={`text-xs font-medium ${a.concluida ? "text-green-600" : "text-stone-400"}`}>
                        {a.concluida ? `Concluído · prazo era ${a.prazoData}` : `Prazo: ${a.prazoData}`}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  a.concluida
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-100 text-stone-500"
                }`}>
                  {a.concluida ? "Concluído" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anotações da reunião */}
        {consenso.anotacoes && (
          <div className="card space-y-2">
            <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">🗒️ Anotações da Reunião</h2>
            <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed">{consenso.anotacoes}</p>
          </div>
        )}

        {/* Assinatura */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide mb-6">Assinaturas</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-stone-300 pt-2 mt-8">
                <p className="text-sm font-medium text-stone-700">{avaliacao.colaborador.name}</p>
                <p className="text-xs text-stone-400">Colaborador</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-stone-300 pt-2 mt-8">
                <p className="text-sm font-medium text-stone-700">{avaliacao.lider.name}</p>
                <p className="text-xs text-stone-400">Líder</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-stone-300 pb-4">
          Tausttus · Sistema de Avaliação de Desempenho · {avaliacao.periodo}
        </p>
      </main>
    </div>
  );
}
