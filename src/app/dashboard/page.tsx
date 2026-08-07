import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkMustChangePassword } from "@/lib/checkMustChangePassword";
import { Header } from "@/components/Header";
import { Saudacao } from "@/components/Saudacao";
import Link from "next/link";

const STATUS_LABELS_COLABORADOR: Record<string, { label: string; color: string }> = {
  AGUARDANDO_COLABORADOR: { label: "Aguardando você",     color: "bg-amber-100 text-amber-800" },
  AGUARDANDO_LIDER:       { label: "Aguardando líder",    color: "bg-blue-100 text-blue-800" },
  AGUARDANDO_CONSENSO:    { label: "Reunião de consenso", color: "bg-purple-100 text-purple-800" },
  CONCLUIDA:              { label: "Concluída",           color: "bg-green-100 text-green-800" },
};

const STATUS_LABELS_LIDER: Record<string, { label: string; color: string }> = {
  AGUARDANDO_COLABORADOR: { label: "Aguardando colaborador", color: "bg-amber-100 text-amber-800" },
  AGUARDANDO_LIDER:       { label: "Aguardando você",        color: "bg-blue-100 text-blue-800" },
  AGUARDANDO_CONSENSO:    { label: "Reunião de consenso",    color: "bg-purple-100 text-purple-800" },
  CONCLUIDA:              { label: "Concluída",              color: "bg-green-100 text-green-800" },
};

function statusParaFase(status: string, role: string) {
  if (status === "AGUARDANDO_COLABORADOR" && role === "COLABORADOR") return "autoavaliacao";
  if (status === "AGUARDANDO_LIDER" && (role === "LIDER" || role === "ADMIN")) return "lider";
  if (status === "AGUARDANDO_CONSENSO" && (role === "LIDER" || role === "ADMIN")) return "consenso";
  if (status === "CONCLUIDA") return "relatorio";
  return "relatorio";
}

export default async function Dashboard() {
  await checkMustChangePassword();
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN";
  const isLider = user.role === "LIDER";

  let avaliacoes: any[] = [];

  if (isAdmin) {
    avaliacoes = await prisma.avaliacao.findMany({
      include: {
        colaborador: { select: { name: true, cargo: true } },
        lider: { select: { name: true } },
      },
      orderBy: { colaborador: { name: "asc" } },
    });
  } else if (isLider) {
    // líder vê a própria avaliação (como colaborador) + avaliações onde é o líder
    avaliacoes = await prisma.avaliacao.findMany({
      where: { OR: [{ colaboradorId: user.id }, { liderId: user.id }] },
      include: {
        colaborador: { select: { name: true, cargo: true } },
        lider: { select: { name: true } },
      },
      orderBy: { colaborador: { name: "asc" } },
    });
  } else {
    avaliacoes = await prisma.avaliacao.findMany({
      where: { colaboradorId: user.id },
      include: {
        colaborador: { select: { name: true, cargo: true } },
        lider: { select: { name: true } },
      },
      orderBy: { colaborador: { name: "asc" } },
    });
  }

  const primeiroNome = user.name?.split(" ")[0] ?? "";
  const pendentes = avaliacoes.filter((a) => a.status !== "CONCLUIDA");
  const concluidasList = avaliacoes.filter((a) => a.status === "CONCLUIDA");

  // ── Vista simplificada para colaboradores e líderes ──
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="bg-brand-dark text-white px-6 pt-6 pb-8">
          <div className="max-w-2xl mx-auto">
            <Saudacao nome={primeiroNome} />
            <p className="text-stone-400 text-sm mt-1">Avaliações de Desempenho · Agosto 2026</p>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-4 -mt-4 pb-12">

          {pendentes.length > 0 && (
            <section className="mb-6">
              {pendentes.length > 0 && !isLider && (
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-3 mt-6">Sua avaliação</p>
              )}
              {isLider && (
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-3 mt-2">Em andamento</p>
              )}
              <div className="space-y-2">
                {pendentes.map((av) => {
                  const fase = statusParaFase(av.status, user.role);
                  const isOwnEval = av.colaboradorId === user.id;
                  const labels = isOwnEval ? STATUS_LABELS_COLABORADOR : STATUS_LABELS_LIDER;
                  const st = labels[av.status];
                  return (
                    <Link key={av.id} href={`/avaliacao/${av.id}/${fase}`}
                      className="card flex items-center justify-between hover:border-brand-orange transition-colors group">
                      <div>
                        <div className="font-semibold text-stone-800 group-hover:text-brand-orange transition-colors">
                          {isOwnEval ? "Minha Avaliação de Desempenho" : av.colaborador.name}
                        </div>
                        <div className="text-sm text-stone-400 mt-0.5">
                          {av.colaborador.cargo} · {av.periodo}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {concluidasList.length > 0 && (
            <section>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Concluídas</p>
              <div className="space-y-2">
                {concluidasList.map((av) => (
                  <Link key={av.id} href={`/avaliacao/${av.id}/relatorio`}
                    className="card flex items-center justify-between hover:border-brand-orange transition-colors group opacity-75 hover:opacity-100">
                    <div>
                      <div className="font-semibold text-stone-800 group-hover:text-brand-orange">
                        {av.colaboradorId === user.id ? "Minha Avaliação de Desempenho" : av.colaborador.name}
                      </div>
                      <div className="text-sm text-stone-400 mt-0.5">{av.colaborador.cargo} · {av.periodo}</div>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-800 shrink-0">
                      Ver relatório
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {avaliacoes.length === 0 && (
            <div className="text-center py-20 text-stone-300">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg font-semibold text-stone-400">Nenhuma avaliação ainda.</p>
              {!isLider && (
                <p className="text-sm mt-2 text-stone-400">Seu líder iniciará sua avaliação em breve.</p>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── Vista completa para admin ──
  const total     = avaliacoes.length;
  const andamento = pendentes.length;
  const concluidas = concluidasList.length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="bg-brand-dark text-white px-6 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Saudacao nome={primeiroNome} />
          <p className="text-stone-400 text-sm mt-1">Avaliações de Desempenho · Agosto 2026</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-4 pb-12">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center !p-3 sm:!p-6">
            <div className="text-2xl sm:text-3xl font-black text-stone-800">{total}</div>
            <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Total</div>
          </div>
          <div className="card text-center !p-3 sm:!p-6">
            <div className="text-2xl sm:text-3xl font-black text-amber-500">{andamento}</div>
            <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Andamento</div>
          </div>
          <div className="card text-center !p-3 sm:!p-6">
            <div className="text-2xl sm:text-3xl font-black text-green-500">{concluidas}</div>
            <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Concluídas</div>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Link href="/dashboard/nova" className="btn-primary text-sm">+ Nova avaliação</Link>
        </div>

        {pendentes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Em andamento</h2>
            <div className="space-y-2">
              {pendentes.map((av) => {
                const fase = statusParaFase(av.status, user.role);
                const st = STATUS_LABELS_LIDER[av.status];
                return (
                  <Link key={av.id} href={`/avaliacao/${av.id}/${fase}`}
                    className="card flex items-center justify-between hover:border-brand-orange transition-colors group">
                    <div>
                      <div className="font-semibold text-stone-800 group-hover:text-brand-orange transition-colors">
                        {av.colaborador.name}
                      </div>
                      <div className="text-sm text-stone-400 mt-0.5">
                        {av.colaborador.cargo} · {av.periodo} · Líder: {av.lider.name}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${st.color}`}>
                      {st.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {concluidasList.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Concluídas</h2>
            <div className="space-y-2">
              {concluidasList.map((av) => (
                <Link key={av.id} href={`/avaliacao/${av.id}/relatorio`}
                  className="card flex items-center justify-between hover:border-brand-orange transition-colors group opacity-75 hover:opacity-100">
                  <div>
                    <div className="font-semibold text-stone-800 group-hover:text-brand-orange">
                      {av.colaborador.name}
                    </div>
                    <div className="text-sm text-stone-400 mt-0.5">{av.colaborador.cargo} · {av.periodo}</div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-800 shrink-0">
                    Ver relatório
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {avaliacoes.length === 0 && (
          <div className="text-center py-20 text-stone-300">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-semibold text-stone-400">Nenhuma avaliação ainda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
