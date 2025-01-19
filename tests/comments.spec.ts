import Comment, { IComment } from "../src/models/comment";
import Post, { IPost } from "../src/models/post";
import { Teardown, createDatabase, nonExistentId } from "./utils";
import User, { IUser } from "../src/models/user";
import { connect, disconnect } from "../src/db";
import { HydratedDocument } from "mongoose";
import { createApp } from "../src/app";
import request from "supertest";
import jwt from "jsonwebtoken";
import { tokenSecret } from "../src/config";

let teardown: Teardown;
const app = createApp();
const testPostAuthor = { email: "john@example.org", username: "John Doe", password: "password123" };
const testCommentAuthor = { email: "adam@example.org", username: "Adam Comment", password: "password123" };
const testPostContent = { message: "Hello World" };
const testCommentContent = { message: "Hello World" };
let testComment: typeof testCommentContent & { author: string, post: string };
let testPost: typeof testPostContent & { author: string };
let testCommentDoc: HydratedDocument<IComment>;
let testPostDoc: HydratedDocument<IPost>;
let testPostAuthorDoc: HydratedDocument<IUser>;
let testCommentAuthorDoc: HydratedDocument<IUser>;

const generateJWT = (user: IUser) => {
    return jwt.sign({ _id: user.id }, tokenSecret!, { expiresIn: "1h" });
};

beforeAll(async () => {
    const { dbConnectionString, closeDatabase } = await createDatabase();
    teardown = closeDatabase;

    await connect(dbConnectionString);
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
});

afterAll(async () => {
    await disconnect();
    await teardown();
});

beforeEach(async () => {
    testPostAuthorDoc = await User.create(testPostAuthor);
    testPost = { ...testPostContent, author: testPostAuthorDoc.id };
    testPostDoc = await Post.create(testPost);
    testCommentAuthorDoc = await User.create(testCommentAuthor);
    testComment = { ...testCommentContent, author: testCommentAuthorDoc.id, post: testPostDoc.id };
    testCommentDoc = await Comment.create(testComment);
});

afterEach(async () => {
    await testCommentDoc.deleteOne();
    await testPostDoc.deleteOne();
    await testPostAuthorDoc.deleteOne();
    await testCommentAuthorDoc.deleteOne();
});

describe("POST /comments", () => {
    afterAll(async () => {
        await Comment.deleteMany({});
    });

    it("should create a new comment", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ message: testComment.message, post: testComment.post });
        const body = response.body as IComment;
        const comment = await Comment.findById(body.id);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(testComment.message);
        expect(comment!.message).toBe(testComment.message);
        expect(comment!.author.toString()).toBe(testCommentAuthorDoc.id);
        expect(comment!.post.toString()).toBe(testComment.post);
    });

    it("should return 404 if post does not exist", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ message: testComment.message, post: nonExistentId });

        expect(response.status).toBe(404);
    });

    it("should return 400 if message or post is missing", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const noMessageResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ post: testPostDoc.id });
        const noPostResponse = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ message: "Hello World" });

        expect(noMessageResponse.status).toBe(400);
        expect(noPostResponse.status).toBe(400);
    });
});

describe("GET /comments", () => {
    it("should get all comments", async () => {
        const response = await request(app).get("/comments");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testComment, id: testCommentDoc.id }]);
    });

    it("should get comments by author", async () => {
        const response = await request(app).get(`/comments?author=${testComment.author}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testComment, id: testCommentDoc.id }]);
    });

    it("should return an empty result if no comments found", async () => {
        const response = await request(app).get(`/comments?author=${nonExistentId}`);
        const comments = response.body as IComment[];

        expect(response.status).toBe(200);
        expect(comments.length).toBe(0);
    });
});

describe("GET /comments/:id", () => {
    it("should get a comment by id", async () => {
        const response = await request(app).get(`/comments/${testCommentDoc.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(testComment);
    });

    it("should return 404 if comment not found", async () => {
        const response = await request(app).get(`/comments/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});

describe("PUT /comments/:id", () => {
    it("should update a comment by id", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const commentUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/comments/${testCommentDoc.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(commentUpdate);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(commentUpdate.message);
    });

    it("should return 400 if message is missing", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const emptyCommentUpdate = {};

        const response = await request(app)
            .put(`/comments/${testCommentDoc.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(emptyCommentUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if comment not found", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const commentUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/comments/${nonExistentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(commentUpdate);

        expect(response.status).toBe(404);
    });
});

describe("DELETE /comments/:id", () => {
    it("should delete a comment by id", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const response = await request(app)
            .delete(`/comments/${testCommentDoc.id}`)
            .set("Authorization", `Bearer ${token}`);
        const comment = await Comment.findById(testCommentDoc.id);

        expect(response.status).toBe(204);
        expect(comment).toBeNull();
    });

    it("should return 404 if comment not found", async () => {
        const token = generateJWT(testCommentAuthorDoc);
        const response = await request(app)
            .delete(`/comments/${nonExistentId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});