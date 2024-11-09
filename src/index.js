import express from "express";
import postRouter from "./routes/posts.js";

const app = express();
const port = process.env.PORT || 3000;

app.use("/posts", postRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
