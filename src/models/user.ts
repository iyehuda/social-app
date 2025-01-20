import mongoose, { Document, Schema } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IUser extends Document {
    email: string
    username: string
    password: string
    _id: string
    refreshToken?: string[]
}

const userSchema = new Schema<IUser>(
    {
        email: { required: true, type: String, unique: [true, "email is already taken"] },
        password: { required: true, type: String },
        refreshToken: { default: [], type: [String] },
        username: { required: true, type: String, unique: [true, "username is already taken"] },
    },
    commonSchemaOptions(),
);

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
