import mongoose from 'mongoose';
import { MessageModel } from './models/message';
import rabbit from './library/rabbit';
import logger from './library/logger';
import * as R from 'ramda';

let worker: any;
export async function start() {
  logger.info('starting');
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/onewallet',
    {
      useCreateIndex: true,
      useNewUrlParser: true,
    }
  );

  worker = await rabbit.createWorker('Message', async ({ type, data }) => {
    logger.tag('worker').verbose({ type, data });

    if (type === 'CreateMessage') {
      const document = await MessageModel.create(data);
      return document._id;
    }

    if (type === 'Messages') {
      const criteria = {};
      const count = data.first || 50;

      if (data.after) {
        Object.assign(criteria, { _id: { $lt: data.after } });
      }

      const edges = (await MessageModel.find(criteria)
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
          endCursor: R.last(edges) ? R.last(edges)!.cursor : null,
          hasNextPage: edges.length === count,
        },
      };
    }
  });
  logger.info('started');
}
export async function stop() {
  logger.info('stopping');
  if (worker) {
    await worker.stop();
  }
  logger.info('stopped');
}
