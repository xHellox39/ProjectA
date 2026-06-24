"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const controller_search_1 = require("./controller_search");
const router = express_1.default.Router();
const ctrl = new controller_search_1.SearchController();
router.get('/', ctrl.search);
router.get('/favorites', auth_1.authenticate, ctrl.getFavorites);
router.post('/favorites/:propertyId/toggle', auth_1.authenticate, ctrl.toggleFavorite);
exports.default = router;
