"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinanceSummary = getFinanceSummary;
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.createPayment = createPayment;
exports.markAsPaid = markAsPaid;
exports.completePayment = completePayment;
const db_1 = require("../../db");
async function getFinanceSummary(userId) {
    return { total: 0, pending: 0, collected: 0, overdue: 0 };
}
async function getPayments(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
        db_1.prisma.payment.findMany({ skip, take: limit, orderBy: { id: 'desc' }, include: { user: true, booking: { include: { property: true } } } }),
        db_1.prisma.payment.count(),
    ]);
    return { payments, total };
}
async function getPaymentById(id) {
    return db_1.prisma.payment.findUnique({ where: { id }, include: { user: true, booking: { include: { property: true } } } });
}
async function createPayment(data) {
    const statusMap = { pending: 'PENDING', paid: 'PAID', unpaid: 'UNPAID', failed: 'FAILED', refunded: 'REFUNDED' };
    return db_1.prisma.payment.create({
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
async function markAsPaid(id) {
    return db_1.prisma.payment.update({ where: { id }, data: { status: 'PAID' } });
}
// Cascade: completes payment, updates invoice, booking, and property in one transaction
async function completePayment(id) {
    const payment = await db_1.prisma.payment.findUnique({
        where: { id },
        include: { booking: { include: { property: true } } },
    });
    if (!payment)
        throw new Error('Payment not found');
    if (payment.status === 'PAID')
        throw new Error('Payment already paid');
    return db_1.prisma.$transaction(async (tx) => {
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
