import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, username: true, role: true,
      cargo: true, unidade: true, liderId: true,
      lider: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { name, username, password, role, cargo, unidade, liderId } = body;

  if (!name || !username || !password || !role) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Nome de usuário já existe" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name, username, password: hash, role,
      cargo: cargo || null,
      unidade: unidade || null,
      liderId: liderId || null,
    },
    select: { id: true, name: true, username: true, role: true, cargo: true, unidade: true },
  });

  return NextResponse.json(user, { status: 201 });
}
