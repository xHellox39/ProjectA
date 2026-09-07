"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookings = getBookings;
exports.getBookingById = getBookingById;
exports.createBooking = createBooking;
exports.updateBooking = updateBooking;
exports.cancelBooking = cancelBooking;
exports.getMyBookings = getMyBookings;
exports.checkOverlap = checkOverlap;
exports.confirmBooking = confirmBooking;
exports.getBookingSummary = getBookingSummary;
const db_1 = require("../../db");
async function getBookings(page = 1, limit = 10, userId, status) {
    const where = {};
    if (userId)
        where.userId = userId;
    if (status)
        where.status = status;
    const [bookings, total] = await Promise.all([
        db_1.prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { user: { select: { id: true, full_name: true, email: true } }, property: true } }),
        db_1.prisma.booking.count({ where }),
    ]);
    return { bookings, total };
}
async function getBookingById(id) {
    return db_1.prisma.booking.findUnique({ where: { id }, include: { user: true, property: true } });
}
async function createBooking(data, userId) {
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
    const property = await db_1.prisma.property.findUnique({
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
    const overlaps = await db_1.prisma.booking.findMany({
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
        throw new Error(`Date conflict: existing booking (${conflict.status}) from ${conflict.start_date} to ${conflict.end_date}`);
    }
    // Calculate totalAmount from property rent × number of months
    const months = ((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    const totalAmount = months > 0 ? property.rent * months : property.rent;
    return db_1.prisma.booking.create({
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
async function updateBooking(id, data) {
    return db_1.prisma.booking.update({ where: { id }, data, include: { user: true, property: true } });
}
async function cancelBooking(id) {
    const booking = await db_1.prisma.booking.findUnique({
        where: { id },
        include: { property: true, payments: true },
    });
    if (!booking)
        throw new Error('Booking not found');
    if (booking.status === 'CANCELLED')
        throw new Error('Booking is already cancelled');
    return db_1.prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { user: true, property: true },
    });
}
async function getMyBookings(userId) {
    return db_1.prisma.booking.findMany({ where: { userId }, include: { property: true } });
}
async function checkOverlap(propertyId, startDate, endDate, excludeBookingId) {
    const overlaps = await db_1.prisma.booking.findMany({
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
async function confirmBooking(id) {
    const now = new Date();
    const booking = await db_1.prisma.booking.findUnique({
        where: { id },
        include: { property: true, user: true },
    });
    if (!booking)
        throw new Error('Booking not found');
    if (booking.status !== 'PENDING')
        throw new Error('Only pending bookings can be confirmed');
    // Calculate amount to pay
    const amount = booking.totalAmount ?? booking.property.rent;
    // Due date: start of rental or 14 days from now
    const dueDate = booking.start_date > now ? booking.start_date : new Date(now.getTime() + 14 * 86400000);
    // Use transaction: confirm booking + create invoice + create payment
    const result = await db_1.prisma.$transaction(async (tx) => {
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
async function getBookingSummary() {
    const [pending, confirmed, active, cancelled] = await Promise.all([
        db_1.prisma.booking.count({ where: { status: 'PENDING' } }),
        db_1.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        db_1.prisma.booking.count({ where: { status: 'CHECKED_IN' } }),
        db_1.prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);
    return { pending, confirmed, active, cancelled, total: pending + confirmed + active + cancelled };
}
