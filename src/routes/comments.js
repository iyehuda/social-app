import Joi from "joi";
import { Router } from "express";
import { celebrate, Segments } from "celebrate";
import {
    addComment,
    getComments,
    getCommentById,
    updateCommentById,
    deleteCommentById,
} from "../controllers/comments.js";
import { idParamSchema, validObjectId } from "./utils.js";

const commentRouter = new Router();

const newCommentSchema = {
    [Segments.BODY]: Joi.object({
        post: Joi.string().custom(validObjectId).required(),
        message: Joi.string().required(),
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
    .post(celebrate(newCommentSchema), addComment)
    .get(celebrate(getCommentsSchema), getComments);
commentRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(getCommentById)
    .put(celebrate(updateCommentSchema), updateCommentById)
    .delete(deleteCommentById);

export default commentRouter;
