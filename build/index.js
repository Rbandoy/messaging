"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_exit_hook_1 = __importDefault(require("async-exit-hook"));
const logger_1 = __importDefault(require("./library/logger"));
const message_service_1 = require("./message-service");
message_service_1.start().catch(err => logger_1.default.error(err));
async_exit_hook_1.default((callback) => {
    message_service_1.stop()
        .catch(err => logger_1.default.error(err))
        .then(() => callback());
});
//# sourceMappingURL=index.js.map