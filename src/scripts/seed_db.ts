/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from "../db";
import Comment from "../models/comment";
import Post from "../models/post";
import { dbConnectionString } from "../config";
import mongoose from "mongoose";

async function seed() {
    await connect(dbConnectionString);

    console.log("Connected to MongoDB");

    await Post.deleteMany();
    await Comment.deleteMany();

    const firstPost = await Post.create({
        _id: new mongoose.Types.ObjectId("6738b7b2944556561a86110a"),
        author: "alice@example.com",
        message: "Hello, World!",
    });

    const secondPost = await Post.create({
        author: "bob@example.com",
        message: "This is a test post",
    });

    await Comment.create([
        {
            author: "charlie@example.com",
            message: "Great first post!",
            post: firstPost._id,
        },
        {
            author: "david@example.com",
            message: "Welcome to the platform!",
            post: firstPost._id,
        },
        {
            author: "alice@example.com",
            message: "Nice test post, Bob!",
            post: secondPost._id,
        },
    ]);

    await disconnect();
    console.log("Disconnected from MongoDB");
}

seed().then(() => {
    console.log("Database seeded!");
}).catch(console.error);
