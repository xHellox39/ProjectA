"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: false,
});
