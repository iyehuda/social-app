import express from "express";
import bodyParser from "body-parser";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import { errors } from "celebrate";

export function createApp() {
    const app = express();

    app.use(bodyParser.json());
    app.use("/posts", postRouter);
    app.use("/comments", commentRouter);
    app.use(errors());

    return app;
}
