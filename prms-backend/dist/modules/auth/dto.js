"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshBody = exports.loginBody = exports.registerBody = void 0;
const express_validator_1 = require("express-validator");
exports.registerBody = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('full_name').optional().isString(),
    (0, express_validator_1.body)('phone').optional().isString(),
    (0, express_validator_1.body)('role').optional().isIn(['Admin', 'Landlord', 'Tenant']).withMessage('Valid role required'),
];
exports.loginBody = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password required'),
];
exports.refreshBody = [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token required'),
];
