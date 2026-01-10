import mongoose ,{
  Schema,
  model,
  Document,
  models
} from "mongoose"

export interface Message extends Document{
    _id: string;
    content:string;
    createdAt:Date
}
const MessageSchema:Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document{
    userName:string;
    email:string;
    password:string;
    forgotPasswordCode?:string;
    forgotPasswordCodeExpiry?:Date;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isVerified:Boolean;
    isacceptingMessage:Boolean;
    messages:Message[]
}

const UserSchema:Schema<User> = new Schema({
  userName: {
    type: String,
    required: [true, "UserName is reqired"],
    // unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is reuired"],
    // match:[/^(?=.{1,254}$)(?=.{1,64}@)(?!\.)(?!.*\.\.)[A-Z0-9._%+-]+(?<!\.)@(?:(?!-)[A-Z0-9-]{1,63}(?<!-)\.)+[A-Z]{2,63}$/,'Please use a valid email address'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is reuired"],
    unique: true,
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
  //Array of MessageSchema(datatype of messages)
  messages:[MessageSchema]
});

//nextjs runs things in edge time unlike app made with expressjs (server starts once)
export const UserModel = (models.users as mongoose.Model<User>) || model<User>("users", UserSchema)

