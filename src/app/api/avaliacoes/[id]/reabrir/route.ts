import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const avaliacao = await prisma.avaliacao.findUnique({ where: { id: params.id } });
  if (!avaliacao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  if (avaliacao.status !== "CONCLUIDA") return NextResponse.json({ error: "Apenas avaliações concluídas podem ser reabertas" }, { status: 400 });

  const updated = await prisma.avaliacao.update({
    where: { id: params.id },
    data: { status: "AGUARDANDO_CONSENSO" },
  });

  return NextResponse.json(updated);
}
