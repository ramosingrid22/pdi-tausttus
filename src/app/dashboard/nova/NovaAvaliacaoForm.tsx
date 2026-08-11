"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Colaborador {
  id: string;
  name: string;
  cargo: string | null;
  unidade: string | null;
}

export function NovaAvaliacaoForm({ colaboradores, liderId }: { colaboradores: Colaborador[]; liderId: string | null }) {
  const router = useRouter();
  const [colaboradorId, setColaboradorId] = useState("");

  function periodoSugerido() {
    const now = new Date();
    const mes = now.getMonth(); // 0-11
    const ano = now.getFullYear();
    if (mes <= 2) return `Q1 ${ano} — Jan a Mar`;
    if (mes <= 5) return `Q2 ${ano} — Abr a Jun`;
    if (mes <= 8) return `Q3 ${ano} — Jul a Set`;
    return `Q4 ${ano} — Out a Dez`;
  }

  const [periodo, setPeriodo] = useState(periodoSugerido());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!colaboradorId) return;
    setLoading(true);
    setError("");

    const res = await fetch("/pdi/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, periodo, liderId }),
    });

    if (!res.ok) {
      setError("Erro ao criar avaliação.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Colaborador(a)</label>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Selecione...</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.cargo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Período</label>
          <input
            type="text"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Criando..." : "Criar avaliação"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
