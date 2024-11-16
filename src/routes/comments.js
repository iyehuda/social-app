import { Router } from "express";
import { addComment, getComments, getCommentById, updateCommentById } from "../controllers/comments.js";

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

commentRouter.get("/", async (req, res) => {
    try {
        const { post, sender } = req.query;
        const comments = await getComments({ post, sender });
        return res.json(comments);
    } catch (err) {
        console.error("Error in fetching comments:", err);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
});

commentRouter.get("/:id", async (req, res) => {
    try {
        const comment = await getCommentById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.json(comment);
    } catch (err) {
        console.error("Error in fetching comment:", err);
        return res.status(500).json({ error: "Failed to fetch comment" });
    }
});

commentRouter.put("/:id", async (req, res) => {
    const { message, ...extra } = req.body;
    const extraFields = Object.keys(extra);

    if (extraFields.length > 0) {
        return res.status(400).json({ error: `Unexpected extra fields: ${extraFields.join(", ")}` });
    }

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const comment = await updateCommentById(req.params.id, { message });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.json(comment);
    } catch (err) {
        console.error("Error in updating comment:", err);
        return res.status(500).json({ error: "Failed to update comment" });
    }
});


export default commentRouter;
