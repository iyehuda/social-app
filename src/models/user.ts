import { Document, Schema, model } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IUser extends Document {
    email: string
    username: string
}

const userSchema = new Schema<IUser>(
    {
        email: { required: true, type: String, unique: [true, "email is already taken"] },
        username: { required: true, type: String, unique: [true, "username is already taken"] },
    },
    commonSchemaOptions(),
);

export default model("User", userSchema);
