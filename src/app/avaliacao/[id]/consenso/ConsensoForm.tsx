"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPETENCIAS_COMPORTAMENTAIS, COMPETENCIAS_TECNICAS, PERGUNTAS_COLABORADOR, PERGUNTAS_LIDER } from "@/lib/competencias";

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

export function ConsensoForm({ avaliacao }: { avaliacao: Avaliacao }) {
  const router = useRouter();
  const tecnicas = COMPETENCIAS_TECNICAS[avaliacao.cargo] ?? [];
  const todasCompetencias = [...COMPETENCIAS_COMPORTAMENTAIS, ...tecnicas];

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
  const [acoesDesenvolvimento, setAcoesDesenvolvimento] = useState([
    { competencia: "", acao: "", prazo: "", responsavel: "" },
  ]);
  const [pontosFortes, setPontosFortes] = useState("");
  const [pontosMelhoria, setPontosMelhoria] = useState("");
  const [comentarioFinal, setComentarioFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addAcao() {
    setAcoesDesenvolvimento((prev) => [
      ...prev,
      { competencia: "", acao: "", prazo: "", responsavel: "" },
    ]);
  }

  function updateAcao(index: number, field: string, value: string) {
    setAcoesDesenvolvimento((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
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

    if (!res.ok) {
      setError("Erro ao salvar consenso.");
      setLoading(false);
      return;
    }

    router.push(`/avaliacao/${avaliacao.id}/relatorio`);
  }

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
          Revise as notas comparativas e ajuste para a nota de consenso. Depois, defina as ações de desenvolvimento do PDI.
        </p>
      </div>

      {/* Comparativo de notas */}
      <div className="card">
        <h2 className="font-semibold text-stone-700 mb-4">Notas Comparativas — Ajuste o Consenso</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide">
                <th className="text-left pb-3">Competência</th>
                <th className="text-center pb-3">Colaborador</th>
                <th className="text-center pb-3">Líder</th>
                <th className="text-center pb-3">Consenso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {todasCompetencias.map((comp) => {
                const autoNota = auto?.notas?.[comp] ?? "—";
                const liderNota = lider?.notas?.[comp] ?? "—";
                const diff = typeof autoNota === "number" && typeof liderNota === "number" && Math.abs(autoNota - liderNota) >= 2;
                return (
                  <tr key={comp} className={diff ? "bg-amber-50" : ""}>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-stone-700">{comp}</span>
                      {diff && <span className="ml-2 text-xs text-amber-600">⚠ Divergência</span>}
                    </td>
                    <td className="text-center py-2.5">
                      <NotaBadge nota={autoNota} />
                    </td>
                    <td className="text-center py-2.5">
                      <NotaBadge nota={liderNota} />
                    </td>
                    <td className="text-center py-2.5">
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNotas((p) => ({ ...p, [comp]: n }))}
                            className={`nota-btn w-8 h-8 text-xs ${notas[comp] === n ? "nota-btn-selected" : "nota-btn-unselected"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Respostas escritas — comparativo */}
      <div className="card space-y-6">
        <h2 className="font-semibold text-stone-700">Respostas Escritas — Comparativo</h2>

        {/* Comentários por competência */}
        {todasCompetencias.some((c) => auto?.comentarios?.[c] || lider?.comentarios?.[c]) && (
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Comentários por competência</h3>
            <div className="space-y-3">
              {todasCompetencias.map((comp) => {
                const autoComent = auto?.comentarios?.[comp];
                const liderComent = lider?.comentarios?.[comp];
                if (!autoComent && !liderComent) return null;
                return (
                  <div key={comp} className="border border-stone-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-stone-500 mb-2">{comp}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {autoComent && (
                        <div className="bg-blue-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-blue-500 font-medium mb-1">Colaborador</p>
                          <p className="text-sm text-stone-700">{autoComent}</p>
                        </div>
                      )}
                      {liderComent && (
                        <div className="bg-amber-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-amber-600 font-medium mb-1">Líder</p>
                          <p className="text-sm text-stone-700">{liderComent}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Perguntas abertas */}
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Perguntas abertas</h3>
          <div className="space-y-4">
            {PERGUNTAS_COLABORADOR.map((pergunta, i) => {
              const autoResp = auto?.respostas?.[pergunta];
              const liderPergunta = PERGUNTAS_LIDER[i];
              const liderResp = lider?.respostas?.[liderPergunta];
              if (!autoResp && !liderResp) return null;
              return (
                <div key={i} className="border border-stone-100 rounded-lg p-3 space-y-2">
                  {autoResp && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-500 font-medium mb-1">Colaborador — {pergunta}</p>
                      <p className="text-sm text-stone-700">{autoResp}</p>
                    </div>
                  )}
                  {liderResp && liderPergunta && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-600 font-medium mb-1">Líder — {liderPergunta}</p>
                      <p className="text-sm text-stone-700">{liderResp}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comentário geral */}
        {(auto?.comentarioGeral || lider?.comentarioGeral) && (
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Comentário geral</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {auto?.comentarioGeral && (
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-blue-500 font-medium mb-1">Colaborador</p>
                  <p className="text-sm text-stone-700">{auto.comentarioGeral}</p>
                </div>
              )}
              {lider?.comentarioGeral && (
                <div className="bg-amber-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-600 font-medium mb-1">Líder</p>
                  <p className="text-sm text-stone-700">{lider.comentarioGeral}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pontos fortes e melhoria */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-stone-700">Síntese do Consenso</h2>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Pontos fortes reconhecidos</label>
          <textarea
            value={pontosFortes}
            onChange={(e) => setPontosFortes(e.target.value)}
            className="input-field min-h-[80px]"
            placeholder="O que o(a) colaborador(a) faz muito bem..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Pontos a desenvolver</label>
          <textarea
            value={pontosMelhoria}
            onChange={(e) => setPontosMelhoria(e.target.value)}
            className="input-field min-h-[80px]"
            placeholder="Onde há maior oportunidade de crescimento..."
          />
        </div>
      </div>

      {/* PDI — Ações */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-700">PDI — Ações de Desenvolvimento</h2>
          <button type="button" onClick={addAcao} className="text-sm text-brand-orange font-medium hover:underline">
            + Adicionar ação
          </button>
        </div>

        {acoesDesenvolvimento.map((acao, i) => (
          <div key={i} className="border border-stone-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 uppercase">Ação {i + 1}</span>
              {acoesDesenvolvimento.length > 1 && (
                <button type="button" onClick={() => removeAcao(i)} className="text-xs text-red-400 hover:text-red-600">
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Competência</label>
                <select
                  value={acao.competencia}
                  onChange={(e) => updateAcao(i, "competencia", e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Selecione...</option>
                  {todasCompetencias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Prazo</label>
                <input
                  type="text"
                  value={acao.prazo}
                  onChange={(e) => updateAcao(i, "prazo", e.target.value)}
                  className="input-field text-sm"
                  placeholder="ex: 30 dias, Out/2026"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Ação / O que fazer</label>
              <input
                type="text"
                value={acao.acao}
                onChange={(e) => updateAcao(i, "acao", e.target.value)}
                className="input-field text-sm"
                placeholder="Descreva a ação de desenvolvimento..."
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Responsável pelo apoio</label>
              <input
                type="text"
                value={acao.responsavel}
                onChange={(e) => updateAcao(i, "responsavel", e.target.value)}
                className="input-field text-sm"
                placeholder="Quem apoia? (líder, RH, próprio colaborador...)"
              />
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
          className="input-field min-h-[80px]"
          placeholder="Observações gerais sobre a reunião de consenso..."
        />
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Salvando..." : "Concluir e gerar relatório"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Voltar
        </button>
      </div>
    </form>
  );
}

function NotaBadge({ nota }: { nota: number | string }) {
  if (nota === "—" || nota === 0) return <span className="text-stone-300">—</span>;
  const colors: Record<number, string> = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-green-100 text-green-700",
    5: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${colors[nota as number] ?? ""}`}>
      {nota}
    </span>
  );
}
