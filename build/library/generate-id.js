"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
function default_1() {
    const [, low, mid, high] = uuid_1.v1().match(/^([0-9a-f]{8})-([0-9a-f]{4})-1([0-9a-f]{3})/);
    return `evt_${high}${mid}${low}${crypto_1.default.randomBytes(4).toString('hex')}`;
}
exports.default = default_1;
//# sourceMappingURL=generate-id.js.map