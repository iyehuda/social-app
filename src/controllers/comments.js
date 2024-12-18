import Comment from "../models/comment.js";
import { getPostById } from "./posts.js";

export async function addComment(req, res) {
    const comment = req.body;

    const post = await getPostById(comment.post);

    if (!post) {
        res.status(404).json({ error: "Post does not exist" });
    } else {
        const newComment = await Comment.create(comment);
        res.status(201).json(newComment);
    }
}

export async function getComments(req, res) {
    const comments = await Comment.find(req.query);

    return res.json(comments);
}

export async function getCommentById(req, res) {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404).json({ error: "Comment not found" });
    } else {
        res.json(comment);
    }
}

export async function updateCommentById(req, res) {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404).json({ error: "Comment not found" });
    } else {
        comment.message = req.body.message;
        await comment.save();

        res.json(comment);
    }
}

export async function deleteCommentById(req, res) {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
        res.status(404).json({ error: "Comment not found" });
    } else {
        res.status(204).send();
    }
}
