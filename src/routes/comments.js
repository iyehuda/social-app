import { Router } from "express";
import { addComment } from "../controllers/comments.js";

const commentRouter = new Router();

commentRouter.post("/", async (req, res) => {
    const { post, message, sender, ...extra } = req.body;

    const extraFields = Object.keys(extra);
    if (extraFields.length > 0) {
        return res.status(400).json({ error: `Unexpected extra fields: ${extraFields.join(", ")}` });
    }

    if (!post || !message || !sender) {
        return res.status(400).json({ error: "Post ID, message and sender are required" });
    }

    try {
        const newComment = await addComment({ post, sender, message });
        return res.status(201).json(newComment);
    } catch (err) {
        console.error("Error in creating comment:", err);

        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(500).json({ error: "Failed to create comment" });
    }
});

export default commentRouter;
