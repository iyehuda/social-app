import Joi from "joi";
import { Router } from "express";
import { createValidator } from "express-joi-validation";
import { addPost, getPostById, getPosts, updatePostById } from "../controllers/posts.js";
import { idParamSchema } from "./utils.js";

const postRouter = new Router();
const validator = createValidator();

const newPostSchema = Joi.object({
    message: Joi.string().required(),
    sender: Joi.string().required(),
});
const getPostsSchema = Joi.object({
    sender: Joi.string().optional(),
});
const updatePostSchema = Joi.object({
    message: Joi.string().required(),
});

postRouter
    .route("/")
    .post(validator.body(newPostSchema), addPost)
    .get(validator.query(getPostsSchema), getPosts);
postRouter
    .route("/:id")
    .all(validator.params(idParamSchema))
    .get(getPostById)
    .put(validator.body(updatePostSchema), updatePostById);

export default postRouter;
