"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const maintenance_1 = require("./models/maintenance");
const rabbit_1 = __importDefault(require("./library/rabbit"));
const logger_1 = __importDefault(require("./library/logger"));
let worker;
async function start() {
    logger_1.default.info('starting');
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost/onewallet', {
        useCreateIndex: true,
        useNewUrlParser: true,
    });
    worker = await rabbit_1.default.createWorker('EventStore', async ({ type, data }) => {
        logger_1.default.tag('worker').verbose({ type, data });
        if (type === 'CreateMaintenance') {
            await maintenance_1.MaintenanceModel.create({
                vendor: data.vendor,
                gameType: data.gameType,
                startDate: data.startDate,
                period: data.period,
                mode: data.mode,
            });
        }
        if (type === 'DeleteMaintenance') {
            await maintenance_1.MaintenanceModel.findOneAndDelete({
                vendor: data.vendor,
                gameType: data.gameType
            });
        }
    });
    logger_1.default.info('started');
}
exports.start = start;
async function stop() {
    logger_1.default.info('stopping');
    if (worker) {
        await worker.stop();
    }
    logger_1.default.info('stopped');
}
exports.stop = stop;
//# sourceMappingURL=maintenance-service.js.map