"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.env.RATE_LIMIT_WINDOW_MS,
    max: config_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: { message: 'Too many requests. Please try again later.' },
    },
    skip: (req) => req.url.startsWith('/auth/login') || req.url.startsWith('/auth/register') || req.url.startsWith('/auth/refresh'),
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
