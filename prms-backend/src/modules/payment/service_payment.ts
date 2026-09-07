import { prisma } from '../../db';

export async function getFinanceSummary(userId: string) {
  return { total: 0, pending: 0, collected: 0, overdue: 0 };
}

export async function getPayments(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ skip, take: limit, orderBy: { id: 'desc' }, include: { user: true, booking: { include: { property: true } } } }),
    prisma.payment.count(),
  ]);
  return { payments, total };
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { user: true, booking: { include: { property: true } } } });
}

export async function createPayment(data: { bookingId: string; userId: string; amount: number; status: string; type?: string; method?: string; due_date?: string }) {
  const statusMap: any = { pending: 'PENDING', paid: 'PAID', unpaid: 'UNPAID', failed: 'FAILED', refunded: 'REFUNDED' };
  return prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      status: statusMap[data.status] || data.status.toUpperCase() || 'PENDING',
      type: data.type || 'rent',
      method: data.method || 'cash',
      due_date: data.due_date ? new Date(data.due_date) : new Date(),
    },
  });
}

export async function markAsPaid(id: string) {
  return prisma.payment.update({ where: { id }, data: { status: 'PAID' } });
}

// Cascade: completes payment, updates invoice, booking, and property in one transaction
export async function completePayment(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { booking: { include: { property: true } } },
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'PAID') throw new Error('Payment already paid');

  return prisma.$transaction(async (tx) => {
    // 1. Update payment to PAID
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { status: 'PAID', paid_at: new Date() },
    });

    // 2. Update associated invoices
    await tx.invoice.updateMany({
      where: { bookingId: payment.bookingId, status: 'PENDING' },
      data: { status: 'PAID' },
    });

    // 3. Update booking payment status to PAID
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'PAID' },
    });

    // 4. Update property to RENTED
    if (payment.booking?.propertyId) {
      await tx.property.update({
        where: { id: payment.booking.propertyId },
        data: { status: 'RENTED' },
      });
    }

    return updatedPayment;
  });
}
