import { Segments, celebrate } from "celebrate";
import Joi from "joi";
import { Router } from "express";
import UsersController from "../controllers/users";
import { idParamSchema } from "./utils";

const userRouter = Router();
const controller = new UsersController();

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

userRouter
    .route("/")
    .get(celebrate(getUsersSchema), controller.getItems.bind(controller))
    .post(celebrate(newUserSchema), controller.create.bind(controller));
userRouter
    .route("/:id")
    .all(celebrate(idParamSchema))
    .get(controller.getItemById.bind(controller))
    .put(celebrate(updateUserSchema), controller.updateItemById.bind(controller))
    .delete(controller.deleteItemById.bind(controller));

export default userRouter;
