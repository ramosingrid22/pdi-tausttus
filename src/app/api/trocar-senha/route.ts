import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { novaSenha } = await req.json();
  if (!novaSenha || novaSenha.length < 6)
    return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 });

  const hash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { password: hash, mustChangePassword: false },
  });

  return NextResponse.json({ ok: true });
}
