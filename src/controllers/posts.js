import Post from "../models/post.js";

export async function addPost(post) {
    return (await Post.create(post)).toJSON();
}
