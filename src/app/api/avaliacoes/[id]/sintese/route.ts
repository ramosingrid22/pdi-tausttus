import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarSintese } from "@/lib/gerarSintese";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: params.id },
    include: { colaborador: { select: { name: true } } },
  });
  if (!avaliacao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  if (avaliacao.status !== "CONCLUIDA") return NextResponse.json({ error: "Avaliação não concluída" }, { status: 400 });

  const auto = avaliacao.autoavaliacao ? JSON.parse(avaliacao.autoavaliacao as string) : null;
  const lider = avaliacao.avaliacaoLider ? JSON.parse(avaliacao.avaliacaoLider as string) : null;
  const consensoAtual = avaliacao.consenso ? JSON.parse(avaliacao.consenso as string) : {};

  let sintese: string;
  try {
    sintese = await gerarSintese({
      colaboradorNome: avaliacao.colaborador.name,
      cargo: avaliacao.cargo,
      periodo: avaliacao.periodo,
      auto,
      lider,
      consenso: consensoAtual,
    });
  } catch (err: any) {
    console.error("[sintese/route] gerarSintese erro:", err?.message ?? err);
    return NextResponse.json({ error: "Erro ao gerar síntese: " + (err?.message ?? "desconhecido") }, { status: 500 });
  }

  if (!sintese) {
    return NextResponse.json({ error: "Não foi possível gerar síntese: sem conteúdo suficiente ou chave de API ausente." }, { status: 422 });
  }

  const consensoAtualizado = { ...consensoAtual, sintese };
  await prisma.avaliacao.update({
    where: { id: params.id },
    data: { consenso: JSON.stringify(consensoAtualizado) },
  });

  return NextResponse.json({ sintese });
}
