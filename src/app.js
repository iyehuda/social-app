import express from "express";
import bodyParser from "body-parser";

export function createApp() {
    const app = express();

    app.use(bodyParser.json());

    app.get("/", (req, res) => {
        res.send("Hello, World!");
    });

    return app;
}
