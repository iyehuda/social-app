import { Environment, environment } from "./config";
import bodyParser from "body-parser";
import commentRouter from "./routes/comments";
import { errors } from "celebrate";
import express from "express";
import postRouter from "./routes/posts";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import userRouter from "./routes/users";
import authRouter from "./routes/auth";

const apiSpecs = swaggerJSDoc({
    apis: ["src/routes/*.ts"],
    definition: {
        info: {
            description: "This is an API for a social app",
            title: "Social App API",
            version: "1.0.0",
        },
        openapi: "3.1.0",
    },
});

export function createApp() {
    const app = express();

    app.use(bodyParser.json());

    if (environment !== Environment.PROD) {
        app.use("/docs", swaggerUI.serve, swaggerUI.setup(apiSpecs));
    }

    app.use("/users", userRouter);
    app.use("/posts", postRouter);
    app.use("/comments", commentRouter);
    app.use("/auth", authRouter);
    app.use(errors());

    return app;
}
