import Joi from "joi";
import PostsController from "../controllers/posts.js";
import { Router } from "express";
import { celebrate, Segments } from "celebrate";
import { idParamSchema } from "./utils.js";

const postRouter = new Router();
const controller = new PostsController();

const newPostSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
        sender: Joi.string().required(),
    }),
};
const getPostsSchema = {
    [Segments.QUERY]: Joi.object({
        sender: Joi.string().optional(),
    }),
};
const updatePostSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
    }),
};

postRouter
    .route("/")
    .get(celebrate(getPostsSchema), controller.getItems.bind(controller))
    .post(celebrate(newPostSchema), controller.create.bind(controller));
postRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(celebrate(updatePostSchema), controller.updateItemById.bind(controller));

export default postRouter;
