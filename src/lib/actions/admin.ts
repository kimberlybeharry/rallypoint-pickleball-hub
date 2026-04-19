'use server';

import { prisma } from '@/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendCancellationNotice } from '@/lib/email';

export async function adminCancelBooking(
  bookingId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') {
    return { success: false, error: 'Access denied' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: { select: { name: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!booking) return { success: false, error: 'Booking not found' };
  if (booking.status === 'CANCELLED') return { success: false, error: 'Already cancelled' };

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } }),
    prisma.timeSlot.update({
      where: { id: booking.slotId },
      data: { status: 'AVAILABLE', heldUntil: null },
    }),
    prisma.pointsEvent.create({
      data: {
        userId: booking.user.id,
        eventType: 'BOOKING_CANCEL',
        refId: bookingId,
        points: -50,
      },
    }),
    prisma.user.update({
      where: { id: booking.user.id },
      data: { points: { decrement: 50 } },
    }),
  ]);

  // Notify the customer (non-fatal)
  if (booking.user.email) {
    const dateStr = booking.date.toISOString().split('T')[0];
    await sendCancellationNotice({
      to: booking.user.email,
      name: booking.user.name ?? 'there',
      type: 'booking',
      detail: `${booking.court.name} on ${dateStr} at ${booking.startTime} (cancelled by admin)`,
    });
  }

  revalidatePath('/admin');
  return { success: true };
}
