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
exports.CategoryController = void 0;
const categoryService = __importStar(require("./service_category"));
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
class CategoryController {
    constructor() {
        // Generic list (public read, filtered by query params)
        this.list = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const { isShared, isDisabled, ownerId } = req.query;
                const categories = await categoryService.listCategories({
                    isShared: isShared ? isShared === 'true' : undefined,
                    isDisabled: isDisabled ? isDisabled === 'true' : undefined,
                    ownerId: ownerId,
                });
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: list all categories (auto-seed if empty)
        this.adminList = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                // Auto-seed default categories if none exist
                const count = await db_1.prisma.propertyCategory.count();
                if (count === 0) {
                    await categoryService.seedDefaultCategories(req.user.id);
                }
                // Admin sees all categories (own + shared from other users)
                const categories = await categoryService.listCategories({});
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        // NON-ADMIN: list shared + own personal categories
        this.personalList = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const categories = await categoryService.listCategories({ ownerId: req.user.id, isDisabled: undefined });
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        // Non-admin: create personal category (isShared = false by default)
        this.createPersonal = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const { name, description } = req.body;
                const category = await categoryService.createCategory({ name, description, isShared: false }, req.user.id);
                res.status(201).json((0, response_1.successResponse)(category, 'Category created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // Non-admin: update own personal category (cannot change isShared)
        this.updatePersonal = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.getCategoryById(String(req.params.id));
                if (!category || category.ownerId !== req.user.id) {
                    return res.status(403).json({ success: false, error: { message: 'Not your category' } });
                }
                const { name, description, isDisabled } = req.body;
                const updated = await categoryService.updateCategory(String(req.params.id), { name, description, isDisabled });
                res.json((0, response_1.successResponse)(updated, 'Category updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // Non-admin: soft-delete own personal category (sets isDisabled = true)
        this.removePersonal = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.getCategoryById(String(req.params.id));
                if (!category || category.ownerId !== req.user.id) {
                    return res.status(403).json({ success: false, error: { message: 'Not your category' } });
                }
                // Soft delete: isDisabled = true
                await categoryService.deleteCategory(String(req.params.id), false);
                res.json((0, response_1.successResponse)(null, 'Category deleted'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // Non-admin: toggle disabled on own personal category
        this.togglePersonal = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.getCategoryById(String(req.params.id));
                if (!category || category.ownerId !== req.user.id) {
                    return res.status(403).json({ success: false, error: { message: 'Not your category' } });
                }
                const updated = await categoryService.toggleCategoryDisabled(String(req.params.id));
                res.json((0, response_1.successResponse)(updated, 'Category toggled'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // Read-only: shared enabled categories
        this.shared = async (req, res) => {
            try {
                const categories = await categoryService.getSharedCategories();
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        // Get single category by ID
        this.getById = async (req, res) => {
            try {
                const category = await categoryService.getCategoryById(String(req.params.id));
                if (!category) {
                    return res.status(404).json({ success: false, error: { message: 'Category not found' } });
                }
                res.json((0, response_1.successResponse)(category));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: create (with isShared control)
        this.create = async (req, res) => {
            try {
                const { name, description, isShared } = req.body;
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.createCategory({ name, description, isShared }, req.user.id);
                res.status(201).json((0, response_1.successResponse)(category, 'Category created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: update (can change isShared on any category)
        this.update = async (req, res) => {
            try {
                const { name, description, isShared, isDisabled } = req.body;
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.updateCategory(String(req.params.id), {
                    name,
                    description,
                    isShared,
                    isDisabled,
                });
                res.json((0, response_1.successResponse)(category, 'Category updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: soft-delete (sets isDisabled = true)
        this.remove = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                // Soft delete: isDisabled = true
                await categoryService.deleteCategory(String(req.params.id), false);
                res.json((0, response_1.successResponse)(null, 'Category deleted'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: toggle disabled
        this.toggle = async (req, res) => {
            try {
                const category = await categoryService.toggleCategoryDisabled(String(req.params.id));
                res.json((0, response_1.successResponse)(category, 'Category toggled'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        // ADMIN: restore (set isDisabled = false)
        this.restore = async (req, res) => {
            try {
                const category = await categoryService.restoreCategory(String(req.params.id));
                res.json((0, response_1.successResponse)(category, 'Category restored'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.seedDefaults = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const created = await categoryService.seedDefaultCategories(req.user.id);
                res.json((0, response_1.successResponse)({ count: created.length }, 'Default categories seeded'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.CategoryController = CategoryController;
