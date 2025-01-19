import mongoose, { Document, Schema } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    _id: string;
    refreshToken?: string[];
}

const userSchema = new Schema<IUser>(
    {
        email: { required: true, type: String, unique: [true, "email is already taken"] },
        username: { required: true, type: String, unique: [true, "username is already taken"] },
        password: { type: String, required: true },
        refreshToken: { type: [String], default: [] }
    },
    commonSchemaOptions(),
);

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;