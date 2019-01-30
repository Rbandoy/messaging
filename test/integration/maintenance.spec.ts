import { v4 as uuid } from 'uuid';
import * as chai from 'chai';
import Rabbit from 'onewallet.library.rabbit';  
import { delay } from 'bluebird'; 
import { MaintenanceModel } from '../../src/models/maintenance'; 
import * as service from '../../src/maintenance-service'; 

const { expect } = chai;

let client: (...args: Array<any>) => Promise<any>;

describe('Maintenance', async () => {
  const maintenanceDataOneTimeMode = {
    creator: uuid,
    dateTimeCreated: Date.now(), 
    vendor: uuid(),
    gameType: 'CASINO',
    mode: 'ONE_TIME',
    startDateTime: '05 October 2011 14:48 UTC',
    endDateTime: '25 January 2019 14:48 UTC',
  }
  const maintenanceDataRecurringMode = {
    creator: uuid,
    vendor: uuid(),
    gameType: 'CASINO',
    mode: 'RECURRING', 
    period: Date.now(),
    startTime: Date.now(),
    endTime: Date.now(),
    startDay: Date.now(),
    endDay: Date.now(),
    startDate: '05 October 2011 14:48 UTC',
    endDate: '25 January 2019 14:48 UTC',
    dateTimeCreated: Date.now(), 
  }
  before(async () => {
    const rabbit = new Rabbit();
    await service.start();
    client = await rabbit.createClient('Maintenance'); 
  });
  describe('Createmaintenance', () => {
    describe('Create Maintenance Onetime Mode', () => {
      it('should create new maintenance onetime mode', async () => { 
        const data = maintenanceDataOneTimeMode;
        await client({ type: 'CreateMaintenance', data });
        await delay(500);
        const document = await MaintenanceModel.findOne({
          vendor: data.vendor,
          gameType: data.gameType
        });
        const assert = document!.toJSON();
        expect(assert)
          .to.have.property('vendor')
          .to.be.a('string');
        expect(assert)
          .to.have.property('gameType')
          .to.be.equals('CASINO');
        expect(assert)
          .to.have.property('mode')
          .to.be.equals('ONE_TIME');
        expect(assert)
          .to.have.property('startDateTime')
          .to.be.equals('05 October 2011 14:48 UTC');
        expect(assert)
          .to.have.property('endDateTime')
          .to.be.equals('25 January 2019 14:48 UTC');
        expect(assert)
          .to.have.property('dateTimeCreated')
          .to.be.a('number'); 
      });
    });
    describe('event: Create Maintenance Recurring Mode', () => {
      it('should create new maintenance recurring mode', async () => {
        const data = maintenanceDataRecurringMode;
        await client({ type: 'CreateMaintenance', data });
        await delay(500);
        const document = await MaintenanceModel.findOne({
          vendor: data.vendor,
          gameType: data.gameType
        });
        const assert = document!.toJSON(); 
        expect(assert)
          .to.have.property('dateTimeCreated')
          .to.be.a('number');
        expect(assert)
          .to.have.property('vendor')
          .to.be.a('string');
        expect(assert)
          .to.have.property('gameType')
          .to.be.equals('CASINO');
        expect(assert)
          .to.have.property('mode')
          .to.be.equals('RECURRING');  
        expect(assert)
          .to.have.property('period')
          .to.be.a('number');
        expect(assert)
          .to.have.property('startTime')
          .to.be.a('number');
        expect(assert)
          .to.have.property('endTime')
          .to.be.a('number');
        expect(assert)
          .to.have.property('startDay')
          .to.be.a('number');
        expect(assert)
          .to.have.property('endDay')
          .to.be.a('number');
        expect(assert)
          .to.have.property('startDate')
          .to.be.a('string');
        expect(assert)
          .to.have.property('endDate')
          .to.be.a('string');
      });
    }); 
  });
  describe('Delete Maintenance', () => {
    const maintenanceData = {
      vendor: uuid(),
      gameType: 'CASINO',
    }
    before(async () => {
      await MaintenanceModel.create({
        vendor: maintenanceData.vendor,
        gameType: maintenanceData.gameType,
        mode: 'RECURRING',
        startDateTime: '05 October 2018 14:48 UTC',
        endDateTime: '05 October 2020 14:48 UTC',
        period: 'Weekly',
        startTime: '2:00 pm',
        endTime: '3:00 pm',
        startDay: 'Monday',
        endDay: 'Friday',
        startDate: '05 October 2018 14:48 UTC',
        endDate: '05 October 2020 14:48 UTC',
      });
    }); 

    it('should delete maintenance from database', async () => {
      const data = maintenanceData; 
      await client({ type: 'DeleteMaintenance', data });
      await delay(500);
      const document = await MaintenanceModel.findOne({
        vendor: data.vendor,
        gameType: data.gameType,
      });
      expect(document).to.be.equals(null);
    }); 
  });
  describe('Is under maintenance', () => {
    describe('Given no maintenance being set to vendor and game type', () => {
      const inputData = {
        creator: uuid(),
        vendor: uuid(),
        gameType: 'CASINO',
      }
      it('should return false', async () => {
        const data = inputData ;
        const result = await client({ type: 'isUnderMaintenance', data });
        await delay(500);
        expect(result).to.be.false; 
      });
    });
    describe('Given OneTime maintenance being set', () => {
      describe('Given now is between the maintenance period', () => {
        const inputData = {
          creator: uuid(),
          vendor: 'vendor',
          gameType: 'CASINO', 
        }
        before(async () => { 
          await MaintenanceModel.create({
            creator: inputData.creator,
            vendor: inputData.vendor,
            gameType: inputData.gameType,
            mode: 'ONE_TIME',
            startDateTime: '05 October 2011 14:48 UTC',
            endDateTime: '25 January 2019 14:48 UTC',
            dateTimeCreated: Date.now(), 
          }); 
          await MaintenanceModel.create({
            creator: inputData.creator,
            vendor: inputData.vendor,
            gameType: inputData.gameType,
            mode: 'ONE_TIME',
            startDateTime: '05 October 2011 14:48 UTC',
            endDateTime: '25 January 2017 14:48 UTC',
            dateTimeCreated: Date.now(), 
          });
        }); 
        it('should return true', async () => {
          const date = new Date('24 January 2019 14:48 UTC').getTime();
          Date.now = () => date;
          const data = inputData;  
          const result = await client({ type: 'isUnderMaintenance', data });
          await delay(500);
          expect(result).to.be.true; 
        })
      });
      describe('Given now is before the maintenance start', () => {
        const inputData = {
          creator: uuid(),
          vendor: 'vendor',
          gameType: 'CASINO', 
        }
        before(async () => {
          await MaintenanceModel.create({
            creator: inputData.creator,
            vendor: inputData.vendor,
            gameType: inputData.gameType,
            mode: 'ONE_TIME',
            startDateTime: '05 October 2011 14:48 UTC',
            endDateTime: '25 January 2019 14:48 UTC',
            dateTimeCreated: Date.now(), 
          });
        }); 
        it('should return false', async () => {
          const date = new Date('24 January 2010 14:48 UTC').getTime();
          Date.now = () => date;
          const data = inputData;  
          const result = await client({ type: 'isUnderMaintenance', data });
          await delay(500);
          expect(result).to.be.false; 
        });
      });
      describe('Given now is past the maintenance period', () => {
        const inputData = {
          creator: uuid(),
          vendor: 'vendor',
          gameType: 'CASINO', 
        }
        before(async () => {
          await MaintenanceModel.create({
            creator: inputData.creator,
            vendor: inputData.vendor,
            gameType: inputData.gameType,
            mode: 'ONE_TIME',
            startDateTime: '2017-12-03T10:15:30Z',
            endDateTime: '2017-12-03T10:15:30Z',
            dateTimeCreated: '2017-12-03T10:15:30Z',  
          });
        }); 
        it('should return false', async () => {
          const date = new Date('04 December 2019 14:48 UTC').getTime();
          Date.now = () => date;
          const data = inputData;
          const result = await client({ type: 'isUnderMaintenance', data });
          await delay(500); 
          expect(result).to.be.false; 
        });
      });
    });
    describe('Given Recurring maintenance being set', () => {
      describe('Given maintenance period set to WEEKLY and MONTHLY', () => {
        describe('Given Date, Day and Time is between the maintenance date', () => {
          const inputData = {
            creator: uuid(),
            vendor: 'vendor',
            gameType: 'CASINO', 
          }
          before(async () => {
            await MaintenanceModel.create({
              vendor: inputData.vendor,
              creator: inputData.creator,
              gameType: inputData.gameType,
              mode: 'RECURRING',
              period: 'WEEKLY',
              startTime: '10:15:30Z',
              endTime: '20:15:30Z',
              startDay: 'MONDAY',
              endDay: 'FRIDAY',
              startDate: '2019-01-01',
              endDate: '2019-02-01',
              dateTimeCreated: '2018-12-03T10:15:30Z',
            });
          });
          it('should return true', async () => {
            const date = new Date('2019-01-11T14:14:30Z').getTime();
            Date.now = () => date;
            const data = inputData;
            const result = await client({ type: 'isUnderMaintenance', data });
            await delay(500);
            expect(result).to.be.true; 
          });
        });
        describe('Given day before the maintenance', () => {
          const inputData = {
            vendor: 'vendor',
            creator: uuid(),
            gameType: 'CASINO',
          }
          before(async () => {
            await MaintenanceModel.create({
              vendor: inputData.vendor,
              creator: inputData.creator,
              gameType: inputData.gameType,
              mode: 'RECURRING',
              period: 'WEEKLY',
              startTime: '10:15:30Z',
              endTime: '20:15:30Z',
              startDay: 'MONDAY',
              endDay: 'FRIDAY',
              startDate: '2019-01-01',
              endDate: '2019-02-01',
              dateTimeCreated: '2018-12-03T10:15:30Z',
            });
          });
          it('should return false', async () => {
            const date = new Date('2019-01-20T10:15:30Z').getTime();
            Date.now = () => date;
            const data = inputData;
            const result = await client({ type: 'isUnderMaintenance', data });
            await delay(500);
            expect(result).to.be.false; 
          });
        });
        describe('Given time before the maintenance', () => {
          const inputData = {
            vendor: 'vendor',
            creator: uuid(),
            gameType: 'CASINO',
          }
          before(async () => {
            await MaintenanceModel.create({
              vendor: inputData.vendor,
              creator: inputData.creator,
              gameType: inputData.gameType,
              mode: 'RECURRING',
              period: 'WEEKLY',
              startTime: '10:15:30Z',
              endTime: '20:15:30Z',
              startDay: 'MONDAY',
              endDay: 'FRIDAY',
              startDate: '2019-01-01',
              endDate: '2019-02-01',
              dateTimeCreated: '2018-12-03T10:15:30Z',
            });
          });
          it('should return false', async () => {
            const date = new Date('2019-01-01T10:14:30Z').getTime();
            Date.now = () => date;
            const data = inputData;
            const result = await client({ type: 'isUnderMaintenance', data });
            await delay(500);
            expect(result).to.be.false; 
          });
        });
        describe('Given day is past the maintenance', () => {
          const inputData = {
            vendor: 'vendor',
            creator: uuid(),
            gameType: 'CASINO',
          }
          before(async () => {
            await MaintenanceModel.create({
              vendor: inputData.vendor,
              creator: inputData.creator,
              gameType: inputData.gameType,
              mode: 'RECURRING',
              period: 'WEEKLY',
              startTime: '10:15:30Z',
              endTime: '20:15:30Z',
              startDay: 'MONDAY',
              endDay: 'FRIDAY',
              startDate: '2019-01-01',
              endDate: '2019-02-01',
              dateTimeCreated: '2018-12-09T10:15:30Z',
            });
          });
          it('should return false', async () => {
            const date = new Date('2019-01-05T10:15:30Z').getTime();
            Date.now = () => date;
            const data = inputData;
            const result = await client({ type: 'isUnderMaintenance', data });
            await delay(500);
            expect(result).to.be.false; 
          });
        }); 
        describe('Given time is past the maintenance', () => {
          const inputData = {
            vendor: 'vendor',
            creator: uuid(),
            gameType: 'CASINO',
          }
          before(async () => {
            await MaintenanceModel.create({
              vendor: inputData.vendor,
              creator: inputData.creator,
              gameType: inputData.gameType,
              mode: 'RECURRING',
              period: 'WEEKLY',
              startTime: '10:15:30Z',
              endTime: '20:15:30Z',
              startDay: 'MONDAY',
              endDay: 'FRIDAY',
              startDate: '2018-12-03',
              endDate: '2019-02-03',
              dateTimeCreated: '2018-12-09T10:15:30Z',
            });
          });
          it('should return false', async () => {
            const date = new Date('2019-02-03T20:16:30Z').getTime();
            Date.now = () => date;
            const data = inputData;
            const result = await client({ type: 'isUnderMaintenance', data });
            await delay(500);
            expect(result).to.be.false; 
          });
        });
      });
    });
  });
});