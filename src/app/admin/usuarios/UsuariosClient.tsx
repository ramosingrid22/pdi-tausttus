"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CARGOS = [
  "Atendente", "Auxiliar de Cozinha", "Cozinheiro(a)", "Delivery",
  "Líder", "Supervisor(a)", "Analista Administrativo", "Auxiliar Administrativo",
];

const ROLE_LABELS: Record<string, string> = {
  COLABORADOR: "Colaborador", LIDER: "Líder", ADMIN: "Admin",
};

type User = {
  id: string; name: string; username: string; role: string;
  cargo: string | null; unidade: string | null; liderId: string | null;
  lider?: { id: string; name: string } | null;
};

const emptyForm = { name: "", username: "", password: "", role: "COLABORADOR", cargo: "", unidade: "", liderId: "" };

export function UsuariosClient({ initialUsers, lideres }: { initialUsers: User[]; lideres: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<User | null>(null);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, password: "", role: u.role, cargo: u.cargo ?? "", unidade: u.unidade ?? "", liderId: u.liderId ?? "" });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: any = { ...form };
    if (!body.password) delete body.password;
    if (!body.cargo) body.cargo = null;
    if (!body.unidade) body.unidade = null;
    if (!body.liderId) body.liderId = null;

    try {
      const res = await fetch(editing ? `/pdi/api/usuarios/${editing.id}` : "/pdi/api/usuarios", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar");
        setLoading(false);
        return;
      }
      setShowForm(false);
      router.refresh();
      const updated = await fetch("/pdi/api/usuarios").then((r) => r.json());
      setUsers(updated);
    } catch {
      setError("Erro de conexão");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/pdi/api/usuarios/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDelete(null);
    setLoading(false);
  }

  async function handleReset(u: User) {
    setLoading(true);
    await fetch(`/pdi/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: true, username: u.username }),
    });
    setConfirmReset(null);
    setLoading(false);
    const firstName = u.username.split(".")[0];
    alert(`Senha resetada para: ${firstName}@1234\nO usuário será solicitado a redefinir no próximo acesso.`);
  }

  const roleColor: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    LIDER: "bg-blue-100 text-blue-700",
    COLABORADOR: "bg-stone-100 text-stone-600",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Usuários</h1>
          <p className="text-stone-500 text-sm mt-1">{users.length} cadastrado{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm">+ Novo usuário</button>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center font-bold text-brand-orange text-sm">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-stone-800">{u.name}</div>
                <div className="text-xs text-stone-400 mt-0.5">
                  @{u.username}
                  {u.cargo && <> · {u.cargo}</>}
                  {u.unidade && <> · {u.unidade}</>}
                  {u.lider && <> · Líder: {u.lider.name}</>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[u.role] ?? ""}`}>
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
              <button onClick={() => setConfirmReset(u)} className="text-xs text-stone-400 hover:text-amber-500 transition-colors">Resetar senha</button>
              <button onClick={() => openEdit(u)} className="text-xs text-stone-400 hover:text-brand-orange transition-colors">Editar</button>
              <button onClick={() => setConfirmDelete(u.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-5">
              {editing ? "Editar usuário" : "Novo usuário"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome completo</label>
                <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Usuário (login)</label>
                <input className="input-field" required disabled={!!editing} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ex: joao.silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Senha {editing && <span className="text-stone-400 font-normal">(deixe em branco para manter)</span>}
                </label>
                <input className="input-field" type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Função</label>
                  <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="COLABORADOR">Colaborador</option>
                    <option value="LIDER">Líder</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cargo</label>
                  <select className="input-field" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}>
                    <option value="">— nenhum —</option>
                    {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Unidade</label>
                <input className="input-field" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} placeholder="ex: Centro, Norte" />
              </div>
              {form.role === "COLABORADOR" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Líder responsável</label>
                  <select className="input-field" value={form.liderId} onChange={(e) => setForm({ ...form, liderId: e.target.value })}>
                    <option value="">— nenhum —</option>
                    {lideres.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary">
                  {loading ? "Salvando..." : editing ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar reset de senha */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Resetar senha?</h2>
            <p className="text-stone-500 text-sm mb-1">
              A senha de <strong>{confirmReset.name}</strong> será redefinida para:
            </p>
            <p className="font-mono bg-stone-100 rounded-lg px-4 py-2 text-stone-800 font-bold mb-5">
              {confirmReset.username.split(".")[0]}@1234
            </p>
            <p className="text-stone-400 text-xs mb-5">O usuário precisará criar uma nova senha no próximo acesso.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={() => handleReset(confirmReset)} disabled={loading} className="flex-1 bg-amber-500 text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-amber-600 transition-colors">
                {loading ? "Resetando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Excluir usuário?</h2>
            <p className="text-stone-500 text-sm mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={loading} className="flex-1 bg-red-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-red-700 transition-colors">
                {loading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
