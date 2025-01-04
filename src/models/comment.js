import { Schema, model } from "mongoose";
import Post from "./post.js";
import { commonSchemaOptions } from "./utils.js";

const commentSchema = new Schema(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
        sender: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    commonSchemaOptions
);

commentSchema.pre("save", async function () {
    const post = await Post.findById(this.post);

    if (!post) {
        throw Object.assign(new Error(`Post "${this.post}" not found`), { status: 404 });
    }
});

export default model("Comment", commentSchema);
