import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    sender: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default model("Comment", commentSchema);
