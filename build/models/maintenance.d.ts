import mongoose from 'mongoose';
export declare const MaintenanceModel: mongoose.Model<mongoose.Document & {
    vendor: string;
    gameType: number;
    startDate: Date;
    period: Date;
    mode: string;
}, {}>;
export default MaintenanceModel;
//# sourceMappingURL=maintenance.d.ts.map