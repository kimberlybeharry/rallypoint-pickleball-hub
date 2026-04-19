import "server-only";
import { auth } from "@/auth";
import { cache } from "react";
import { prisma } from "@/db";

export const verifySession = cache(async (): Promise<{ userId: string } | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return { userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      points: true,
      image: true,
    },
  });
});

export const requireAuth = cache(async () => {
  const session = await verifySession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
});

export const requireAdmin = cache(async () => {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const user = await getUser();
  if (user?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
});
