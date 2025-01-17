import { Document, Schema, model } from "mongoose";
import Post from "./post";
import User from "./user";
import { commonSchemaOptions } from "./utils";

export interface IComment extends Document {
    post: Schema.Types.ObjectId
    author: Schema.Types.ObjectId
    message: string
    createdAt: Date
}

const commentSchema = new Schema<IComment>(
    {
        author: { ref: "User", required: true, type: Schema.Types.ObjectId },
        createdAt: { default: Date.now, type: Date },
        message: { required: true, type: String },
        post: { ref: "Post", required: true, type: Schema.Types.ObjectId },
    },
    commonSchemaOptions(),
);

commentSchema.pre("save", async function checkAuthorAndPostExist() {
    if (!await User.findById(this.author)) {
        throw Object.assign(new Error(`User "${this.author}" not found`), { status: 404 });
    }

    if (!await Post.findById(this.post)) {
        throw Object.assign(new Error(`Post "${this.post}" not found`), { status: 404 });
    }
});

export default model("Comment", commentSchema);
