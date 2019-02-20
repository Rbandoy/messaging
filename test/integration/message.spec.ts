import { v4 as uuid } from 'uuid';
import * as chai from 'chai';
import Rabbit from 'onewallet.library.rabbit';  
import { delay } from 'bluebird';  
import * as service from '../../src/message-service';  
import MessageModel from '../../src/models/message';
const { expect } = chai;

let client: (...args: Array<any>) => Promise<any>;
const messageData = {
  enMessageBody: {
    title: uuid(),
    content: uuid()
  },
  zhMessageBody: {
    title: uuid(),
    content: uuid()
  },
  targetMember: uuid(),
  targetMemberLevels: uuid()
}

describe('Message', async () => {
  before(async () => {
    const rabbit = new Rabbit();
    await service.start();
    client = await rabbit.createClient('Message'); 
  });
  describe('Create Message', () => {
    it('should create message from database', async () => {
      const data = messageData;
      await client({ type: 'CreateMessage', data }); 
      const document = await MessageModel.findOne({
        targetMember: messageData.targetMember,
        targetMemberLevels: messageData.targetMemberLevels
      });
      await delay(100);
      expect(document).to.be.an('object');
    });
  });
});