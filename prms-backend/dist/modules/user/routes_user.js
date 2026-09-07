"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const controller_user_1 = require("./controller_user");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const controller_fileUpload_1 = require("./controller_fileUpload");
const service_fileUpload_1 = require("./service_fileUpload");
const router = express_1.default.Router();
const ctrl = new controller_user_1.UserController();
const fileCtrl = new controller_fileUpload_1.FileUploadController();
router.use(auth_1.authenticate);
// File upload endpoints (MUST come before /:id routes)
router.post('/files', fileUpload_1.default.single('file'), fileCtrl.upload);
router.get('/files', fileCtrl.list);
router.get('/files/:fileId', fileCtrl.getById);
router.delete('/files/:fileId', fileCtrl.remove);
// CRUD endpoints (admin/landlord only)
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', rbac_1.adminOrLandlord, ctrl.create);
router.put('/:id', rbac_1.adminOrLandlord, ctrl.update);
router.delete('/:id', rbac_1.adminOrLandlord, ctrl.remove);
router.post('/:id/activate', rbac_1.adminOrLandlord, ctrl.activate);
router.post('/:id/suspend', rbac_1.adminOrLandlord, ctrl.suspend);
router.post('/:id/change-role', rbac_1.adminOrLandlord, ctrl.changeRole);
// My Documents media endpoint (includes property images)
router.get('/my-media', fileCtrl.getUserMedia);
// Delete property image endpoint
router.delete('/my-media/images/:imageId', async (req, res) => {
    const imageId = String(req.params.imageId);
    try {
        const result = await (0, service_fileUpload_1.deletePropertyImage)(imageId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
exports.default = router;
