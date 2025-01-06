import { Schema, model } from "mongoose";
import { commonSchemaOptions } from "./utils";

export interface IPost extends Document {
    sender: string;
    message: string;
}

const postSchema = new Schema<IPost>(
    {
        sender: { type: String, required: true },
        message: { type: String, required: true },
    },
    commonSchemaOptions(),
);

export default model("Post", postSchema);
