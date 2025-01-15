import bodyParser from "body-parser";
import commentRouter from "./routes/comments";
import { errors } from "celebrate";
import express from "express";
import postRouter from "./routes/posts";

export function createApp() {
    const app = express();

    app.use(bodyParser.json());
    app.use("/posts", postRouter);
    app.use("/comments", commentRouter);
    app.use(errors());

    return app;
}
