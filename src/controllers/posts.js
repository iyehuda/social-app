import mongoose from "mongoose";
import Post from "../models/post.js";

export async function addPost(post) {
    return await Post.create(post);
}

export async function getPosts(filters) {
    const query = {};

    if (filters.sender) {
        query.sender = filters.sender.toString();
    }

    return await Post.find(query);
}

export async function getPostById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    return await Post.findById(id);
}

export async function updatePostById(id, { message }) {
    const post = await getPostById(id);

    if (post) {
        post.message = message;
        post.save();
    }

    return post;
}
