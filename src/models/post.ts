import { Document, Schema, model } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IPost extends Document {
    author: string
    message: string
}

const postSchema = new Schema<IPost>(
    {
        author: { required: true, type: String },
        message: { required: true, type: String },
    },
    commonSchemaOptions(),
);

export default model("Post", postSchema);
