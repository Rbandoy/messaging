import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({}, {
  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  strict: false
});
interface MessageBody {
  title: string
  content: string
}
export interface MessageAttribute {
  enMessageBody: MessageBody;
  zhMessageBody: MessageBody;
  targetMember: string;
  targetMemberLevels: string
}

export type MessageDocument = mongoose.Document & MessageAttribute;
export  const MessageModel = mongoose.model<MessageDocument>('message', messageSchema);
export default MessageModel;
