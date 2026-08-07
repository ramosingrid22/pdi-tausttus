import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { name, password, role, cargo, unidade, liderId, resetPassword, username } = body;

  const data: any = {};
  if (name) data.name = name;
  if (role) data.role = role;
  if (cargo !== undefined) data.cargo = cargo || null;
  if (unidade !== undefined) data.unidade = unidade || null;
  if (liderId !== undefined) data.liderId = liderId || null;
  if (password) data.password = await bcrypt.hash(password, 10);

  if (resetPassword && username) {
    const firstName = username.split(".")[0];
    data.password = await bcrypt.hash(`${firstName}@1234`, 10);
    data.mustChangePassword = true;
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, username: true, role: true, cargo: true, unidade: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
