"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = require("./models/message");
const rabbit_1 = __importDefault(require("./library/rabbit"));
const logger_1 = __importDefault(require("./library/logger"));
const R = __importStar(require("ramda"));
let worker;
async function start() {
    logger_1.default.info('starting');
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost/onewallet', {
        useCreateIndex: true,
        useNewUrlParser: true,
    });
    worker = await rabbit_1.default.createWorker('Message', async ({ type, data }) => {
        logger_1.default.tag('worker').verbose({ type, data });
        if (type === 'CreateMessage') {
            const document = await message_1.MessageModel.create(data);
            return document._id;
        }
        if (type === 'Message') {
            const criteria = {};
            const count = data.first || 50;
            if (data.after) {
                Object.assign(criteria, { _id: { $lt: data.after } });
            }
            const edges = (await message_1.MessageModel.find(criteria)
                .sort({ _id: -1 })
                .limit(count))
                .map(row => row.toJSON())
                .map(row => ({
                cursor: row.id,
                node: row,
            }));
            return {
                totalCount: edges.length,
                edges: edges,
                pageInfo: {
                    endCursor: R.last(edges) ? R.last(edges).cursor : null,
                    hasNextPage: edges.length === count,
                },
            };
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
//# sourceMappingURL=message-service.js.map