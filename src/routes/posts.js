import { Router } from "express";
import { addPost, getPostById, getPosts, updatePostById } from "../controllers/posts.js";
import { createValidator } from "express-joi-validation";
import Joi from "joi";

const postRouter = new Router();
const validator = createValidator();

const newPostSchema = Joi.object({
    message: Joi.string().required(),
    sender: Joi.string().required(),
});
postRouter.post("/", validator.body(newPostSchema), async (req, res) => {
    const { message, sender } = req.body;

    try {
        const newPost = await addPost({ message, sender });

        return res.status(201).json(newPost);
    } catch (err) {
        console.error("Error in creating post:", err);

        return res.status(500).json({ error: "Failed to create post" });
    }
});

const getPostsSchema = Joi.object({
    sender: Joi.string().optional(),
});
postRouter.get("/", validator.query(getPostsSchema), async (req, res) => {
    try {
        const { sender } = req.query;
        const posts = await getPosts({ sender });

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

const updatePostSchema = Joi.object({
    message: Joi.string().required(),
});
postRouter.put("/:id", validator.body(updatePostSchema), async (req, res) => {
    const { message } = req.body;

    try {
        const post = await updatePostById(req.params.id, { message });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.json(post);
    } catch (err) {
        console.error("Error in updating post:", err);

        return res.status(500).json({ error: "Failed to update post" });
    }
});

export default postRouter;
