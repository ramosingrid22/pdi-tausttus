import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  let avaliacoes;
  if (role === "ADMIN") {
    avaliacoes = await prisma.avaliacao.findMany({
      include: { colaborador: { select: { name: true, cargo: true } }, lider: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
  } else if (role === "LIDER") {
    avaliacoes = await prisma.avaliacao.findMany({
      where: { liderId: userId },
      include: { colaborador: { select: { name: true, cargo: true } }, lider: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
  } else {
    avaliacoes = await prisma.avaliacao.findMany({
      where: { colaboradorId: userId },
      include: { colaborador: { select: { name: true, cargo: true } }, lider: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  return NextResponse.json(avaliacoes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "LIDER") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { colaboradorId, periodo, unidade } = body;

  const colaborador = await prisma.user.findUnique({ where: { id: colaboradorId } });
  if (!colaborador) return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 404 });

  const liderId = role === "ADMIN" ? (body.liderId || (session.user as any).id) : (session.user as any).id;

  const avaliacao = await prisma.avaliacao.create({
    data: {
      colaboradorId,
      liderId,
      cargo: colaborador.cargo ?? "",
      periodo,
      unidade: unidade ?? colaborador.unidade ?? "",
      status: "AGUARDANDO_COLABORADOR",
    },
  });

  return NextResponse.json(avaliacao);
}
