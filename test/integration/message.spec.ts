import { v4 as uuid } from 'uuid';
import * as chai from 'chai';
import Rabbit from 'onewallet.library.rabbit';  
import { delay } from 'bluebird';  
import * as service from '../../src/message-service';  
import MessageModel from '../../src/models/message';
const { expect } = chai;

let client: (...args: Array<any>) => Promise<any>;
const createMessageData = {
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
const viewMessagesData = {
  first: 0,
  after: ''
}
describe('Message', async () => {
  before(async () => {
    const rabbit = new Rabbit();
    await service.start();
    client = await rabbit.createClient('Message'); 
  });
  describe('Create Message', () => {
    it('should create message from database', async () => {
      const data = createMessageData;
      await client({ type: 'CreateMessage', data }); 
      const document = await MessageModel.findOne({
        targetMember: createMessageData.targetMember,
        targetMemberLevels: createMessageData.targetMemberLevels
      });
      await delay(100);
      expect(document).to.be.an('object');
    });
  });
  describe('View Message', () => {
    it('should view all message', async () => {
      const data = viewMessagesData;
      await client({ type: 'Message', data });
      const result = await MessageModel.find(); 
      expect(result).to.be.an('array'); 
    });
  });
});