/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */

import { connect, disconnect } from "../db";
import Comment from "../models/comment";
import Post from "../models/post";
import User from "../models/user";
import { dbConnectionString } from "../config";

async function seed() {
    await connect(dbConnectionString);

    console.log("Connected to MongoDB");

    await Comment.deleteMany();
    await Post.deleteMany();
    await User.deleteMany();

    const alice = await User.create({
        email: "alice@example.com",
        username: "alice",
    });
    const bob = await User.create({
        email: "bob@example.com",
        username: "bob",
    });
    const david = await User.create({
        email: "david@example.com",
        username: "david",
    });

    const posts = await Post.create([{
        author: alice._id,
        message: "Hello, World!",
    }, {
        author: bob._id,
        message: "This is a test post",
    }]);

    await Comment.create([
        {
            author: bob._id,
            message: "Great first post!",
            post: posts[0]._id,
        },
        {
            author: david._id,
            message: "Welcome to the platform!",
            post: posts[0]._id,
        },
        {
            author: alice._id,
            message: "Nice test post, Bob!",
            post: posts[1]._id,
        },
    ]);

    await disconnect();
    console.log("Disconnected from MongoDB");
}

seed().then(() => {
    console.log("Database seeded!");
}).catch(console.error);
