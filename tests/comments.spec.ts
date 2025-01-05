import request from "supertest";
import Comment from "../src/models/comment";
import Post from "../src/models/post";
import { createApp } from "../src/app";
import { connect, disconnect } from "../src/db";
import { createDatabase, nonExistentId } from "./utils";

// @ts-expect-error FIX
let teardown = null;
const app = createApp();
const testPost = { message: "Hello World", sender: "John Doe" };
const testCommentContent = { message: "Hello World", sender: "Adam Comment" };
// @ts-expect-error FIX
let testPostDoc = null;
// @ts-expect-error FIX
let testComment = null;
// @ts-expect-error FIX
let testCommentDoc = null;

beforeAll(async () => {
    const { dbConnectionString, closeDatabase } = await createDatabase();
    teardown = closeDatabase;

    await connect(dbConnectionString);
    await Comment.deleteMany({});
    await Post.deleteMany({});
});

afterAll(async () => {
    await disconnect();
    // @ts-expect-error FIX
    await teardown();
});

beforeEach(async () => {
    testPostDoc = await Post.create(testPost);
    testComment = { ...testCommentContent, post: testPostDoc.id };
    testCommentDoc = await Comment.create(testComment);
});

afterEach(async () => {
    // @ts-expect-error FIX
    await testCommentDoc.deleteOne();
    // @ts-expect-error FIX
    await testPostDoc.deleteOne();
});

describe("POST /comments", () => {
    afterAll(async () => {
        await Comment.deleteMany({});
    });

    it("should create a new comment", async () => {
        // @ts-expect-error FIX
        const response = await request(app).post("/comments").send(testComment);
        const comment = await Comment.findById(response.body.id);

        expect(response.status).toBe(201);
        // @ts-expect-error FIX
        expect(response.body).toMatchObject(testComment);
        // @ts-expect-error FIX
        expect(comment.message).toBe(testComment.message);
        // @ts-expect-error FIX
        expect(comment.sender).toBe(testComment.sender);
        // @ts-expect-error FIX
        expect(comment.post.toString()).toBe(testComment.post);
    });

    it("should return 400 if message or sender is missing", async () => {
        const commentWithoutSender = { message: "Hello World" };
        const commentWithoutMessage = { sender: "John Doe" };

        const noSenderResponse = await request(app).post("/comments").send(commentWithoutSender);
        const noMessageResponse = await request(app).post("/comments").send(commentWithoutMessage);

        expect(noSenderResponse.status).toBe(400);
        expect(noMessageResponse.status).toBe(400);
    });

    it("should return 400 if post does not exist", async () => {
        const commentWithNonExistentPost = {
            ...testCommentContent,
            post: nonExistentId,
        };

        const response = await request(app).post("/comments").send(commentWithNonExistentPost);

        expect(response.status).toBe(404);
    });
});

describe("GET /comments", () => {
    it("should get all comments", async () => {
        const response = await request(app).get("/comments");

        expect(response.status).toBe(200);
        // @ts-expect-error FIX
        expect(response.body).toMatchObject([{ ...testComment, id: testCommentDoc.id }]);
    });

    it("should get comments by sender", async () => {
        // @ts-expect-error FIX
        const response = await request(app).get(`/comments?sender=${testComment.sender}`);

        expect(response.status).toBe(200);
        // @ts-expect-error FIX
        expect(response.body).toMatchObject([{ ...testComment, id: testCommentDoc.id }]);
    });

    it("should return an empty result if no comments found", async () => {
        const response = await request(app).get("/comments?sender=Jane Doe");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
    });
});

describe("GET /comments/:id", () => {
    it("should get a comment by id", async () => {
        // @ts-expect-error FIX
        const response = await request(app).get(`/comments/${testCommentDoc.id}`);

        expect(response.status).toBe(200);
        // @ts-expect-error FIX
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
            // @ts-expect-error FIX
            .put(`/comments/${testCommentDoc.id}`)
            .send(commentUpdate);

        expect(response.status).toBe(200);
        // @ts-expect-error FIX
        expect(response.body).toMatchObject({ ...testComment, ...commentUpdate });
    });

    it("should return 400 if message is missing", async () => {
        const emptyCommentUpdate = {};

        const response = await request(app)
            // @ts-expect-error FIX
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
        // @ts-expect-error FIX
        const response = await request(app).delete(`/comments/${testCommentDoc.id}`);
        // @ts-expect-error FIX
        const comment = await Comment.findById(testCommentDoc.id);

        expect(response.status).toBe(204);
        expect(comment).toBeNull();
    });

    it("should return 404 if comment not found", async () => {
        const response = await request(app).delete(`/comments/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});
