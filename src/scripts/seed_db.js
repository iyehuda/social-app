import mongoose from "mongoose";
import { dbConnectionString } from "../config.js";
import { connect, disconnect } from "../db.js";
import Post from "../models/post.js";

await connect(dbConnectionString);

console.log("Connected to MongoDB");

await Post.deleteMany();

await Post.create([
    {
        _id: new mongoose.Types.ObjectId("6738b7b2944556561a86110a"),
        sender: "alice@example.com",
        message: "Hello, World!",
    },
    {
        sender: "bob@example.com",
        message: "This is a test post",
    },
]);

await disconnect();
console.log("Disconnected from MongoDB");
