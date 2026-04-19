'use server';

import { prisma } from '@/db';
import { auth } from '@/auth';

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

    return { success: true };
  } catch (err) {
    console.error('placeOrder error:', err);
    return { success: false, error: 'Order failed. Please try again.' };
  }
}
