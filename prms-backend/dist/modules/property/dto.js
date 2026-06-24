"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyIdParam = exports.updatePropertyBody = exports.createPropertyBody = void 0;
const express_validator_1 = require("express-validator");
exports.createPropertyBody = [
    (0, express_validator_1.body)('title').notEmpty().trim().withMessage('Title required'),
    (0, express_validator_1.body)('address').notEmpty().trim().withMessage('Address required'),
    (0, express_validator_1.body)('property_type').optional().isString(),
    (0, express_validator_1.body)('rent').isFloat({ gt: 0 }).withMessage('Rent must be positive'),
    (0, express_validator_1.body)('city').optional().isString(),
    (0, express_validator_1.body)('state').optional().isString(),
    (0, express_validator_1.body)('availableFrom').optional().isISO8601(),
    (0, express_validator_1.body)('availableTo').optional().isISO8601(),
];
exports.updatePropertyBody = [
    (0, express_validator_1.body)('title').optional().isString(),
    (0, express_validator_1.body)('address').optional().isString(),
    (0, express_validator_1.body)('property_type').optional().isString(),
    (0, express_validator_1.body)('rent').optional().isFloat({ gt: 0 }),
    (0, express_validator_1.body)('city').optional().isString(),
    (0, express_validator_1.body)('state').optional().isString(),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']),
    (0, express_validator_1.body)('availableFrom').optional().isISO8601(),
    (0, express_validator_1.body)('availableTo').optional().isISO8601(),
];
exports.propertyIdParam = [(0, express_validator_1.param)('id').isUUID()];
