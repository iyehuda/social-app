import { Document, Schema, model } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IPost extends Document {
    sender: string
    message: string
}

const postSchema = new Schema<IPost>(
    {
        message: { required: true, type: String },
        sender: { required: true, type: String },
    },
    commonSchemaOptions(),
);

export default model("Post", postSchema);
