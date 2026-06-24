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
exports.CommunicationController = void 0;
const communicationService = __importStar(require("./service_communication"));
const response_1 = require("../../utils/response");
class CommunicationController {
    constructor() {
        this.send = async (req, res) => {
            try {
                const message = await communicationService.sendMessage({ ...req.body, conversationId: req.body.conversationId || `conv-${req.user.id}-${req.body.receiverId}` }, req.user.id);
                res.status(201).json((0, response_1.successResponse)(message));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.getConversations = async (req, res) => {
            try {
                const convs = await communicationService.getConversations(req.user.id);
                res.json((0, response_1.successResponse)(convs));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getMessages = async (req, res) => {
            try {
                const messages = await communicationService.getMessagesByConversation(String(req.params.conversationId));
                res.json((0, response_1.successResponse)(messages));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.markRead = async (req, res) => {
            try {
                await communicationService.markAsRead(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Message marked as read'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.CommunicationController = CommunicationController;
