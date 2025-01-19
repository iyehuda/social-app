import { Segments, celebrate } from "celebrate";
import { idParamSchema, validObjectId } from "./utils";
import CommentsController from "../controllers/comments";
import Joi from "joi";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth";

const commentRouter = Router();
const controller = new CommentsController();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comments management
 *
 * components:
 *   schemas:
 *     CommentCreationDetails:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The comment message content
 *         post:
 *           type: string
 *           description: The post ID this comment belongs to
 *       example:
 *         message: "This is a great post!"
 *         post: "678978cff1f71e3b0dd7bb45"
 *     CommentUpdateDetails:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The new comment message
 *       example:
 *         message: "This is a wonderful post! (updated)"
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The comment ID
 *         author:
 *           type: string
 *           description: The author user ID
 *         message:
 *           type: string
 *           description: The comment message content
 *         post:
 *           type: string
 *           description: The post ID this comment belongs to
 *       example:
 *         id: "678978cff1f71e3b0dd7bb45"
 *         author: "6739b7b2944556561a86110a"
 *         message: "This is a great post!"
 *         post: "679912cff1f71e3b0dd7bb45"
 */
const newCommentSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
        post: Joi.string().custom(validObjectId).required(),
    }),
};
const getCommentsSchema = {
    [Segments.QUERY]: Joi.object({
        author: Joi.string().custom(validObjectId).optional(),
        post: Joi.string().custom(validObjectId).optional(),
    }),
};
const updateCommentSchema = {
    [Segments.BODY]: Joi.object({
        message: Joi.string().required(),
    }),
};

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments with optional filtering by author or post
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter comments by author
 *       - in: query
 *         name: post
 *         schema:
 *           type: string
 *         description: Filter comments by post
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid filters
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreationDetails'
 *     responses:
 *       201:
 *         description: The newly created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid comment data (e.g. missing fields, invalid author ID)
 *       404:
 *         description: Author or post not found
 */
commentRouter
    .route("/")
    .get(celebrate(getCommentsSchema), controller.getItems.bind(controller))
    .post(authMiddleware, celebrate(newCommentSchema), controller.create.bind(controller));

/**
 * @swagger
 * /comments/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The comment ID
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: The requested comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: The comment was not found
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdateDetails'
 *     responses:
 *       200:
 *         description: The updated comment
 *         content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdateDetails'
 *       400:
 *         description: Invalid comment ID or update details
 *       404:
 *         description: The comment was not found
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: The comment was deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: The comment was not found
 */
commentRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(authMiddleware, celebrate(updateCommentSchema), controller.updateItemById.bind(controller))
    .delete(authMiddleware, controller.deleteItemById.bind(controller));

export default commentRouter;