import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({},
{
  strict: false
});
export interface MaintenanceAttribute {
  creator: string;
  dateTimeCreated: string;
  vendor: string;
  gameType: string;
  mode: string;
  startDateTime: string;
  endDateTime: string;
  period: string;
  startTime: string;
  endTime: string;
  startDay: string;
  endDay: string;
  startDate: string;
  endDate: string; 
};

export type MaintenanceDocument = mongoose.Document & MaintenanceAttribute;

export const MaintenanceModel = mongoose.model
<MaintenanceDocument>('maintenance', maintenanceSchema);

export default MaintenanceModel;