import { body, param, query } from 'express-validator';

export const createPropertyBody = [
  body('title').notEmpty().trim().withMessage('Title required'),
  body('address').notEmpty().trim().withMessage('Address required'),
  body('property_type').optional().isString(),
  body('rent').isFloat({ gt: 0 }).withMessage('Rent must be positive'),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('availableFrom').optional().isISO8601(),
  body('availableTo').optional().isISO8601(),
];

export const updatePropertyBody = [
  body('title').optional().isString(),
  body('address').optional().isString(),
  body('property_type').optional().isString(),
  body('rent').optional().isFloat({ gt: 0 }),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('status').optional().isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']),
  body('availableFrom').optional().isISO8601(),
  body('availableTo').optional().isISO8601(),
];

export const propertyIdParam = [param('id').isUUID()];
