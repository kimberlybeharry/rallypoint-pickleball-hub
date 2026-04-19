'use server';

import { prisma } from '@/db';

export async function getProducts(opts?: { category?: string; search?: string }) {
  const { category, search } = opts ?? {};
  return prisma.product.findMany({
    where: {
      ...(category && category !== 'All' ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ badge: 'asc' }, { name: 'asc' }],
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { category },
    take: 4,
    orderBy: { name: 'asc' },
  });
}
