import { Schema, model } from "mongoose";

const postSchema = new Schema({
    sender: { type: String, required: true },
    message: { type: String, required: true },
});

export default model("Post", postSchema);
