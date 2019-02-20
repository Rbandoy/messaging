import mongoose from 'mongoose';
import { MessageModel } from './models/message';
import rabbit from './library/rabbit';
import logger from './library/logger';
// import { any } from 'bluebird';

let worker: any;
export async function start() {
  logger.info('starting');
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/onewallet',
    {
      useCreateIndex: true,
      useNewUrlParser: true
    }
  );
  
  worker = await rabbit.createWorker('Message', async ({ type, data }) => {
    logger.tag('worker').verbose({ type, data }); 

    if (type === 'CreateMessage') {
      const document = await MessageModel.create(
        data
      );
      return document._id;
    }

    if (type === 'ViewMessages') {
      
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