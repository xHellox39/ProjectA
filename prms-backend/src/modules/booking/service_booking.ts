import { prisma } from '../../db';

export async function getBookings(page = 1, limit = 10, userId?: string, status?: string) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } }, property: true } }),
    prisma.booking.count({ where }),
  ]);
  return { bookings, total };
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: { user: true, property: true } });
}

export async function createBooking(data: { propertyId: string; start_date: string; end_date: string; totalAmount?: number; }, userId: string) {
  // Validate dates
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  if (end <= start) {
    throw new Error('End date must be after start date');
  }
  if (start < new Date()) {
    throw new Error('Start date cannot be in the past');
  }

  // Check property exists and is AVAILABLE
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    include: { owner: true },
  });
  if (!property) {
    throw new Error('Property not found');
  }
  if (property.status !== 'AVAILABLE') {
    throw new Error(`Property is not available (status: ${property.status})`);
  }

  // Prevent self-booking
  if (property.ownerId === userId) {
    throw new Error('You cannot book your own property');
  }

  // Check for overlapping bookings (PENDING or CONFIRMED only)
  const overlaps = await prisma.booking.findMany({
    where: {
      propertyId: data.propertyId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          start_date: { lte: end },
          end_date: { gte: start },
        },
      ],
    },
    include: { user: { select: { id: true, full_name: true } } },
  });
  if (overlaps.length > 0) {
    const conflict = overlaps[0];
    throw new Error(
      `Date conflict: existing booking (${conflict.status}) from ${conflict.start_date} to ${conflict.end_date}`
    );
  }

  // Calculate totalAmount from property rent × number of months
  const months = ((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
  const totalAmount = months > 0 ? property.rent * months : property.rent;

  return prisma.booking.create({
    data: {
      property: { connect: { id: data.propertyId } },
      start_date: start,
      end_date: end,
      totalAmount: data.totalAmount ?? totalAmount,
      paymentStatus: 'UNPAID',
      user: { connect: { id: userId } },
    },
    include: { user: true, property: true },
  });
}

export async function updateBooking(id: string, data: { status?: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'; totalAmount?: number; }) {
  return prisma.booking.update({ where: { id }, data, include: { user: true, property: true } });
}

export async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true, payments: true },
  });
  if (!booking) throw new Error('Booking not found');
  if (booking.status === 'CANCELLED') throw new Error('Booking is already cancelled');

  return prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { user: true, property: true },
  });
}

export async function getMyBookings(userId: string) {
  return prisma.booking.findMany({ where: { userId }, include: { property: true } });
}

export async function checkOverlap(
  propertyId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string,
): Promise<{ hasOverlap: boolean; overlapping: any[] }> {
  const overlaps = await prisma.booking.findMany({
    where: {
      propertyId,
      status: { notIn: ['CANCELLED'] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        {
          start_date: { lte: new Date(endDate) },
          end_date: { gte: new Date(startDate) },
        },
      ],
    },
    include: { user: { select: { id: true, full_name: true } } },
  });

  return { hasOverlap: overlaps.length > 0, overlapping: overlaps };
}


export async function confirmBooking(id: string) {
  const now = new Date();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true, user: true },
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') throw new Error('Only pending bookings can be confirmed');

  // Calculate amount to pay
  const amount = booking.totalAmount ?? booking.property.rent;

  // Due date: start of rental or 14 days from now
  const dueDate = booking.start_date > now ? booking.start_date : new Date(now.getTime() + 14 * 86400000);

  // Use transaction: confirm booking + create invoice + create payment
  const result = await prisma.$transaction(async (tx) => {
    // 1. Confirm the booking
    const confirmed = await tx.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { user: true, property: true },
    });

    // 2. Create invoice
    const invoice = await tx.invoice.create({
      data: {
        bookingId: id,
        propertyId: booking.propertyId,
        userId: booking.userId,
        amount,
        status: 'PENDING',
        due_date: dueDate,
      },
    });

    // 3. Create payment record
    const payment = await tx.payment.create({
      data: {
        bookingId: id,
        userId: booking.userId,
        amount,
        status: 'PENDING',
        type: 'rent',
        due_date: dueDate,
      },
    });

    return { booking: confirmed, invoice, payment };
  });

  return result;
}

export async function getBookingSummary(): Promise<{ pending: number; confirmed: number; active: number; cancelled: number; total: number }> {
  const [pending, confirmed, active, cancelled] = await Promise.all([
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'CHECKED_IN' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
  ]);
  return { pending, confirmed, active, cancelled, total: pending + confirmed + active + cancelled };
}
