import Joi from "joi";
import { Router } from "express";
import { createValidator } from "express-joi-validation";
import {
    addComment,
    getComments,
    getCommentById,
    updateCommentById,
    deleteCommentById,
} from "../controllers/comments.js";
import { idParamSchema, validObjectId } from "./utils.js";

const commentRouter = new Router();
const validator = createValidator();

const newCommentSchema = Joi.object({
    post: Joi.string().custom(validObjectId).required(),
    message: Joi.string().required(),
    sender: Joi.string().required(),
});
const getCommentsSchema = Joi.object({
    post: Joi.string().custom(validObjectId).optional(),
    sender: Joi.string().optional(),
});
const updateCommentSchema = Joi.object({
    message: Joi.string().required(),
});

commentRouter
    .route("/")
    .post(validator.body(newCommentSchema), addComment)
    .get(validator.query(getCommentsSchema), getComments);
commentRouter
    .route("/:id")
    .all(validator.params(idParamSchema))
    .get(getCommentById)
    .put(validator.body(updateCommentSchema), updateCommentById)
    .delete(deleteCommentById);

export default commentRouter;
