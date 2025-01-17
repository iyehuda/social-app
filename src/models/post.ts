import { Document, Schema, model } from "mongoose";
import User from "./user";
import { commonSchemaOptions } from "./utils";

export interface IPost extends Document {
    author: Schema.Types.ObjectId
    message: string
}

const postSchema = new Schema<IPost>(
    {
        author: { required: true, type: Schema.Types.ObjectId },
        message: { required: true, type: String },
    },
    commonSchemaOptions(),
);

postSchema.pre("save", async function checkAuthorExists() {
    if (!await User.findById(this.author)) {
        throw Object.assign(new Error(`User "${this.author}" not found`), { status: 404 });
    }
});

export default model("Post", postSchema);
