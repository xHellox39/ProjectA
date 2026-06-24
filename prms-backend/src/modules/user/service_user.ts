import { prisma } from '../../db';
import bcrypt from 'bcryptjs';

export async function getAllUsers(page = 1, limit = 10, search?: string, role?: string, isActive?: string) {
  const where: any = {};
  if (search) where.OR = [{ email: { contains: search } }, { full_name: { contains: search } }];
  if (role) where.UserRole = { some: { role: { name: role } } };
  if (isActive !== undefined) where.is_active = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { UserRole: { include: { role: true } } } }),
    prisma.user.count({ where }),
  ]);
  return { users, total };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { UserRole: { include: { role: true } } },
  });
}

export async function createUser(email: string, password: string, full_name?: string, phone?: string, role = 'Tenant') {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already exists');
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, passwordHash, full_name, phone, firebase_uid: '', UserRole: { create: { role: { connect: { name: role } } } } },
    include: { UserRole: { include: { role: true } } },
  });
}

export async function updateUser(id: string, data: { full_name?: string; phone?: string; is_active?: boolean }) {
  return prisma.user.update({ where: { id }, data });
}

export async function softDeleteUser(id: string) {
  return prisma.user.update({ where: { id }, data: { is_active: false } });
}

export async function activateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { is_active: true } });
}

export async function suspendUser(id: string) {
  return prisma.user.update({ where: { id }, data: { is_active: false } });
}

export async function changeUserRole(id: string, roleName: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: { UserRole: true } });
  if (!user) throw new Error('User not found');
  for (const ur of user.UserRole) {
    await prisma.userRole.delete({ where: { userId_roleId: { userId: ur.userId, roleId: ur.roleId } } });
  }
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error('Role not found');
  return prisma.userRole.create({ data: { userId: id, roleId: role.id } });
}
