import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function checkMustChangePassword() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { mustChangePassword: true },
  });

  if (user?.mustChangePassword) redirect("/trocar-senha");
}
