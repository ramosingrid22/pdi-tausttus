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

interface Avaliacao {
  id: string;
  cargo: string;
  periodo: string;
  unidade: string;
  colaborador: { name: string };
  lider: { name: string };
  autoavaliacao: any;
  avaliacaoLider: any;
}

const NOTA_LABELS: Record<number, string> = {
  1: "Precisa melhorar muito",
  2: "Precisa melhorar",
  3: "Atende ao esperado",
  4: "Acima do esperado",
  5: "Exemplo para a equipe",
};

export function ConsensoForm({ avaliacao }: { avaliacao: Avaliacao }) {
  const router = useRouter();
  const tecnicas = COMPETENCIAS_TECNICAS[avaliacao.cargo] ?? [];
  const todasCompetencias = [...COMPETENCIAS_COMPORTAMENTAIS, ...tecnicas];
  const allDescricoes = { ...DESCRICOES_COMPORTAMENTAIS, ...(DESCRICOES_TECNICAS[avaliacao.cargo] ?? {}) };

  const auto = avaliacao.autoavaliacao as any;
  const lider = avaliacao.avaliacaoLider as any;

  const initNotas = () => {
    const n: Record<string, number> = {};
    todasCompetencias.forEach((c) => {
      const autoNota = auto?.notas?.[c] ?? 0;
      const liderNota = lider?.notas?.[c] ?? 0;
      n[c] = Math.round((autoNota + liderNota) / 2) || 0;
    });
    return n;
  };

  const [notas, setNotas] = useState<Record<string, number>>(initNotas);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [acoesDesenvolvimento, setAcoesDesenvolvimento] = useState([
    { competencia: "", acao: "", prazo: "", responsavel: "" },
  ]);
  const [pontosFortes, setPontosFortes] = useState("");
  const [pontosMelhoria, setPontosMelhoria] = useState("");
  const [comentarioFinal, setComentarioFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addAcao() {
    setAcoesDesenvolvimento((prev) => [...prev, { competencia: "", acao: "", prazo: "", responsavel: "" }]);
  }

  function updateAcao(index: number, field: string, value: string) {
    setAcoesDesenvolvimento((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function removeAcao(index: number) {
    setAcoesDesenvolvimento((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const dados = { notas, acoesDesenvolvimento, pontosFortes, pontosMelhoria, comentarioFinal };
    const res = await fetch(`/pdi/api/avaliacoes/${avaliacao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase: "consenso", dados }),
    });
    if (!res.ok) { setError("Erro ao salvar consenso."); setLoading(false); return; }
    router.push(`/avaliacao/${avaliacao.id}/relatorio`);
  }

  const comportamentais = COMPETENCIAS_COMPORTAMENTAIS;
  const hasTecnicas = tecnicas.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-800">Reunião de Consenso</h1>
            <p className="text-stone-500 text-sm mt-1">
              {avaliacao.colaborador.name} · {avaliacao.cargo} · {avaliacao.unidade}
            </p>
          </div>
          <span className="text-xs font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            {avaliacao.periodo}
          </span>
        </div>
        <p className="text-sm text-stone-500 mt-4 border-t border-stone-100 pt-4">
          Para cada competência, veja as notas e comentários de cada parte. Ajuste a nota de consenso e, ao terminar, preencha o PDI.
        </p>
      </div>

      {/* Competências Comportamentais */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">
          Parte A — Competências Comportamentais
        </h2>
        {comportamentais.map((comp) => (
          <CompetenciaCard
            key={comp}
            comp={comp}
            desc={allDescricoes[comp]}
            auto={auto}
            lider={lider}
            nota={notas[comp]}
            isExpanded={expandido === comp}
            onToggle={() => setExpandido(expandido === comp ? null : comp)}
            onNota={(n) => setNotas((p) => ({ ...p, [comp]: n }))}
          />
        ))}
      </section>

      {/* Competências Técnicas */}
      {hasTecnicas && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">
            Parte B — Competências Técnicas — {avaliacao.cargo}
          </h2>
          {tecnicas.map((comp) => (
            <CompetenciaCard
              key={comp}
              comp={comp}
              desc={allDescricoes[comp]}
              auto={auto}
              lider={lider}
              nota={notas[comp]}
              isExpanded={expandido === comp}
              onToggle={() => setExpandido(expandido === comp ? null : comp)}
              onNota={(n) => setNotas((p) => ({ ...p, [comp]: n }))}
            />
          ))}
        </section>
      )}

      {/* Perguntas abertas */}
      {PERGUNTAS_COLABORADOR.some((_, i) => auto?.respostas?.[String(i)] || lider?.respostas?.[String(i)]) && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-stone-700">Parte C — Perguntas para Reflexão</h2>
          {PERGUNTAS_COLABORADOR.map((pergunta, i) => {
            const autoResp = auto?.respostas?.[String(i)];
            const liderPergunta = PERGUNTAS_LIDER[i];
            const liderResp = lider?.respostas?.[String(i)];
            if (!autoResp && !liderResp) return null;
            return (
              <div key={i} className="space-y-3 pt-4 border-t border-stone-100 first:border-0 first:pt-0">
                {autoResp && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-500 mb-2">Colaborador — {pergunta}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{autoResp}</p>
                  </div>
                )}
                {liderResp && liderPergunta && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 mb-2">Líder — {liderPergunta}</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{liderResp}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comentário geral */}
      {(auto?.comentarioGeral || lider?.comentarioGeral) && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-stone-700">Parte D — Comentário Geral</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {auto?.comentarioGeral && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-500 mb-2">Colaborador</p>
                <p className="text-sm text-stone-700 leading-relaxed">{auto.comentarioGeral}</p>
              </div>
            )}
            {lider?.comentarioGeral && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-600 mb-2">Líder</p>
                <p className="text-sm text-stone-700 leading-relaxed">{lider.comentarioGeral}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Síntese */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-stone-700">Síntese do Consenso</h2>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Pontos fortes reconhecidos</label>
          <textarea
            value={pontosFortes}
            onChange={(e) => setPontosFortes(e.target.value)}
            className="input-field min-h-[90px]"
            placeholder="O que o(a) colaborador(a) faz muito bem..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Pontos a desenvolver</label>
          <textarea
            value={pontosMelhoria}
            onChange={(e) => setPontosMelhoria(e.target.value)}
            className="input-field min-h-[90px]"
            placeholder="Onde há maior oportunidade de crescimento..."
          />
        </div>
      </div>

      {/* PDI */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-700">PDI — Ações de Desenvolvimento</h2>
          <button type="button" onClick={addAcao} className="text-sm text-brand-orange font-medium hover:underline">
            + Adicionar ação
          </button>
        </div>
        {acoesDesenvolvimento.map((acao, i) => (
          <div key={i} className="border border-stone-100 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Ação {i + 1}</span>
              {acoesDesenvolvimento.length > 1 && (
                <button type="button" onClick={() => removeAcao(i)} className="text-xs text-red-400 hover:text-red-600">
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5">Competência</label>
                <select value={acao.competencia} onChange={(e) => updateAcao(i, "competencia", e.target.value)} className="input-field text-sm">
                  <option value="">Selecione...</option>
                  {todasCompetencias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5">Prazo</label>
                <input type="text" value={acao.prazo} onChange={(e) => updateAcao(i, "prazo", e.target.value)} className="input-field text-sm" placeholder="ex: 30 dias, Out/2026" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1.5">Ação / O que fazer</label>
              <input type="text" value={acao.acao} onChange={(e) => updateAcao(i, "acao", e.target.value)} className="input-field text-sm" placeholder="Descreva a ação de desenvolvimento..." />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1.5">Responsável pelo apoio</label>
              <input type="text" value={acao.responsavel} onChange={(e) => updateAcao(i, "responsavel", e.target.value)} className="input-field text-sm" placeholder="Quem apoia? (líder, RH, próprio colaborador...)" />
            </div>
          </div>
        ))}
      </div>

      {/* Comentário final */}
      <div className="card">
        <h2 className="font-semibold text-stone-700 mb-3">Comentário Final</h2>
        <textarea
          value={comentarioFinal}
          onChange={(e) => setComentarioFinal(e.target.value)}
          className="input-field min-h-[90px]"
          placeholder="Observações gerais sobre a reunião de consenso..."
        />
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Salvando..." : "Concluir e gerar relatório"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Voltar</button>
      </div>
    </form>
  );
}

function CompetenciaCard({
  comp, desc, auto, lider, nota, isExpanded, onToggle, onNota,
}: {
  comp: string;
  desc: any;
  auto: any;
  lider: any;
  nota: number;
  isExpanded: boolean;
  onToggle: () => void;
  onNota: (n: number) => void;
}) {
  const autoNota = auto?.notas?.[comp] ?? 0;
  const liderNota = lider?.notas?.[comp] ?? 0;
  const autoComent = auto?.comentarios?.[comp];
  const liderComent = lider?.comentarios?.[comp];
  const diff = autoNota > 0 && liderNota > 0 && Math.abs(autoNota - liderNota) >= 2;

  return (
    <div className={`card space-y-4 ${diff ? "border-l-4 border-amber-400" : ""}`}>
      {/* Nome + toggle */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-stone-800">{comp}</span>
          {diff && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⚠ Divergência</span>}
          {desc && (
            <button type="button" onClick={onToggle} className="text-xs text-brand-orange hover:underline">
              {isExpanded ? "ocultar ▲" : "ver critérios ▼"}
            </button>
          )}
        </div>
        {desc && <p className="text-xs text-stone-400 mt-1">{desc.definicao}</p>}
      </div>

      {/* Critérios expandidos */}
      {isExpanded && desc && (
        <div className="rounded-xl border border-stone-100 overflow-hidden">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              onClick={() => onNota(n)}
              className={`flex gap-3 px-4 py-2.5 border-b border-stone-50 last:border-0 cursor-pointer hover:bg-stone-50 text-sm ${nota === n ? "bg-orange-50" : ""}`}
            >
              <span className={`font-bold w-4 shrink-0 ${nota === n ? "text-brand-orange" : "text-stone-300"}`}>{n}</span>
              <span className="text-stone-600">{desc.notas[n]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notas lado a lado */}
      <div className="grid grid-cols-3 gap-3">
        <NotaBox label="Colaborador" nota={autoNota} color="blue" />
        <NotaBox label="Líder" nota={liderNota} color="amber" />
        <div className="rounded-xl border-2 border-stone-200 p-3 text-center space-y-2">
          <p className="text-xs font-semibold text-stone-500">Consenso</p>
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onNota(n)}
                className={`nota-btn w-8 h-8 text-xs ${nota === n ? "nota-btn-selected" : "nota-btn-unselected"}`}
              >
                {n}
              </button>
            ))}
          </div>
          {nota > 0 && (
            <p className="text-xs text-brand-orange font-medium">{NOTA_LABELS[nota]}</p>
          )}
        </div>
      </div>

      {/* Comentários */}
      {(autoComent || liderComent) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {autoComent && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-500 mb-1.5">Colaborador</p>
              <p className="text-sm text-stone-700 leading-relaxed">{autoComent}</p>
            </div>
          )}
          {liderComent && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 mb-1.5">Líder</p>
              <p className="text-sm text-stone-700 leading-relaxed">{liderComent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotaBox({ label, nota, color }: { label: string; nota: number; color: "blue" | "amber" }) {
  const bg = color === "blue" ? "bg-blue-50" : "bg-amber-50";
  const text = color === "blue" ? "text-blue-500" : "text-amber-600";
  const notaColors: Record<number, string> = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-green-100 text-green-700",
    5: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className={`${bg} rounded-xl p-3 text-center space-y-2`}>
      <p className={`text-xs font-semibold ${text}`}>{label}</p>
      {nota > 0 ? (
        <>
          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-black ${notaColors[nota] ?? ""}`}>
            {nota}
          </span>
          <p className="text-xs text-stone-500">{NOTA_LABELS[nota]}</p>
        </>
      ) : (
        <span className="text-stone-300 text-lg">—</span>
      )}
    </div>
  );
}
