"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = require("../db");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: { message: 'No token provided' } });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.env.JWT_SECRET);
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                UserRole: { include: { role: { select: { name: true } } } },
            },
        });
        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, error: { message: 'Invalid or inactive user' } });
        }
        req.user = {
            id: user.id,
            firebase_uid: user.firebase_uid,
            email: user.email || '',
            role: user.UserRole[0]?.role.name || 'Tenant',
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ success: false, error: { message: 'Token expired' } });
        }
        next(error);
    }
}
async function optionalAuth(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, config_1.env.JWT_SECRET);
            const user = await db_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    UserRole: { include: { role: { select: { name: true } } } },
                },
            });
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    firebase_uid: user.firebase_uid,
                    email: user.email || '',
                    role: user.UserRole[0]?.role.name || 'Tenant',
                };
            }
        }
        next();
    }
    catch {
        next();
    }
}
