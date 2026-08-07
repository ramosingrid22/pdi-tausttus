"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReopenButton({ avaliacaoId }: { avaliacaoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReopen() {
    if (!confirm("Reabrir o consenso desta avaliação? O relatório atual será mantido até a conclusão do novo consenso.")) return;
    setLoading(true);
    const res = await fetch(`/pdi/api/avaliacoes/${avaliacaoId}/reabrir`, { method: "POST" });
    if (res.ok) {
      router.push(`/avaliacao/${avaliacaoId}/consenso`);
    } else {
      alert("Erro ao reabrir. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <button onClick={handleReopen} disabled={loading} className="btn-secondary text-sm">
      {loading ? "Reabrindo..." : "↩ Reabrir consenso"}
    </button>
  );
}
