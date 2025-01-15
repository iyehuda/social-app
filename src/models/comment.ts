import { Document, Schema, model } from "mongoose";
import Post from "./post";
import { commonSchemaOptions } from "./utils";

export interface IComment extends Document {
    post: Schema.Types.ObjectId
    sender: string
    message: string
    createdAt: Date
}

const commentSchema = new Schema<IComment>(
    {
        createdAt: { default: Date.now, type: Date },
        message: { required: true, type: String },
        post: { ref: "Post", required: true, type: Schema.Types.ObjectId },
        sender: { required: true, type: String },
    },
    commonSchemaOptions(),
);

commentSchema.pre("save", async function checkPostExists() {
    const post = await Post.findById(this.post);

    if (!post) {
        throw Object.assign(new Error(`Post "${this.post}" not found`), { status: 404 });
    }
});

export default model("Comment", commentSchema);
