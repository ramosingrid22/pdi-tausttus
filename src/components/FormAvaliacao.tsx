"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPETENCIAS_COMPORTAMENTAIS,
  COMPETENCIAS_TECNICAS,
  DESCRICOES_COMPORTAMENTAIS,
  DESCRICOES_TECNICAS,
  PERGUNTAS_COLABORADOR,
  PERGUNTAS_LIDER,
} from "@/lib/competencias";

interface Props {
  avaliacaoId: string;
  cargo: string;
  fase: "autoavaliacao" | "lider";
  colaboradorNome: string;
  periodo: string;
  unidade: string;
  preview?: boolean;
}

export function FormAvaliacao({ avaliacaoId, cargo, fase, colaboradorNome, periodo, unidade, preview }: Props) {
  const router = useRouter();
  const tecnicas = COMPETENCIAS_TECNICAS[cargo] ?? [];
  const perguntas = fase === "autoavaliacao" ? PERGUNTAS_COLABORADOR : PERGUNTAS_LIDER;

  const initNotas = () => {
    const n: Record<string, number> = {};
    [...COMPETENCIAS_COMPORTAMENTAIS, ...tecnicas].forEach((c) => (n[c] = 0));
    return n;
  };

  const [notas, setNotas] = useState<Record<string, number>>(initNotas);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [comentarioGeral, setComentarioGeral] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setNota(comp: string, nota: number) {
    setNotas((prev) => ({ ...prev, [comp]: nota }));
  }

  function canSubmit() {
    return [...COMPETENCIAS_COMPORTAMENTAIS, ...tecnicas].every((c) => notas[c] > 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) {
      setError("Preencha todas as notas antes de enviar.");
      return;
    }
    if (preview) return;
    setLoading(true);
    setError("");

    const dados = { notas, comentarios, respostas, comentarioGeral };

    const res = await fetch(`/pdi/api/avaliacoes/${avaliacaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase, dados }),
    });

    if (!res.ok) {
      setError("Erro ao salvar. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const faseLabel = fase === "autoavaliacao" ? "Autoavaliação" : "Avaliação do Líder";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {preview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 font-medium">
          👁 Modo visualização — este formulário não será salvo
        </div>
      )}
      {/* Cabeçalho */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-800">{faseLabel}</h1>
            <p className="text-stone-500 text-sm mt-1">
              {colaboradorNome} · {cargo} · {unidade}
            </p>
          </div>
          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {periodo}
          </span>
        </div>
        {fase === "autoavaliacao" && (
          <p className="text-sm text-stone-500 mt-4 border-t border-stone-100 pt-4">
            Seja honesto(a) e use exemplos reais do seu dia a dia. Não existe "resposta certa" — o objetivo é refletir sobre o seu próprio trabalho.
          </p>
        )}
        {fase === "lider" && (
          <p className="text-sm text-stone-500 mt-4 border-t border-stone-100 pt-4">
            Use fatos e exemplos concretos, evitando opiniões genéricas. O colaborador não verá esta avaliação antes da reunião de consenso.
          </p>
        )}
      </div>

      {/* Parte A — Comportamentais */}
      <CompetenciasSection
        titulo="Parte A — Competências Comportamentais"
        competencias={COMPETENCIAS_COMPORTAMENTAIS}
        descricoes={DESCRICOES_COMPORTAMENTAIS}
        notas={notas}
        comentarios={comentarios}
        onNota={setNota}
        onComentario={(c, v) => setComentarios((p) => ({ ...p, [c]: v }))}
      />

      {/* Parte B — Técnicas */}
      {tecnicas.length > 0 && (
        <CompetenciasSection
          titulo="Parte B — Competências Técnicas do Cargo"
          competencias={tecnicas}
          descricoes={DESCRICOES_TECNICAS[cargo] ?? {}}
          notas={notas}
          comentarios={comentarios}
          onNota={setNota}
          onComentario={(c, v) => setComentarios((p) => ({ ...p, [c]: v }))}
        />
      )}

      {/* Parte C — Perguntas */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-stone-700">Parte C — Perguntas para Reflexão</h2>
        {perguntas.map((pergunta, i) => (
          <div key={i}>
            <label className="block text-sm text-stone-700 mb-1.5">
              <span className="font-medium">{i + 1}.</span> {pergunta}
            </label>
            <textarea
              value={respostas[String(i)] ?? ""}
              onChange={(e) => setRespostas((p) => ({ ...p, [String(i)]: e.target.value }))}
              className="input-field min-h-[80px] resize-y"
              placeholder="Sua resposta..."
            />
          </div>
        ))}
      </div>

      {/* Parte D — Comentário geral */}
      <div className="card">
        <h2 className="font-semibold text-stone-700 mb-3">Parte D — Comentário Geral (opcional)</h2>
        <textarea
          value={comentarioGeral}
          onChange={(e) => setComentarioGeral(e.target.value)}
          className="input-field min-h-[100px] resize-y"
          placeholder="Alguma observação adicional..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex gap-3 pb-8">
        {!preview && (
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enviando..." : "Enviar avaliação"}
          </button>
        )}
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          {preview ? "← Voltar" : "Voltar"}
        </button>
      </div>
    </form>
  );
}

const NOTA_LABELS: Record<number, string> = {
  1: "Precisa melhorar muito",
  2: "Precisa melhorar",
  3: "Atende ao esperado",
  4: "Acima do esperado",
  5: "Exemplo para a equipe",
};

function CompetenciasSection({
  titulo,
  competencias,
  descricoes,
  notas,
  comentarios,
  onNota,
  onComentario,
}: {
  titulo: string;
  competencias: string[];
  descricoes: Record<string, { definicao: string; notas: Record<number, string> }>;
  notas: Record<string, number>;
  comentarios: Record<string, string>;
  onNota: (c: string, n: number) => void;
  onComentario: (c: string, v: string) => void;
}) {
  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <div className="card space-y-6">
      <h2 className="font-semibold text-stone-700">{titulo}</h2>
      {competencias.map((comp) => {
        const desc = descricoes[comp];
        const notaSelecionada = notas[comp];
        const isExpanded = expandido === comp;

        return (
          <div key={comp} className="border-b border-stone-100 pb-5 last:border-0 last:pb-0">
            {/* Nome + botões de nota */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-800">{comp}</span>
                  {desc && (
                    <button
                      type="button"
                      onClick={() => setExpandido(isExpanded ? null : comp)}
                      className="text-xs text-brand-orange hover:underline"
                    >
                      {isExpanded ? "menos ▲" : "ver descrição ▼"}
                    </button>
                  )}
                </div>
                {desc && (
                  <p className="text-xs text-stone-400 mt-0.5">{desc.definicao}</p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    title={desc?.notas[n] ?? NOTA_LABELS[n]}
                    onClick={() => onNota(comp, n)}
                    className={`nota-btn ${notaSelecionada === n ? "nota-btn-selected" : "nota-btn-unselected"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Significado da nota selecionada */}
            {notaSelecionada > 0 && desc?.notas[notaSelecionada] && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-2">
                <span className="text-xs font-semibold text-brand-orange">{NOTA_LABELS[notaSelecionada]}:</span>
                <span className="text-xs text-stone-600 ml-1">{desc.notas[notaSelecionada]}</span>
              </div>
            )}

            {/* Tabela expandida com todas as notas */}
            {isExpanded && desc && (
              <div className="mb-3 rounded-lg border border-stone-100 overflow-hidden">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`flex gap-3 px-3 py-2 text-xs border-b border-stone-50 last:border-0 cursor-pointer hover:bg-stone-50 ${notaSelecionada === n ? "bg-orange-50" : ""}`}
                    onClick={() => onNota(comp, n)}
                  >
                    <span className={`font-bold w-4 shrink-0 ${notaSelecionada === n ? "text-brand-orange" : "text-stone-400"}`}>{n}</span>
                    <div>
                      <span className="font-semibold text-stone-600">{NOTA_LABELS[n]}: </span>
                      <span className="text-stone-500">{desc.notas[n]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              value={comentarios[comp] ?? ""}
              onChange={(e) => onComentario(comp, e.target.value)}
              className="input-field text-sm"
              placeholder="Comentário ou exemplo concreto (opcional)"
            />
          </div>
        );
      })}
    </div>
  );
}
