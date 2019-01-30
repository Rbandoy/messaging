"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const onewallet_library_error_1 = __importDefault(require("onewallet.library.error"));
class AggregateVersionExistsError extends onewallet_library_error_1.default {
    constructor(event) {
        super('AGGREGATE_VERSION_EXISTS', 'Aggregate version already exists', {
            event,
        });
    }
}
exports.AggregateVersionExistsError = AggregateVersionExistsError;
//# sourceMappingURL=error.js.map