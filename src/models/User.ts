import mongoose, {
  Schema,
  model,
  Document,
  models
} from "mongoose";

export type { Message } from "./Message";
export { MessageModel } from "./Message";

export interface User extends Document {
    userName: string;
    email: string;
    password: string;
    forgotPasswordCode?: string;
    forgotPasswordCodeExpiry?: Date;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isacceptingMessage: boolean;
}

const UserSchema: Schema<User> = new Schema({
  userName: {
    type: String,
    required: [true, "UserName is reqired"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is reuired"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is reqired"],
    trim: true,
  },
  verifyCodeExpiry: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isacceptingMessage: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  forgotPasswordCode: {
    type: String,
    trim: true,
  },
  forgotPasswordCodeExpiry: {
    type: Date,
    trim: true,
  },
});

UserSchema.index({ userName: 1 });

export const UserModel = (models.users as mongoose.Model<User>) || model<User>("users", UserSchema);
