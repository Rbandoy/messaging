import mongoose from 'mongoose';
interface MessageBody {
    title: string;
    content: string;
}
export interface MessageAttribute {
    enMessageBody: MessageBody;
    zhMessageBody: MessageBody;
    targetMember: string;
    targetMemberLevels: string;
}
export declare type MessageDocument = mongoose.Document & MessageAttribute;
export declare const MessageModel: mongoose.Model<MessageDocument, {}>;
export default MessageModel;
//# sourceMappingURL=message.d.ts.map