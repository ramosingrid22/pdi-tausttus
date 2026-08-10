"use client";
import { useState } from "react";

export function SinteseButton({ avaliacaoId }: { avaliacaoId: string }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function gerar() {
    setLoading(true);
    setErro("");
    const res = await fetch(`/pdi/api/avaliacoes/${avaliacaoId}/sintese`, { method: "POST" });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Erro desconhecido");
      setLoading(false);
    }
  }

  return (
    <div className="card border-l-4 border-stone-200">
      <p className="text-sm text-stone-500 mb-3">A síntese narrativa ainda não foi gerada para esta avaliação.</p>
      {erro && <p className="text-sm text-red-600 mb-3">{erro}</p>}
      <button onClick={gerar} disabled={loading} className="btn-primary text-sm">
        {loading ? "Gerando síntese..." : "✨ Gerar síntese narrativa com IA"}
      </button>
    </div>
  );
}
