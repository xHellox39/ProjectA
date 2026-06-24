"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.softDeleteUser = softDeleteUser;
exports.activateUser = activateUser;
exports.suspendUser = suspendUser;
exports.changeUserRole = changeUserRole;
const db_1 = require("../../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function getAllUsers(page = 1, limit = 10, search, role, isActive) {
    const where = {};
    if (search)
        where.OR = [{ email: { contains: search } }, { full_name: { contains: search } }];
    if (role)
        where.UserRole = { some: { role: { name: role } } };
    if (isActive !== undefined)
        where.is_active = isActive === 'true';
    const [users, total] = await Promise.all([
        db_1.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { UserRole: { include: { role: true } } } }),
        db_1.prisma.user.count({ where }),
    ]);
    return { users, total };
}
async function getUserById(id) {
    return db_1.prisma.user.findUnique({
        where: { id },
        include: { UserRole: { include: { role: true } } },
    });
}
async function createUser(email, password, full_name, phone, role = 'Tenant') {
    const existing = await db_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new Error('Email already exists');
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    return db_1.prisma.user.create({
        data: { email, passwordHash, full_name, phone, firebase_uid: '', UserRole: { create: { role: { connect: { name: role } } } } },
        include: { UserRole: { include: { role: true } } },
    });
}
async function updateUser(id, data) {
    return db_1.prisma.user.update({ where: { id }, data });
}
async function softDeleteUser(id) {
    return db_1.prisma.user.update({ where: { id }, data: { is_active: false } });
}
async function activateUser(id) {
    return db_1.prisma.user.update({ where: { id }, data: { is_active: true } });
}
async function suspendUser(id) {
    return db_1.prisma.user.update({ where: { id }, data: { is_active: false } });
}
async function changeUserRole(id, roleName) {
    const user = await db_1.prisma.user.findUnique({ where: { id }, include: { UserRole: true } });
    if (!user)
        throw new Error('User not found');
    for (const ur of user.UserRole) {
        await db_1.prisma.userRole.delete({ where: { userId_roleId: { userId: ur.userId, roleId: ur.roleId } } });
    }
    const role = await db_1.prisma.role.findUnique({ where: { name: roleName } });
    if (!role)
        throw new Error('Role not found');
    return db_1.prisma.userRole.create({ data: { userId: id, roleId: role.id } });
}
