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
        message: "Hello, World!",
        sender: "alice@example.com",
    });

    const secondPost = await Post.create({
        message: "This is a test post",
        sender: "bob@example.com",
    });

    await Comment.create([
        {
            message: "Great first post!",
            post: firstPost._id,
            sender: "charlie@example.com",
        },
        {
            message: "Welcome to the platform!",
            post: firstPost._id,
            sender: "david@example.com",
        },
        {
            message: "Nice test post, Bob!",
            post: secondPost._id,
            sender: "alice@example.com",
        },
    ]);

    await disconnect();
    console.log("Disconnected from MongoDB");
}

seed().then(() => {
    console.log("Database seeded!");
}).catch(console.error);
