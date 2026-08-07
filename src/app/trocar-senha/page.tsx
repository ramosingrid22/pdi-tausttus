"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function TrocarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (novaSenha.length < 6) { setError("Mínimo 6 caracteres."); return; }
    if (novaSenha !== confirma) { setError("As senhas não conferem."); return; }

    setLoading(true);
    const res = await fetch("/pdi/api/trocar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novaSenha }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Erro ao salvar.");
      setLoading(false);
      return;
    }

    // força novo login para atualizar o token
    await signOut({ callbackUrl: "/pdi/login" });
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-6">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Tausttus Burger / PDI</div>
            <h1 className="text-xl font-bold text-stone-800">Defina sua senha</h1>
            <p className="text-sm text-stone-500 mt-1">
              Este é seu primeiro acesso. Crie uma senha pessoal para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Confirmar senha</label>
              <input
                type="password"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                className="input-field"
                placeholder="Repita a senha"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Salvando..." : "Salvar e entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
