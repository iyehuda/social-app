import { Router } from "express";
import { addPost, getPostById, getPosts } from "../controllers/posts.js";

const postRouter = new Router();

postRouter.post("/", async (req, res) => {
    const { message, sender, ...extra } = req.body;

    const extraFields = Object.keys(extra);

    if (extraFields.length > 0) {
        return res.status(400).json({ error: `Unexpected extra fields: ${extraFields.join(", ")}` });
    }

    if (!message || !sender) {
        return res.status(400).json({ error: "Message and sender are required" });
    }

    try {
        const newPost = await addPost({ sender, message });

        return res.status(201).json(newPost);
    } catch (err) {
        console.error("Error in creating post:", err);

        return res.status(500).json({ error: "Failed to create post" });
    }
});

postRouter.get("/", async (req, res) => {
    try {
        const posts = await getPosts();

        return res.json(posts);
    } catch (err) {
        console.error("Error in fetching posts:", err);

        return res.status(500).json({ error: "Failed to fetch posts" });
    }
});

postRouter.get("/:id", async (req, res) => {
    const post = await getPostById(req.params.id);

    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    return res.json(post);
});

export default postRouter;
