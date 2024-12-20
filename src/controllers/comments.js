import Comment from "../models/comment.js";

export async function addComment(req, res) {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
}

export async function getComments(req, res) {
    const comments = await Comment.find(req.query);
    res.json(comments);
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
