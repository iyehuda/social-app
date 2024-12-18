import Post from "../models/post.js";

export async function addPost(req, res) {
    const post = await Post.create(req.body);

    res.status(201).json(post);
}

export async function getPosts(req, res) {
    const posts = await Post.find(req.query);

    res.json(posts);
}

export async function getPostById(req, res) {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404).json({ error: "Post not found" });
    } else {
        res.json(post);
    }
}

export async function updatePostById(req, res) {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404).json({ error: "Post not found" });
    } else {
        post.message = req.body.message;
        post.save();
        res.json(post);
    }
}
