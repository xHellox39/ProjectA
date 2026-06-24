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
exports.UserController = void 0;
const userService = __importStar(require("./service_user"));
const response_1 = require("../../utils/response");
class UserController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { search, role, is_active } = req.query;
                const { users, total } = await userService.getAllUsers(page, limit, search, role, is_active);
                res.json((0, response_1.paginatedResponse)(users, page, limit, total));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const user = await userService.getUserById(String(req.params.id));
                if (!user)
                    return res.status(404).json({ success: false, error: { message: 'User not found' } });
                res.json((0, response_1.successResponse)(user));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const { email, password, full_name, phone, role } = req.body;
                const user = await userService.createUser(email, password, full_name, phone, role);
                res.status(201).json((0, response_1.successResponse)(user, 'User created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const user = await userService.updateUser(String(req.params.id), req.body);
                res.json((0, response_1.successResponse)(user, 'User updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.remove = async (req, res) => {
            try {
                await userService.softDeleteUser(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'User deactivated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.activate = async (req, res) => {
            try {
                const user = await userService.activateUser(String(req.params.id));
                res.json((0, response_1.successResponse)(user, 'User activated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.suspend = async (req, res) => {
            try {
                const user = await userService.suspendUser(String(req.params.id));
                res.json((0, response_1.successResponse)(user, 'User suspended'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.changeRole = async (req, res) => {
            try {
                const { role } = req.body;
                await userService.changeUserRole(String(req.params.id), role);
                res.json((0, response_1.successResponse)(null, `Role changed to ${role}`));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.UserController = UserController;
