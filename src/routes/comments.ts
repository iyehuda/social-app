import { Segments, celebrate } from "celebrate";
import { idParamSchema, validObjectId } from "./utils";
import CommentsController from "../controllers/comments";
import Joi from "joi";
import { Router } from "express";

const commentRouter = Router();
const controller = new CommentsController();

const newCommentSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
        post: Joi.string().custom(validObjectId).required(),
        sender: Joi.string().required(),
    }),
};
const getCommentsSchema = {
    [Segments.QUERY]: Joi.object({
        post: Joi.string().custom(validObjectId).optional(),
        sender: Joi.string().optional(),
    }),
};
const updateCommentSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
    }),
};

commentRouter
    .route("/")
    .get(celebrate(getCommentsSchema), controller.getItems.bind(controller))
    .post(celebrate(newCommentSchema), controller.create.bind(controller));
commentRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(celebrate(updateCommentSchema), controller.updateItemById.bind(controller))
    .delete(controller.deleteItemById.bind(controller));

export default commentRouter;
