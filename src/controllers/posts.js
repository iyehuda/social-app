import Post from "../models/post.js";

export async function addPost(post) {
    return (await Post.create(post)).toJSON();
}

export async function getPosts() {
    return (await Post.find()).map((post) => post.toJSON());
}
