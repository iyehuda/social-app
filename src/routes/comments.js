import { Router } from "express";
import { createValidator } from "express-joi-validation";
import {
    addComment,
    getComments,
    getCommentById,
    updateCommentById,
    deleteCommentById,
} from "../controllers/comments.js";
import Joi from "joi";

const commentRouter = new Router();
const validator = createValidator();

const newCommentSchema = Joi.object({
    post: Joi.string().required(),
    message: Joi.string().required(),
    sender: Joi.string().required(),
});
commentRouter.post("/", validator.body(newCommentSchema), async (req, res) => {
    const { post, message, sender } = req.body;

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

const getCommentsSchema = Joi.object({
    post: Joi.string().optional(),
    sender: Joi.string().optional(),
});
commentRouter.get("/", validator.query(getCommentsSchema), async (req, res) => {
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

const updateCommentSchema = Joi.object({
    message: Joi.string().required(),
});
commentRouter.put("/:id", validator.body(updateCommentSchema), async (req, res) => {
    const { message } = req.body;

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

commentRouter.delete("/:id", async (req, res) => {
    try {
        const comment = await deleteCommentById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.status(204).send();
    } catch (err) {
        console.error("Error in deleting comment:", err);
        return res.status(500).json({ error: "Failed to delete comment" });
    }
});

export default commentRouter;
