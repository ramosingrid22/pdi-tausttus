import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { FormAvaliacao } from "@/components/FormAvaliacao";
import { CARGOS } from "@/lib/competencias";

export default async function PreviewCargoPage({ params }: { params: { cargo: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const cargo = decodeURIComponent(params.cargo);
  if (!CARGOS.includes(cargo)) redirect("/admin/preview");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <FormAvaliacao
          avaliacaoId="preview"
          cargo={cargo}
          fase="autoavaliacao"
          colaboradorNome="Colaborador Exemplo"
          periodo="Agosto 2026"
          unidade="—"
          preview
        />
      </main>
    </div>
  );
}
