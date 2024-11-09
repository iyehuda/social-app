import express from "express";
import postRouter from "./routes/posts.js";

export function createApp() {
    const app = express();

    app.use("/posts", postRouter);

    return app;
}
