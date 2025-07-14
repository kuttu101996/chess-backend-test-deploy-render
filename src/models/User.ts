import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  gameName: string;
  profilePicture: string;
  password: string;
  rating: string;
  friends: mongoose.Schema.Types.ObjectId[];
  friendRequests: mongoose.Schema.Types.ObjectId[];
  isPremium: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, trim: true, default: "" },
    gameName: { type: String, trim: true, default: "" },
    profilePicture: { type: String, trim: true, default: "" },
    rating: { type: String, trim: true, default: "" },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
