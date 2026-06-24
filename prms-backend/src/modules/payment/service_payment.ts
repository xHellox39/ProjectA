import { prisma } from '../../db';

export async function getPayments(page = 1, limit = 10, userId?: string, status?: string) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (status) where.status = status;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { booking: true, user: { select: { id: true, full_name: true } } } }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total };
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { booking: true, user: true } });
}

export async function createPayment(data: { bookingId: string; userId: string; amount: number; type?: string; method?: string; reference?: string; }, adminId?: string) {
  return prisma.payment.create({
    data: { ...data, due_date: new Date() },
    include: { booking: true, user: true },
  });
}

export async function markAsPaid(id: string) {
  return prisma.payment.update({
    where: { id },
    data: { status: 'paid', paid_at: new Date() },
  });
}
