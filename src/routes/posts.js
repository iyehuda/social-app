import { Router } from "express";
import { getAllPosts } from "../controllers/posts.js";

const postRouter = new Router();

postRouter.get("/", (req, res) => {
    const posts = getAllPosts();

    res.json(posts);
});

export default postRouter;
