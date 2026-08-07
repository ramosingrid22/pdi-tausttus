import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarSintese } from "@/lib/gerarSintese";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: {
      colaborador: { select: { id: true, name: true, cargo: true, unidade: true } },
      lider: { select: { id: true, name: true } },
    },
  });

  if (!avaliacao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "ADMIN" && avaliacao.colaboradorId !== userId && avaliacao.liderId !== userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json({
    ...avaliacao,
    autoavaliacao: avaliacao.autoavaliacao ? JSON.parse(avaliacao.autoavaliacao as string) : null,
    avaliacaoLider: avaliacao.avaliacaoLider ? JSON.parse(avaliacao.avaliacaoLider as string) : null,
    consenso: avaliacao.consenso ? JSON.parse(avaliacao.consenso as string) : null,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const avaliacao = await prisma.avaliacao.findUnique({ where: { id: params.id } });
  if (!avaliacao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const body = await req.json();

  // Autoavaliação: só o colaborador pode preencher
  if (body.fase === "autoavaliacao") {
    if (avaliacao.colaboradorId !== userId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    if (avaliacao.status !== "AGUARDANDO_COLABORADOR") {
      return NextResponse.json({ error: "Fase já concluída" }, { status: 400 });
    }
    const updated = await prisma.avaliacao.update({
      where: { id: params.id },
      data: { autoavaliacao: JSON.stringify(body.dados), status: "AGUARDANDO_LIDER" },
    });
    return NextResponse.json(updated);
  }

  // Avaliação do líder
  if (body.fase === "lider") {
    if (avaliacao.liderId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    if (avaliacao.status !== "AGUARDANDO_LIDER") {
      return NextResponse.json({ error: "Fase incorreta" }, { status: 400 });
    }
    const updated = await prisma.avaliacao.update({
      where: { id: params.id },
      data: { avaliacaoLider: JSON.stringify(body.dados), status: "AGUARDANDO_CONSENSO" },
    });
    return NextResponse.json(updated);
  }

  // Consenso
  if (body.fase === "consenso") {
    if (avaliacao.liderId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    if (avaliacao.status !== "AGUARDANDO_CONSENSO") {
      return NextResponse.json({ error: "Fase incorreta" }, { status: 400 });
    }

    const avaliacaoCompleta = await prisma.avaliacao.findUnique({
      where: { id: params.id },
      include: { colaborador: { select: { name: true } } },
    });

    const auto = avaliacaoCompleta?.autoavaliacao
      ? JSON.parse(avaliacaoCompleta.autoavaliacao as string) : null;
    const lider = avaliacaoCompleta?.avaliacaoLider
      ? JSON.parse(avaliacaoCompleta.avaliacaoLider as string) : null;

    const sintese = await gerarSintese({
      colaboradorNome: avaliacaoCompleta?.colaborador.name ?? "",
      cargo: avaliacao.cargo,
      periodo: avaliacao.periodo,
      auto,
      lider,
      consenso: body.dados,
    }).catch(() => "");

    const dadosComSintese = { ...body.dados, sintese };

    const updated = await prisma.avaliacao.update({
      where: { id: params.id },
      data: { consenso: JSON.stringify(dadosComSintese), status: "CONCLUIDA" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Fase inválida" }, { status: 400 });
}
