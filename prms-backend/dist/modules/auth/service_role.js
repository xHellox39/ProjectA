"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRole = assignRole;
exports.getUserRoles = getUserRoles;
const db_1 = require("../../db");
async function assignRole(userId, roleName) {
    const existingRoles = await db_1.prisma.userRole.findMany({ where: { userId } });
    for (const ur of existingRoles) {
        await db_1.prisma.userRole.delete({ where: { userId_roleId: { userId: ur.userId, roleId: ur.roleId } } });
    }
    const role = await db_1.prisma.role.findUnique({ where: { name: roleName } });
    if (!role)
        throw new Error(`Role "${roleName}" not found`);
    return db_1.prisma.userRole.create({ data: { userId, roleId: role.id } });
}
async function getUserRoles(userId) {
    return db_1.prisma.user.findUnique({
        where: { id: userId },
        select: { UserRole: { include: { role: true } } },
    });
}
