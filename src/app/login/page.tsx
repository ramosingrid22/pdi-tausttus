"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuário ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-brand-orange tracking-tight mb-1">TAUSTTUS</div>
          <div className="text-stone-400 text-sm font-medium tracking-widest uppercase">Avaliação de Desempenho</div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold text-stone-800 mb-6">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="seu.usuario"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-500 text-xs mt-6">
          Problemas de acesso? Fale com o RH.
        </p>
      </div>
    </div>
  );
}
