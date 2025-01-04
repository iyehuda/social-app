import { Schema, model } from "mongoose";
import { commonSchemaOptions } from "./utils.js";

const postSchema = new Schema(
    {
        sender: { type: String, required: true },
        message: { type: String, required: true },
    },
    commonSchemaOptions
);

export default model("Post", postSchema);
