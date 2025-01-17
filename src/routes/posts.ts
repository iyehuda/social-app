import { Segments, celebrate } from "celebrate";
import { idParamSchema, validObjectId } from "./utils";
import Joi from "joi";
import PostsController from "../controllers/posts";
import { Router } from "express";

const postRouter = Router();
const controller = new PostsController();

const newPostSchema = {
    [Segments.BODY]: Joi.object({
        author: Joi.string().custom(validObjectId).required(),
        message: Joi.string().required(),
    }),
};
const getPostsSchema = {
    [Segments.QUERY]: Joi.object({
        author: Joi.string().custom(validObjectId).optional(),
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
