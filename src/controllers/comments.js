import Comment from "../models/comment.js";
import { getPostById } from "./posts.js";

export async function addComment(comment) {
    // Verify that the post exists before creating the comment
    const post = await getPostById(comment.post);
    if (!post) {
        throw new Error("Post not found");
    }

    return await Comment.create(comment);
}
