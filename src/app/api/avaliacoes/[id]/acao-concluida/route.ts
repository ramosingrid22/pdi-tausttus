import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "LIDER") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { acaoIndex, concluida } = await req.json();

  const avaliacao = await prisma.avaliacao.findUnique({ where: { id: params.id } });
  if (!avaliacao || !avaliacao.consenso) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  const consenso = JSON.parse(avaliacao.consenso as string);
  const acoes = consenso.acoesDesenvolvimento ?? [];

  if (acaoIndex < 0 || acaoIndex >= acoes.length) {
    return NextResponse.json({ error: "Índice inválido" }, { status: 400 });
  }

  acoes[acaoIndex] = { ...acoes[acaoIndex], concluida };
  consenso.acoesDesenvolvimento = acoes;

  await prisma.avaliacao.update({
    where: { id: params.id },
    data: { consenso: JSON.stringify(consenso) },
  });

  return NextResponse.json({ ok: true });
}
