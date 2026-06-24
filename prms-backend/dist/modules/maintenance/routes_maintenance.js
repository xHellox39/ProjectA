"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_maintenance_1 = require("./controller_maintenance");
const router = express_1.default.Router();
const ctrl = new controller_maintenance_1.MaintenanceController();
router.use(auth_1.authenticate);
router.get('/', rbac_1.adminOrLandlord, ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', rbac_1.adminOrLandlord, ctrl.update);
router.patch('/:id/resolve', rbac_1.adminOrLandlord, ctrl.resolve);
exports.default = router;
