import { Segments, celebrate } from "celebrate";
import Joi from "joi";
import { Router } from "express";
import UsersController from "../controllers/users";
import { idParamSchema } from "./utils";

const userRouter = Router();
const controller = new UsersController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 *
 * components:
 *   schemas:
 *     UserCreationDetails:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email, must be a unique, valid mail address
 *         username:
 *           type: string
 *           description: The user identifying name, must be unique
 *       example:
 *         email: "john@example.com"
 *         username: "john"
 *     UserUpdateDetails:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email, must be a unique, valid mail address
 *       example:
 *         email: "different@example.com"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         email:
 *           type: string
 *           description: The user email, must be a unique, valid mail address
 *         username:
 *           type: string
 *           description: The user identifying name, must be unique
 *       example:
 *         id: "6738b7b2944556561a86110a"
 *         email: "john@example.com"
 *         username: "john"
 */
const newUserSchema = {
    [Segments.BODY]: Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().required(),
    }),
};
const getUsersSchema = {
    [Segments.QUERY]: Joi.object({}),
};
const updateUserSchema = {
    [Segments.BODY]: Joi.object({
        email: Joi.string().email().required(),
    }),
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreationDetails'
 *     responses:
 *       201:
 *         description: The newly created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user creation details (e.g. invalid email)
 *       409:
 *         description: The email or username is already taken
 */
userRouter
    .route("/")
    .get(celebrate(getUsersSchema), controller.getItems.bind(controller))
    .post(celebrate(newUserSchema), controller.create.bind(controller));

/**
 * @swagger
 * /users/{id}:
 *   parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema:
 *       type: string
 *     description: The user ID
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: The user was not found
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateDetails'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID or user update details (e.g. invalid email)
 *       404:
 *         description: The user was not found
 *       409:
 *         description: The email is already taken
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     responses:
 *       204:
 *         description: The user was deleted successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: The user was not found
 */
userRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(celebrate(updateUserSchema), controller.updateItemById.bind(controller))
    .delete(controller.deleteItemById.bind(controller));

export default userRouter;
