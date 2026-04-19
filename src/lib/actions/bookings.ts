"use server";

import { prisma } from "@/db";

export async function getCourts() {
  return prisma.court.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getAvailableSlots(courtId: string, date: string) {
  const dateObj = new Date(date + "T00:00:00Z");
  const now = new Date();

  // Release expired HELD slots on read
  await prisma.timeSlot.updateMany({
    where: {
      courtId,
      date: dateObj,
      status: "HELD",
      heldUntil: { lt: now },
    },
    data: { status: "AVAILABLE", heldUntil: null },
  });

  return prisma.timeSlot.findMany({
    where: { courtId, date: dateObj },
    orderBy: { startTime: "asc" },
  });
}

export async function getBookedSlotKeys(date: string): Promise<Set<string>> {
  const dateObj = new Date(date + "T00:00:00Z");
  const slots = await prisma.timeSlot.findMany({
    where: {
      date: dateObj,
      status: { in: ["BOOKED", "HELD"] },
    },
    select: { courtId: true, startTime: true },
  });
  return new Set(slots.map((s) => `${s.courtId}|${s.startTime}`));
}

export async function holdSlot(courtId: string, date: string, startTime: string) {
  const dateObj = new Date(date + "T00:00:00Z");
  const now = new Date();
  const heldUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 min hold

  const existing = await prisma.timeSlot.findFirst({
    where: { courtId, date: dateObj, startTime },
  });

  if (existing) {
    if (
      existing.status === "AVAILABLE" ||
      (existing.status === "HELD" && existing.heldUntil && existing.heldUntil < now)
    ) {
      return prisma.timeSlot.update({
        where: { id: existing.id },
        data: { status: "HELD", heldUntil },
      });
    }
    return null; // Not available
  }

  // Create the slot as HELD (first use of this time/court/date combo)
  const endHour = parseInt(startTime.split(":")[0], 10) + 1;
  const endTime = `${String(endHour).padStart(2, "0")}:00`;

  return prisma.timeSlot.create({
    data: {
      courtId,
      date: dateObj,
      startTime,
      endTime,
      status: "HELD",
      heldUntil,
    },
  });
}

export async function confirmSlot(slotId: string) {
  return prisma.timeSlot.update({
    where: { id: slotId },
    data: { status: "BOOKED", heldUntil: null },
  });
}

export async function releaseSlot(slotId: string) {
  return prisma.timeSlot.update({
    where: { id: slotId },
    data: { status: "AVAILABLE", heldUntil: null },
  });
}
