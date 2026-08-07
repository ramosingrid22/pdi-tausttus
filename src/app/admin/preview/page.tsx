import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CARGOS } from "@/lib/competencias";
import Link from "next/link";

export default async function PreviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-stone-800 mb-1">Preview dos formulários</h1>
        <p className="text-sm text-stone-500 mb-8">Visualize as questões de cada cargo sem criar uma avaliação real.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CARGOS.map((cargo) => (
            <Link
              key={cargo}
              href={`/admin/preview/${encodeURIComponent(cargo)}`}
              className="card hover:border-brand-orange hover:shadow-md transition-all border border-stone-100 flex items-center justify-between group"
            >
              <span className="font-medium text-stone-700 group-hover:text-brand-orange">{cargo}</span>
              <span className="text-stone-300 group-hover:text-brand-orange">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
