"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_category_1 = require("./controller_category");
const router = express_1.default.Router();
const ctrl = new controller_category_1.CategoryController();
router.use(auth_1.authenticate);
// --- STATIC ROUTES MUST COME BEFORE PARAMETRIC ROUTES (/:id) ---
// Shared categories - any authenticated user can read always
router.get('/shared', ctrl.shared);
// Non-admin: list only own personal categories
router.get('/personal', ctrl.personalList);
// Any authenticated user: get by id (after /shared and /personal)
router.get('/:id', ctrl.getById);
// Admin: full management of all categories (auto-seeds if empty)
router.get('/', rbac_1.adminOnly, ctrl.adminList);
router.post('/', rbac_1.adminOnly, ctrl.create);
router.put('/:id', rbac_1.adminOnly, ctrl.update);
router.patch('/:id/toggle', rbac_1.adminOnly, ctrl.toggle);
router.patch('/:id/restore', rbac_1.adminOnly, ctrl.restore);
router.delete('/:id', rbac_1.adminOnly, ctrl.remove);
router.post('/seed', rbac_1.adminOnly, ctrl.seedDefaults);
// Non-admin: manage only their personal categories
router.post('/personal', ctrl.createPersonal);
router.put('/personal/:id', ctrl.updatePersonal);
router.delete('/personal/:id', ctrl.removePersonal);
router.patch('/personal/:id/toggle', ctrl.togglePersonal);
// Generic filtered list (programmatic/API consumers)
router.get('/list', ctrl.list);
exports.default = router;
