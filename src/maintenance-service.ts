import mongoose from 'mongoose';
import { MaintenanceModel } from './models/maintenance';
import rabbit from './library/rabbit';
import logger from './library/logger';

let worker: any;

function getDayOfWeek(day: string) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days.indexOf(day);
}

export async function start() {
  logger.info('starting');
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/onewallet',
    {
      useCreateIndex: true,
      useNewUrlParser: true,
    }
  );

  worker = await rabbit.createWorker('Maintenance', async ({ type, data }) => {
    logger.tag('worker').verbose({ type, data }); 
    if (type === 'isUnderMaintenance') {
      const documents = await MaintenanceModel.find({
        vendor: data.vendor,
        gameType: data.gameType,
        creator: data.creator
      });

      if (documents.length === 0) {
        return false;
      }

      const found = documents
        .map(doc => doc.toJSON())
        .filter(doc => {
          if (doc.mode === 'ONE_TIME') {
            const startDateTime = new Date(doc.startDateTime).getTime();
            const endDateTime = new Date(doc.endDateTime).getTime();
            const dateNow = Date.now();
            if (startDateTime <= dateNow && dateNow < endDateTime) {
              return true;
            }
            if (startDateTime > dateNow) {
              return false;
            }
            
            if (dateNow > endDateTime) {
              return false;
            }
          }
          if (doc.mode === 'RECURRING') {
            const dayNow = new Date(Date.now()).getDay();  
            const startDay = getDayOfWeek(doc.startDay);
            const endDay = getDayOfWeek(doc.endDay);
            const dateNow = new Date(Date.now()).getTime(); 
            const startDate = new Date(doc.startDate).getTime();
            const endDate = new Date(doc.endDate).getTime(); 
            const [startHour, startMinute] = doc.startTime.split(':');
            const [endHour, endMinute] = doc.endTime.split(':');  
            const hourNowToMilliseconds = (new Date(Date.now()).getUTCHours() * 3600000) +
              (new Date(Date.now()).getMinutes() * 1800000);
            const startTimeToMilliseconds = (startHour * 3600000) + (startMinute * 1800000);
            const endTimeToMilliseconds = (endHour * 3600000) + (endMinute * 1800000);
            if (startDate <= dateNow && dateNow - hourNowToMilliseconds <= endDate) {
              if (startDay <= dayNow && dayNow <= endDay) {
                if (startTimeToMilliseconds <= hourNowToMilliseconds && hourNowToMilliseconds <= endTimeToMilliseconds) {
                  return true;
                }
              }
            }
          }
        });
      return found.length > 0;
    }
    if (type === 'CreateMaintenance') {
      if (data.mode === 'ONE_TIME') {
          await MaintenanceModel.create({
            vendor: data.vendor,
            creator: data.creator,  
            gameType: data.gameType,
            mode: data.mode,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            dateTimeCreated: data.dateTimeCreated,
          });
        return;
      }
      if (data.mode === 'RECURRING') {
        await MaintenanceModel.create({ 
          creator: data.creator,  
          vendor: data.vendor,
          gameType: data.gameType,
          mode: data.mode,
          period: data.period,
          startTime: data.startTime,
          endTime: data.endTime,
          startDay: data.startDay,
          endDay: data.endDay,
          startDate: data.startDate,
          endDate: data.endDate,
          dateTimeCreated: data.dateTimeCreated,
        });
        return;
      }
    }
    if (type === 'DeleteMaintenance') {
      await MaintenanceModel.findOneAndDelete({
        vendor: data.vendor,
        gameType: data.gameType
      });
      return;
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