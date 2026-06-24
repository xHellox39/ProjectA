"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getConversations = getConversations;
exports.getMessagesByConversation = getMessagesByConversation;
exports.markAsRead = markAsRead;
const db_1 = require("../../db");
async function sendMessage(data, senderId) {
    return db_1.prisma.message.create({
        data: { ...data, senderId, isRead: false },
        include: { sender: { select: { id: true, full_name: true } }, receiver: { select: { id: true, full_name: true } } },
    });
}
async function getConversations(userId) {
    const conversations = await db_1.prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { id: 'desc' },
        include: { sender: { select: { id: true, full_name: true } }, receiver: { select: { id: true, full_name: true } } },
    });
    return conversations;
}
async function getMessagesByConversation(conversationId) {
    return db_1.prisma.message.findMany({
        where: { conversationId },
        orderBy: { created_at: 'asc' },
        include: { sender: { select: { id: true, full_name: true } } },
    });
}
async function markAsRead(messageId) {
    return db_1.prisma.message.update({ where: { id: messageId }, data: { isRead: true } });
}
