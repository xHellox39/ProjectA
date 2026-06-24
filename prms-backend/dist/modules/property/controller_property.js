"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const express_validator_1 = require("express-validator");
const propertyService = __importStar(require("./service_property"));
const response_1 = require("../../utils/response");
class PropertyController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { properties, total } = await propertyService.getAllProperties(page, limit);
                res.json((0, response_1.paginatedResponse)(properties, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const property = await propertyService.getPropertyById(String(req.params.id));
                if (!property)
                    return res.status(404).json({ success: false, error: { message: 'Property not found' } });
                res.json((0, response_1.successResponse)(property));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
            try {
                const property = await propertyService.createProperty(req.body, req.user.id);
                res.status(201).json((0, response_1.successResponse)(property, 'Property created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const property = await propertyService.updateProperty(String(req.params.id), req.body);
                res.json((0, response_1.successResponse)(property, 'Property updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deactivate = async (req, res) => {
            try {
                await propertyService.deactivateProperty(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Property deactivated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.addImage = async (req, res) => {
            try {
                const image = await propertyService.addImage(String(req.params.id), req.body.url);
                res.status(201).json((0, response_1.successResponse)(image));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deleteImage = async (req, res) => {
            try {
                await propertyService.deleteImage(String(req.params.imageId));
                res.json((0, response_1.successResponse)(null, 'Image deleted'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.myProperties = async (req, res) => {
            try {
                const properties = await propertyService.getLandlordProperties(req.user.id);
                res.json((0, response_1.successResponse)(properties));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.PropertyController = PropertyController;
