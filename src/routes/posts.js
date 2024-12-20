import Joi from "joi";
import { Router } from "express";
import { celebrate, Segments } from "celebrate";
import { addPost, getPostById, getPosts, updatePostById } from "../controllers/posts.js";
import { idParamSchema } from "./utils.js";

const postRouter = new Router();

const newPostSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
        sender: Joi.string().required(),
    }),
};
const getPostsSchema = {
    [Segments.QUERY]: Joi.object({
        sender: Joi.string().optional(),
    })
};
const updatePostSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
    })
};

postRouter
    .route("/")
    .post(celebrate(newPostSchema), addPost)
    .get(celebrate(getPostsSchema), getPosts);
postRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(getPostById)
    .put(celebrate(updatePostSchema), updatePostById);

export default postRouter;
