import mongoose from "mongoose";
import Post from "../models/post.js";

export async function addPost(post) {
    return (await Post.create(post)).toJSON();
}

export async function getPosts() {
    return (await Post.find()).map((post) => post.toJSON());
}

export async function getPostById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    const post = await Post.findById(id);

    if (!post) {
        return null;
    }

    return post.toJSON();
}
