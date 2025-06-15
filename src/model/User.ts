import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String, 
    required: true
  },
  createdAt: {
    type: Date, 
    required: true,
    default: Date.now
  }
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    // match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  verifyCode: {
    type: String,
    required: [true, 'Verification code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verification code expiry is required'],
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  messages: [MessageSchema]
}); 

const UserModel = (mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User', UserSchema));

export default UserModel;