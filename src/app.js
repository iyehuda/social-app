import express from "express";
import bodyParser from "body-parser";
import postRouter from "./routes/posts.js";

export function createApp() {
    const app = express();

    app.use(bodyParser.json());
    app.use("/posts", postRouter);

    return app;
}
