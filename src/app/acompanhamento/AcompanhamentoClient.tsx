"use client";

import { useState } from "react";

type Acao = {
  competencia: string;
  acao: string;
  prazo: string;
  prazoData: string;
  responsavel: string;
  vencida: boolean;
  diasRestantes: number | null;
  concluida: boolean;
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

  async function toggleConcluida(avaliacaoId: string, acaoIndex: number, concluida: boolean) {
    const key = `${avaliacaoId}-${acaoIndex}`;
    setSaving(key);

    await fetch(`/pdi/api/avaliacoes/${avaliacaoId}/acao-concluida`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acaoIndex, concluida }),
    });

    setGrupos((prev) =>
      prev.map((g) => {
        if (g.avaliacaoId !== avaliacaoId) return g;
        return {
          ...g,
          acoes: g.acoes.map((a) =>
            a.originalIndex === acaoIndex ? { ...a, concluida } : a
          ),
        };
      })
    );

    setSaving(null);
  }

  return (
    <>
      {grupos.map((g) => {
        const todasConcluidas = g.acoes.every((a) => a.concluida);
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
              <div className="flex items-center gap-3 shrink-0">
                {todasConcluidas && (
                  <a
                    href={`/avaliacao/${g.avaliacaoId}/conclusao`}
                    className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Ver prontuário →
                  </a>
                )}
                <a
                  href={`/avaliacao/${g.avaliacaoId}/relatorio`}
                  className="text-xs text-brand-orange hover:underline"
                >
                  Ver relatório →
                </a>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-stone-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${(concluidas / g.acoes.length) * 100}%` }}
              />
            </div>

            {/* Ações */}
            <div className="divide-y divide-stone-100">
              {g.acoes.map((a, i) => {
                const key = `${g.avaliacaoId}-${a.originalIndex}`;
                const isSaving = saving === key;

                const statusColor = a.concluida
                  ? "bg-green-50 text-green-700 line-through opacity-60"
                  : a.vencida
                  ? "bg-red-50 text-red-700"
                  : a.diasRestantes !== null && a.diasRestantes <= 15
                  ? "bg-amber-50 text-amber-700"
                  : a.prazoData
                  ? "bg-green-50 text-green-700"
                  : "";

                return (
                  <div
                    key={i}
                    className={`py-3 flex items-start gap-3 flex-wrap transition-opacity ${a.concluida ? "opacity-60" : ""}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleConcluida(g.avaliacaoId, a.originalIndex, !a.concluida)}
                      disabled={isSaving}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        a.concluida
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-stone-300 hover:border-green-400"
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
                      {a.prazoData && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor}`}>
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
                        <span className="text-xs text-stone-400 shrink-0">{a.prazo}</span>
                      )}
                    </div>
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
