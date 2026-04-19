'use server';

import { prisma } from '@/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import {
  sendBookingConfirmation,
  sendOrderConfirmation,
  sendCancellationNotice,
} from '@/lib/email';

export interface CheckoutBooking {
  slotId?: string;
  courtId: string;
  date: string;
  startTime: string;
  price: number;
}

export interface CheckoutProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function placeOrder(
  products: CheckoutProduct[],
  bookings: CheckoutBooking[],
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }
  const userId = session.user.id;

  const productTotal = products.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
  const bookingTotal = bookings.reduce((s, b) => s + b.price, 0);
  const total = productTotal + bookingTotal;
  const pointsEarned = Math.floor(total);

  try {
    await prisma.$transaction(async (tx) => {
      // Confirm all booked slots
      for (const booking of bookings) {
        if (booking.slotId) {
          await tx.timeSlot.update({
            where: { id: booking.slotId },
            data: { status: 'BOOKED', heldUntil: null },
          });
          // Create Booking record
          await tx.booking.create({
            data: {
              userId,
              courtId: booking.courtId,
              slotId: booking.slotId,
              date: new Date(booking.date + 'T00:00:00Z'),
              startTime: booking.startTime,
              totalAmount: booking.price,
              status: 'CONFIRMED',
            },
          });
          // 50 pts per court booking
          await tx.pointsEvent.create({
            data: {
              userId,
              eventType: 'BOOKING',
              points: 50,
            },
          });
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: 50 } },
          });
        }
      }

      // Create product order if any products
      if (products.length > 0) {
        const order = await tx.order.create({
          data: {
            userId,
            totalAmount: productTotal,
            status: 'PAID',
          },
        });
        for (const p of products) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: p.productId,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
            },
          });
          // Decrement stock
          await tx.product.update({
            where: { id: p.productId },
            data: { stock: { decrement: p.quantity } },
          });
        }
        // 1 pt per $1 spent on products
        const productPoints = Math.floor(productTotal);
        if (productPoints > 0) {
          await tx.pointsEvent.create({
            data: {
              userId,
              eventType: 'PURCHASE',
              refId: order.id,
              points: productPoints,
            },
          });
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: productPoints } },
          });
        }
      }
    });

    // FR13: Award referral bonus to sender if this is the recipient's first purchase
    const existingPurchases = await prisma.order.count({ where: { userId } });
    if (existingPurchases === 1) {
      // This was the first order — check if user was referred
      const referral = await prisma.referral.findFirst({
        where: { recipientId: userId },
        select: { id: true, senderId: true },
      });
      if (referral) {
        await prisma.$transaction([
          prisma.pointsEvent.create({
            data: {
              userId: referral.senderId,
              eventType: 'REFERRAL',
              refId: referral.id,
              points: 250,
            },
          }),
          prisma.user.update({
            where: { id: referral.senderId },
            data: { points: { increment: 250 } },
          }),
        ]);
      }
    }

    // FR7/FR18: Send confirmation emails (non-fatal)
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user?.email) {
        const name = user.name ?? 'there';
        const emailTasks: Promise<void>[] = [];

        if (bookings.length > 0) {
          const courtIds = bookings.map((b) => b.courtId);
          const courts = await prisma.court.findMany({
            where: { id: { in: courtIds } },
            select: { id: true, name: true },
          });
          const courtMap = Object.fromEntries(courts.map((c) => [c.id, c.name]));
          for (const b of bookings) {
            emailTasks.push(
              sendBookingConfirmation({
                to: user.email,
                name,
                courtName: courtMap[b.courtId] ?? 'Court',
                date: b.date,
                startTime: b.startTime,
                totalAmount: b.price,
              }),
            );
          }
        }

        if (products.length > 0) {
          const productIds = products.map((p) => p.productId);
          const productRecords = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          });
          const nameMap = Object.fromEntries(productRecords.map((p) => [p.id, p.name]));
          const productTotal = products.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
          emailTasks.push(
            sendOrderConfirmation({
              to: user.email,
              name,
              orderId: userId,
              items: products.map((p) => ({
                name: nameMap[p.productId] ?? 'Product',
                quantity: p.quantity,
                unitPrice: p.unitPrice,
              })),
              totalAmount: productTotal,
            }),
          );
        }

        await Promise.allSettled(emailTasks);
      }
    } catch {
      // Email errors must never fail the order
    }

    return { success: true };
  } catch (err) {
    console.error('placeOrder error:', err);
    return { success: false, error: 'Order failed. Please try again.' };
  }
}

// ─── FR8: Order and booking history ────────────────────────────────────────

export interface OrderHistoryItem {
  id: string;
  type: 'order';
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number; unitPrice: number }[];
}

export interface BookingHistoryItem {
  id: string;
  type: 'booking';
  status: string;
  courtName: string;
  date: string;
  startTime: string;
  totalAmount: number;
  createdAt: string;
}

export type HistoryItem = OrderHistoryItem | BookingHistoryItem;

export async function getHistory(): Promise<{ items: HistoryItem[]; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { items: [], error: 'Not authenticated' };

  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { court: { select: { name: true } } },
    }),
  ]);

  const orderItems: OrderHistoryItem[] = orders.map((o) => ({
    id: o.id,
    type: 'order',
    status: o.status,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  }));

  const bookingItems: BookingHistoryItem[] = bookings.map((b) => ({
    id: b.id,
    type: 'booking',
    status: b.status,
    courtName: b.court.name,
    date: b.date.toISOString().split('T')[0],
    startTime: b.startTime,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
  }));

  // Merge and sort by createdAt desc
  const all: HistoryItem[] = [...orderItems, ...bookingItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { items: all };
}

// ─── FR10: Cancel booking ───────────────────────────────────────────────────

export async function cancelBooking(
  bookingId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      userId: true,
      status: true,
      slotId: true,
      totalAmount: true,
      court: { select: { name: true } },
      date: true,
      startTime: true,
    },
  });

  if (!booking) return { success: false, error: 'Booking not found' };
  if (booking.userId !== session.user.id) return { success: false, error: 'Access denied' };
  if (booking.status === 'CANCELLED') return { success: false, error: 'Already cancelled' };

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    }),
    prisma.timeSlot.update({
      where: { id: booking.slotId },
      data: { status: 'AVAILABLE', heldUntil: null },
    }),
    // Reverse the 50 points that were awarded for this booking
    prisma.pointsEvent.create({
      data: {
        userId: session.user.id,
        eventType: 'BOOKING_CANCEL',
        refId: bookingId,
        points: -50,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { points: { decrement: 50 } },
    }),
  ]);

  // FR7/FR18: Send cancellation email (non-fatal)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (user?.email) {
    const dateStr = booking.date.toISOString().split('T')[0];
    await sendCancellationNotice({
      to: user.email,
      name: user.name ?? 'there',
      type: 'booking',
      detail: `${booking.court.name} on ${dateStr} at ${booking.startTime}`,
    });
  }

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard');
  return { success: true };
}

// ─── FR10: Cancel order (user-side) ────────────────────────────────────────

export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  if (!order) return { success: false, error: 'Order not found' };
  if (order.userId !== session.user.id) return { success: false, error: 'Access denied' };
  if (order.status === 'CANCELLED') return { success: false, error: 'Already cancelled' };
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return { success: false, error: 'Cannot cancel a shipped or delivered order' };
  }

  const pointsToDeduct = Math.floor(order.totalAmount);

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } }),
    // Restore stock
    ...order.items.map((i) =>
      prisma.product.update({
        where: { id: i.productId },
        data: { stock: { increment: i.quantity } },
      }),
    ),
    // Reverse purchase points
    prisma.pointsEvent.create({
      data: {
        userId: session.user.id,
        eventType: 'PURCHASE_CANCEL',
        refId: orderId,
        points: -pointsToDeduct,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { points: { decrement: pointsToDeduct } },
    }),
  ]);

  // FR18: Send cancellation email (non-fatal)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (user?.email) {
    await sendCancellationNotice({
      to: user.email,
      name: user.name ?? 'there',
      type: 'order',
      detail: `Equipment order (${order.items.map((i) => i.product.name).join(', ')}) — USD $${order.totalAmount.toFixed(2)}`,
    });
  }

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard');
  return { success: true };
}

// ─── FR13: Referral code ────────────────────────────────────────────────────

export async function getOrCreateReferralCode(): Promise<{ code: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { code: null, error: 'Not authenticated' };

  const existing = await prisma.referral.findFirst({
    where: { senderId: session.user.id },
    select: { code: true },
  });

  if (existing) return { code: existing.code };

  // Generate a short 8-char alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const referral = await prisma.referral.create({
    data: { senderId: session.user.id, code },
  });

  return { code: referral.code };
}
