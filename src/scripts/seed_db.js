import mongoose from "mongoose";
import { dbConnectionString } from "../config.js";
import { connect, disconnect } from "../db.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";

await connect(dbConnectionString);

console.log("Connected to MongoDB");

await Post.deleteMany();
await Comment.deleteMany();

const firstPost = await Post.create({
    _id: new mongoose.Types.ObjectId("6738b7b2944556561a86110a"),
    sender: "alice@example.com",
    message: "Hello, World!",
});

const secondPost = await Post.create({
    sender: "bob@example.com",
    message: "This is a test post",
});

await Comment.create([
    {
        post: firstPost._id,
        sender: "charlie@example.com",
        message: "Great first post!",
    },
    {
        post: firstPost._id,
        sender: "david@example.com",
        message: "Welcome to the platform!",
    },
    {
        post: secondPost._id,
        sender: "alice@example.com",
        message: "Nice test post, Bob!",
    }
]);

await disconnect();
console.log("Disconnected from MongoDB");