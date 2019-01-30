"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const onewallet_library_rabbit_1 = __importDefault(require("onewallet.library.rabbit"));
exports.default = new onewallet_library_rabbit_1.default({ uri: process.env.RABBITMQ_URI });
//# sourceMappingURL=rabbit.js.map