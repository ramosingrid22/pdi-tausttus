"use client";

import { useState } from "react";
import Link from "next/link";

type Acao = {
  competencia: string;
  acao: string;
  prazo: string;
  prazoData: string;
  responsavel: string;
  vencida: boolean;
  diasRestantes: number | null;
  concluida: boolean;
  observacaoConclusao?: string;
  originalIndex: number;
};

type Grupo = {
  colaborador: string;
  unidade: string;
  lider: string;
  avaliacaoId: string;
  periodo: string;
  acoes: Acao[];
  temVencida: boolean;
  temUrgente: boolean;
};

export function AcompanhamentoClient({ grupos: initialGrupos }: { grupos: Grupo[] }) {
  const [grupos, setGrupos] = useState(initialGrupos);
  const [saving, setSaving] = useState<string | null>(null);
  // State for the "conclude" modal: { avaliacaoId, acaoIndex, observacao }
  const [concluding, setConcluding] = useState<{ avaliacaoId: string; acaoIndex: number; observacao: string } | null>(null);

  async function salvarConclusao() {
    if (!concluding) return;
    const { avaliacaoId, acaoIndex, observacao } = concluding;
    const key = `${avaliacaoId}-${acaoIndex}`;
    setSaving(key);
    setConcluding(null);

    await fetch(`/pdi/api/avaliacoes/${avaliacaoId}/acao-concluida`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acaoIndex, concluida: true, observacaoConclusao: observacao }),
    });

    setGrupos((prev) =>
      prev.map((g) =>
        g.avaliacaoId !== avaliacaoId ? g : {
          ...g,
          acoes: g.acoes.map((a) =>
            a.originalIndex === acaoIndex ? { ...a, concluida: true, observacaoConclusao: observacao } : a
          ),
        }
      )
    );
    setSaving(null);
  }

  async function reabrirAcao(avaliacaoId: string, acaoIndex: number) {
    const key = `${avaliacaoId}-${acaoIndex}`;
    setSaving(key);

    await fetch(`/pdi/api/avaliacoes/${avaliacaoId}/acao-concluida`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acaoIndex, concluida: false, observacaoConclusao: "" }),
    });

    setGrupos((prev) =>
      prev.map((g) =>
        g.avaliacaoId !== avaliacaoId ? g : {
          ...g,
          acoes: g.acoes.map((a) =>
            a.originalIndex === acaoIndex ? { ...a, concluida: false, observacaoConclusao: "" } : a
          ),
        }
      )
    );
    setSaving(null);
  }

  return (
    <>
      {/* Modal de conclusão */}
      {concluding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-stone-800">Concluir ação</h2>
            <p className="text-sm text-stone-500">
              Adicione uma observação sobre como foi a conclusão desta ação (opcional).
            </p>
            <textarea
              className="input-field text-sm resize-none w-full"
              rows={4}
              placeholder="Ex: treinamento realizado em 10/08, colaborador atingiu o objetivo proposto..."
              value={concluding.observacao}
              onChange={(e) => setConcluding({ ...concluding, observacao: e.target.value })}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setConcluding(null)} className="flex-1 btn-secondary text-sm">
                Cancelar
              </button>
              <button onClick={salvarConclusao} className="flex-1 bg-green-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-green-700 transition-colors">
                Confirmar conclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {grupos.map((g) => {
        const todasConcluidas = g.acoes.length > 0 && g.acoes.every((a) => a.concluida);
        const concluidas = g.acoes.filter((a) => a.concluida).length;

        return (
          <div
            key={g.avaliacaoId}
            className={`card space-y-4 ${
              todasConcluidas
                ? "border-l-4 border-green-400"
                : g.temVencida
                ? "border-l-4 border-red-400"
                : g.temUrgente
                ? "border-l-4 border-amber-400"
                : ""
            }`}
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800">{g.colaborador}</span>
                  {todasConcluidas && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      ✓ PDI concluído
                    </span>
                  )}
                  {!todasConcluidas && g.temVencida && (
                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      ⚠ Ação vencida
                    </span>
                  )}
                  {!todasConcluidas && !g.temVencida && g.temUrgente && (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      ⏰ Vence em breve
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {g.unidade} · Líder: {g.lider} · {g.periodo}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {concluidas}/{g.acoes.length} ações concluídas
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {todasConcluidas && (
                  <Link
                    href={`/avaliacao/${g.avaliacaoId}/conclusao`}
                    className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors"
                  >
                    📋 Ver prontuário
                  </Link>
                )}
                <Link
                  href={`/avaliacao/${g.avaliacaoId}/relatorio`}
                  className="text-xs text-brand-orange hover:underline"
                >
                  Ver relatório →
                </Link>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-stone-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: g.acoes.length > 0 ? `${(concluidas / g.acoes.length) * 100}%` : "0%" }}
              />
            </div>

            {/* Ações */}
            <div className="divide-y divide-stone-100">
              {g.acoes.map((a, i) => {
                const key = `${g.avaliacaoId}-${a.originalIndex}`;
                const isSaving = saving === key;

                const badgeColor = a.concluida
                  ? "bg-green-50 text-green-700"
                  : a.vencida
                  ? "bg-red-50 text-red-700"
                  : a.diasRestantes !== null && a.diasRestantes <= 15
                  ? "bg-amber-50 text-amber-700"
                  : a.prazoData
                  ? "bg-green-50 text-green-700"
                  : "";

                return (
                  <div key={i} className={`py-3 space-y-2 transition-opacity ${a.concluida ? "opacity-70" : ""}`}>
                    <div className="flex items-start gap-3 flex-wrap">
                      {/* Checkbox */}
                      <button
                        onClick={() => {
                          if (!a.concluida) {
                            setConcluding({ avaliacaoId: g.avaliacaoId, acaoIndex: a.originalIndex, observacao: "" });
                          }
                        }}
                        disabled={isSaving || a.concluida}
                        title={a.concluida ? "Concluída" : "Marcar como concluída"}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          a.concluida
                            ? "bg-green-500 border-green-500 text-white cursor-default"
                            : "border-stone-300 hover:border-green-400 cursor-pointer"
                        }`}
                      >
                        {a.concluida && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0 flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-stone-400 mb-0.5">{a.competencia}</div>
                          <div className={`text-sm text-stone-700 ${a.concluida ? "line-through" : ""}`}>{a.acao}</div>
                          {a.responsavel && (
                            <div className="text-xs text-stone-400 mt-0.5">Responsável: {a.responsavel}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {a.prazoData && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
                              {a.concluida
                                ? `Concluído · ${a.prazoData}`
                                : a.vencida
                                ? `Venceu ${a.prazoData} (${Math.abs(a.diasRestantes!)} dias atrás)`
                                : a.diasRestantes === 0
                                ? `Vence hoje — ${a.prazoData}`
                                : `${a.diasRestantes} dias — ${a.prazoData}`}
                            </span>
                          )}
                          {!a.prazoData && a.prazo && (
                            <span className="text-xs text-stone-400">{a.prazo}</span>
                          )}
                          {a.concluida && (
                            <button
                              onClick={() => reabrirAcao(g.avaliacaoId, a.originalIndex)}
                              disabled={isSaving}
                              className="text-xs text-stone-400 hover:text-amber-600 transition-colors underline"
                            >
                              Reabrir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Observação de conclusão */}
                    {a.concluida && a.observacaoConclusao && (
                      <div className="ml-8 bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-green-700">Observação: </span>
                        <span className="text-xs text-green-700">{a.observacaoConclusao}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
