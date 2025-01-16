import Comment, { IComment } from "../src/models/comment";
import Post, { IPost } from "../src/models/post";
import { Teardown, createDatabase, nonExistentId } from "./utils";
import User, { IUser } from "../src/models/user";
import { connect, disconnect } from "../src/db";
import { HydratedDocument } from "mongoose";
import { createApp } from "../src/app";
import request from "supertest";

let teardown: Teardown;
const app = createApp();
const testPostAuthor = { email: "john@example.org", username: "John Doe" };
const testCommentAuthor = { email: "adam@example.org", username: "Adam Comment" };
const testPostContent = { message: "Hello World" };
const testCommentContent = { message: "Hello World" };
let testComment: typeof testCommentContent & { author: string, post: string };
let testPost: typeof testPostContent & { author: string };
let testCommentDoc: HydratedDocument<IComment>;
let testPostDoc: HydratedDocument<IPost>;
let testPostAuthorDoc: HydratedDocument<IUser>;
let testCommentAuthorDoc: HydratedDocument<IUser>;

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
        const response = await request(app).post("/comments").send(testComment);
        const body = response.body as IComment;
        const comment = await Comment.findById(body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(testComment);
        expect(comment!.message).toBe(testComment.message);
        expect(comment!.author.toString()).toBe(testComment.author);
        expect(comment!.post.toString()).toBe(testComment.post);
    });

    it("should return 404 if author or post does not exist", async () => {
        const commentWithNonExistentAuthor = { ...testCommentContent, author: nonExistentId, post: testPostDoc.id };
        const commentWithNonExistentPost = { ...testCommentContent, author: testPostAuthorDoc.id, post: nonExistentId };

        const nonExistentAuthorResponse = await request(app).post("/comments").send(commentWithNonExistentAuthor);
        const nonExistentPostResponse = await request(app).post("/comments").send(commentWithNonExistentPost);

        expect(nonExistentAuthorResponse.status).toBe(404);
        expect(nonExistentPostResponse.status).toBe(404);
    });

    it("should return 400 if message or author is missing", async () => {
        const commentWithoutAuthor = { message: "Hello World" };
        const commentWithoutMessage = { author: "John Doe" };

        const noAuthorResponse = await request(app).post("/comments").send(commentWithoutAuthor);
        const noMessageResponse = await request(app).post("/comments").send(commentWithoutMessage);

        expect(noAuthorResponse.status).toBe(400);
        expect(noMessageResponse.status).toBe(400);
    });

    it("should return 404 if post or user don't not exist", async () => {
        const commentWithNonExistentAuthor = {
            ...testCommentContent,
            author: nonExistentId,
            post: testPostDoc.id,
        };
        const commentWithNonExistentPost = {
            ...testCommentContent,
            author: testCommentAuthorDoc.id,
            post: nonExistentId,
        };

        const nonExistentAuthorResponse = await request(app).post("/comments").send(commentWithNonExistentAuthor);
        const nonExistentPostResponse = await request(app).post("/comments").send(commentWithNonExistentPost);

        expect(nonExistentAuthorResponse.status).toBe(404);
        expect(nonExistentPostResponse.status).toBe(404);
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
        const commentUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/comments/${testCommentDoc.id}`)
            .send(commentUpdate);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ ...testComment, ...commentUpdate });
    });

    it("should return 400 if message is missing", async () => {
        const emptyCommentUpdate = {};

        const response = await request(app)
            .put(`/comments/${testCommentDoc.id}`)
            .send(emptyCommentUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if comment not found", async () => {
        const commentUpdate = { message: "Updated Message" };

        const response = await request(app).put(`/comments/${nonExistentId}`).send(commentUpdate);

        expect(response.status).toBe(404);
    });
});

describe("DELETE /comments/:id", () => {
    it("should delete a comment by id", async () => {
        const response = await request(app).delete(`/comments/${testCommentDoc.id}`);
        const comment = await Comment.findById(testCommentDoc.id);

        expect(response.status).toBe(204);
        expect(comment).toBeNull();
    });

    it("should return 404 if comment not found", async () => {
        const response = await request(app).delete(`/comments/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});
