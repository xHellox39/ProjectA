"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.createPayment = createPayment;
exports.markAsPaid = markAsPaid;
const db_1 = require("../../db");
async function getPayments(page = 1, limit = 10, userId, status) {
    const where = {};
    if (userId)
        where.userId = userId;
    if (status)
        where.status = status;
    const [payments, total] = await Promise.all([
        db_1.prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { booking: true, user: { select: { id: true, full_name: true } } } }),
        db_1.prisma.payment.count({ where }),
    ]);
    return { payments, total };
}
async function getPaymentById(id) {
    return db_1.prisma.payment.findUnique({ where: { id }, include: { booking: true, user: true } });
}
async function createPayment(data, adminId) {
    return db_1.prisma.payment.create({
        data: { ...data, due_date: new Date() },
        include: { booking: true, user: true },
    });
}
async function markAsPaid(id) {
    return db_1.prisma.payment.update({
        where: { id },
        data: { status: 'paid', paid_at: new Date() },
    });
}
