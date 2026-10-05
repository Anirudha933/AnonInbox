import mongoose, { Schema, Document, models, model, Types } from "mongoose";

export interface Message extends Document {
    _id: string;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim:true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
},{timestamps:false,});

MessageSchema.index({ userId: 1, createdAt: -1 });

export const MessageModel = (models.messages as mongoose.Model<Message>) || model<Message>("messages", MessageSchema);
