import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { COMPETENCIAS_COMPORTAMENTAIS, COMPETENCIAS_TECNICAS } from "@/lib/competencias";
import { PrintButton } from "./PrintButton";
import { ReopenButton } from "./ReopenButton";
import { SinteseButton } from "./SinteseButton";

export default async function RelatorioPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: {
      colaborador: { select: { name: true, cargo: true, unidade: true } },
      lider: { select: { name: true } },
    },
  });

  if (!avaliacao) redirect("/dashboard");
  if (
    avaliacao.colaboradorId !== user.id &&
    avaliacao.liderId !== user.id &&
    user.role !== "ADMIN"
  ) redirect("/dashboard");

  // Redireciona colaborador para a fase correta se a avaliação ainda não foi concluída
  if (avaliacao.status === "AGUARDANDO_COLABORADOR" && avaliacao.colaboradorId === user.id) {
    redirect(`/avaliacao/${params.id}/autoavaliacao`);
  }

  const auto = avaliacao.autoavaliacao ? JSON.parse(avaliacao.autoavaliacao as string) : null;
  const liderData = avaliacao.avaliacaoLider ? JSON.parse(avaliacao.avaliacaoLider as string) : null;
  const consenso = avaliacao.consenso ? JSON.parse(avaliacao.consenso as string) : null;
  const tecnicas = COMPETENCIAS_TECNICAS[avaliacao.cargo] ?? [];
  const todasCompetencias = [...COMPETENCIAS_COMPORTAMENTAIS, ...tecnicas];

  // Calcular média geral do consenso
  const notasConsenso = consenso?.notas ?? {};
  const mediaGeral = todasCompetencias.length > 0
    ? (todasCompetencias.reduce((sum, c) => sum + (notasConsenso[c] ?? 0), 0) / todasCompetencias.length).toFixed(1)
    : "—";

  const hoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Print button */}
      <div className="max-w-4xl mx-auto px-4 pt-6 no-print">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="btn-secondary text-sm">← Voltar</a>
          <PrintButton />
          {user.role === "ADMIN" && avaliacao.status === "CONCLUIDA" && (
            <ReopenButton avaliacaoId={avaliacao.id} />
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
        {/* Capa */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Tausttus Burger</div>
              <h1 className="text-2xl font-black text-stone-800">Relatório de Avaliação de Desempenho</h1>
              <p className="text-stone-500 mt-1">{avaliacao.periodo}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${avaliacao.status === "CONCLUIDA" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {avaliacao.status === "CONCLUIDA" ? "Concluída" : "Em andamento"}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
            <InfoItem label="Colaborador(a)" value={avaliacao.colaborador.name} />
            <InfoItem label="Cargo" value={avaliacao.cargo} />
            <InfoItem label="Unidade" value={avaliacao.unidade} />
            <InfoItem label="Líder" value={avaliacao.lider.name} />
          </div>

          {consenso && (
            <div className="mt-6 pt-6 border-t border-stone-100">
              <div className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg">
                <span className="text-2xl font-black">{mediaGeral}</span>
                <span className="text-sm opacity-90">/ 5.0 — Média de consenso</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de notas */}
        {consenso && (
          <div className="card">
            <h2 className="font-semibold text-stone-700 mb-4">Notas por Competência</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100">
                    <th className="text-left pb-2">Competência</th>
                    <th className="text-center pb-2">Colaborador</th>
                    <th className="text-center pb-2">Líder</th>
                    <th className="text-center pb-2">Consenso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  <tr>
                    <td colSpan={4} className="py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">
                      Comportamentais
                    </td>
                  </tr>
                  {COMPETENCIAS_COMPORTAMENTAIS.map((c) => (
                    <NotaRow key={c} comp={c} auto={auto} lider={liderData} consenso={consenso} />
                  ))}
                  {tecnicas.length > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Técnicas — {avaliacao.cargo}
                      </td>
                    </tr>
                  )}
                  {tecnicas.map((c) => (
                    <NotaRow key={c} comp={c} auto={auto} lider={liderData} consenso={consenso} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Síntese */}
        {consenso && (consenso.pontosFortes || consenso.pontosMelhoria) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {consenso.pontosFortes && (
              <div className="card border-l-4 border-green-400">
                <h3 className="font-semibold text-stone-700 mb-2">✅ Pontos Fortes</h3>
                <p className="text-sm text-stone-600 whitespace-pre-line">{consenso.pontosFortes}</p>
              </div>
            )}
            {consenso.pontosMelhoria && (
              <div className="card border-l-4 border-amber-400">
                <h3 className="font-semibold text-stone-700 mb-2">🎯 Pontos a Desenvolver</h3>
                <p className="text-sm text-stone-600 whitespace-pre-line">{consenso.pontosMelhoria}</p>
              </div>
            )}
          </div>
        )}

        {/* Síntese narrativa gerada por IA */}
        {consenso?.sintese ? (
          <div className="card border-l-4 border-brand-orange">
            <h3 className="font-semibold text-stone-700 mb-3">📝 Síntese Narrativa</h3>
            <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed">{consenso.sintese}</p>
          </div>
        ) : consenso && user.role === "ADMIN" && (
          <SinteseButton avaliacaoId={avaliacao.id} />
        )}

        {/* PDI */}
        {consenso?.acoesDesenvolvimento?.some((a: any) => a.acao) && (
          <div className="card">
            <h2 className="font-semibold text-stone-700 mb-4">📋 Plano de Desenvolvimento Individual (PDI)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100">
                    <th className="text-left pb-2">Competência</th>
                    <th className="text-left pb-2">Ação</th>
                    <th className="text-left pb-2">Prazo</th>
                    <th className="text-left pb-2">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {consenso.acoesDesenvolvimento.filter((a: any) => a.acao).map((a: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-3 font-medium text-stone-700">{a.competencia}</td>
                      <td className="py-2.5 pr-3 text-stone-600">{a.acao}</td>
                      <td className="py-2.5 pr-3 text-stone-500 whitespace-nowrap">{a.prazo}</td>
                      <td className="py-2.5 text-stone-500">{a.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Anotações da reunião */}
        {(consenso?.anotacoes || consenso?.comentarioFinal) && (
          <div className="card">
            <h3 className="font-semibold text-stone-700 mb-2">Anotações da Reunião</h3>
            <p className="text-sm text-stone-600 whitespace-pre-line">{consenso.anotacoes ?? consenso.comentarioFinal}</p>
          </div>
        )}

        {/* Assinaturas */}
        {avaliacao.status === "CONCLUIDA" && (
          <div className="card">
            <h3 className="font-semibold text-stone-700 mb-6">Assinaturas</h3>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="border-t border-stone-300 pt-2 mt-8">
                  <p className="text-sm font-medium text-stone-700">{avaliacao.colaborador.name}</p>
                  <p className="text-xs text-stone-400">{avaliacao.cargo}</p>
                </div>
              </div>
              <div>
                <div className="border-t border-stone-300 pt-2 mt-8">
                  <p className="text-sm font-medium text-stone-700">{avaliacao.lider.name}</p>
                  <p className="text-xs text-stone-400">Líder</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-6 text-center">{hoje} · Tausttus Burger</p>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-stone-800">{value}</div>
    </div>
  );
}

function NotaRow({ comp, auto, lider, consenso }: { comp: string; auto: any; lider: any; consenso: any }) {
  const autoNota = auto?.notas?.[comp];
  const liderNota = lider?.notas?.[comp];
  const consensoNota = consenso?.notas?.[comp];

  return (
    <tr>
      <td className="py-2.5 pr-4 text-stone-700">{comp}</td>
      <td className="text-center py-2.5"><NotaCell nota={autoNota} /></td>
      <td className="text-center py-2.5"><NotaCell nota={liderNota} /></td>
      <td className="text-center py-2.5"><NotaCell nota={consensoNota} bold /></td>
    </tr>
  );
}

function NotaCell({ nota, bold }: { nota?: number; bold?: boolean }) {
  if (!nota) return <span className="text-stone-300">—</span>;
  const colors: Record<number, string> = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-green-100 text-green-700",
    5: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${bold ? "font-black" : "font-bold"} ${colors[nota] ?? ""}`}>
      {nota}
    </span>
  );
}
