import { Segments, celebrate } from "celebrate";
import { idParamSchema, validObjectId } from "./utils";
import Joi from "joi";
import PostsController from "../controllers/posts";
import { Router } from "express";

const postRouter = Router();
const controller = new PostsController();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management
 *
 * components:
 *   schemas:
 *     PostCreationDetails:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *           description: The post author user ID
 *         message:
 *           type: string
 *           description: The post message content
 *       example:
 *         author: "6738b7b2944556561a86110a"
 *         message: "Hello, world!"
 *     PostUpdateDetails:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The new post message
 *       example:
 *         message: "Hello, world! (updated)"
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The post ID
 *         author:
 *           type: string
 *           description: The author user ID
 *         message:
 *           type: string
 *           description: The post message
 *       example:
 *         id: "678978cff1f71e3b0dd7bb45"
 *         author: "6738b7b2944556561a86110a"
 *         message: "Hello, world!"
 */
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

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts with optional filtering by author
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter posts by author
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid filters
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostCreationDetails'
 *     responses:
 *       201:
 *         description: The newly created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post data (e.g. missing fields, invalid author ID)
 *       404:
 *         description: Author not found
 */
postRouter
    .route("/")
    .get(celebrate(getPostsSchema), controller.getItems.bind(controller))
    .post(celebrate(newPostSchema), controller.create.bind(controller));

/**
 * @swagger
 * /posts/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The post ID
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post ID
 *       404:
 *         description: The post was not found
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostUpdateDetails'
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post ID or post update details
 *       404:
 *         description: The post was not found
 */
postRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(celebrate(updatePostSchema), controller.updateItemById.bind(controller));

export default postRouter;
