import Comment from "../models/comment.js";
import { getPostById } from "./posts.js";

export async function addComment(comment) {

    const post = await getPostById(comment.post);
    if (!post) {
        throw new Error("Post not found");
    }

    return await Comment.create(comment);
}

export async function getComments(filters) {
    const query = {};

    if (filters.post) {
        query.post = filters.post.toString();
    }

    if (filters.sender) {
        query.sender = filters.sender.toString();
    }

    return await Comment.find(query).populate('post', 'message sender');
}