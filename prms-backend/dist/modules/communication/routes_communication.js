"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const controller_communication_1 = require("./controller_communication");
const router = express_1.default.Router();
const ctrl = new controller_communication_1.CommunicationController();
router.use(auth_1.authenticate);
router.post('/send', ctrl.send);
router.get('/', ctrl.getConversations);
router.get('/conversation/:conversationId', ctrl.getMessages);
router.patch('/:id/mark-read', ctrl.markRead);
exports.default = router;
