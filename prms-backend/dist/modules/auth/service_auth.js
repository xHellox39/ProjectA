"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.generateTokens = generateTokens;
exports.saveRefreshToken = saveRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.getCurrentUser = getCurrentUser;
exports.updateUserProfile = updateUserProfile;
exports.logoutUser = logoutUser;
exports.changePassword = changePassword;
exports.setPassword = setPassword;
exports.generateOtpCode = generateOtpCode;
exports.verifyOtpCode = verifyOtpCode;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../db");
const config_1 = require("../../config");
async function registerUser(email, password, full_name, phone, role) {
    const existing = await db_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new Error('Email already registered');
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const firebase_uid = "";
    const user = await db_1.prisma.user.create({
        data: {
            email,
            passwordHash,
            firebase_uid,
            full_name,
            phone,
            UserRole: {
                create: {
                    role: { connect: { name: role || 'Tenant' } }
                }
            }
        },
        include: { UserRole: { include: { role: true } } },
    });
    return user;
}
async function loginUser(email, password) {
    const user = await db_1.prisma.user.findUnique({
        where: { email },
        include: { UserRole: { include: { role: true } } },
    });
    if (!user)
        throw new Error('Email not registered');
    if (!user.passwordHash)
        throw new Error('Please use Firebase login for this account');
    if (!user.is_active)
        throw new Error('Account is suspended');
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw new Error('Wrong password. Please try again.');
    return user;
}
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, config_1.env.JWT_SECRET, { expiresIn: config_1.env.JWT_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, config_1.env.JWT_REFRESH_SECRET, { expiresIn: config_1.env.JWT_REFRESH_EXPIRY });
    return { accessToken, refreshToken };
}
async function saveRefreshToken(userId, refreshToken) {
    const hash = await bcryptjs_1.default.hash(refreshToken, 10);
    await db_1.prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
}
async function verifyRefreshToken(userId, refreshToken) {
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken)
        throw new Error('No refresh token found');
    const valid = await bcryptjs_1.default.compare(refreshToken, user.refreshToken);
    if (!valid)
        throw new Error('Invalid refresh token');
    return user;
}
async function getCurrentUser(userId) {
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, email: true, full_name: true, phone: true,
            profile_img_url: true, firebase_uid: true, is_active: true, created_at: true,
            passwordHash: true,
            UserRole: { include: { role: true } },
        },
    });
    // Expose a boolean so the frontend knows whether a password is set
    return {
        ...user,
        hasPassword: !!user?.passwordHash,
    };
}
async function updateUserProfile(userId, data) {
    // If role is provided, update the UserRole association
    if (data.role) {
        const role = await db_1.prisma.role.findUnique({ where: { name: data.role } });
        if (!role)
            throw new Error(`Role ${data.role} not found`);
        await db_1.prisma.userRole.upsert({
            where: { userId_roleId: { userId, roleId: role.id } },
            update: {},
            create: { userId, roleId: role.id },
        });
    }
    const { role, ...userFields } = data;
    return db_1.prisma.user.update({
        where: { id: userId },
        data: userFields,
        include: {
            UserRole: { include: { role: true } },
        },
    });
}
async function logoutUser(userId) {
    await db_1.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}
async function changePassword(userId, currentPassword, newPassword) {
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash)
        throw new Error('Password-based account required');
    const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
    if (!valid)
        throw new Error('Current password is incorrect');
    const newHash = await bcryptjs_1.default.hash(newPassword, 10);
    return db_1.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
    });
}
async function setPassword(userId, newPassword) {
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    if (user.passwordHash)
        throw new Error('Already has a password. Use change password instead.');
    const newHash = await bcryptjs_1.default.hash(newPassword, 10);
    return db_1.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
    });
}
const otpStore = new Map();
async function generateOtpCode(email) {
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Email not found');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
    return code;
}
async function verifyOtpCode(email, code) {
    const entry = otpStore.get(email);
    if (!entry)
        throw new Error('OTP not found. Request a new one first.');
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP expired. Request a new one.');
    }
    if (entry.code !== code)
        throw new Error('Invalid OTP code.');
    otpStore.delete(email);
}
async function resetPassword(email, newPassword) {
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('User not found');
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    return db_1.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
    });
}
