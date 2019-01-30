"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const maintenanceSchema = new mongoose_1.default.Schema({
    vendor: {
        type: String,
        required: true,
    },
    GameType: {
        type: Number,
        required: true,
    },
    StartDate: {
        type: Date,
        required: true,
    },
    Period: {
        type: Date,
        required: true,
    },
    Mode: {
        type: String,
        required: true
    },
}, {
    _id: false,
    toJSON: {
        transform: function (_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
    strict: false
});
exports.MaintenanceModel = mongoose_1.default.model('maintenance', maintenanceSchema);
exports.default = exports.MaintenanceModel;
//# sourceMappingURL=maintenance.js.map