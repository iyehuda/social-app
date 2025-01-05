import request from "supertest";
import Post, { IPost } from "../src/models/post";
import { createApp } from "../src/app";
import { connect, disconnect } from "../src/db";
import { createDatabase, invalidId, nonExistentId, Teardown } from "./utils";
import { HydratedDocument } from "mongoose";

let teardown: Teardown;
const app = createApp();
const testPost = { message: "Hello World", sender: "John Doe" };
let testPostDoc: HydratedDocument<IPost>;

beforeAll(async () => {
    const { dbConnectionString, closeDatabase } = await createDatabase();
    teardown = closeDatabase;

    await connect(dbConnectionString);
    await Post.deleteMany({});
    testPostDoc = await Post.create(testPost);
});

afterAll(async () => {
    await disconnect();
    await teardown();
});

describe("POST /posts", () => {
    it("should create a new post", async () => {
        const newTestPost = { message: "Hello World", sender: "John Newman" };
        const response = await request(app).post("/posts").send(newTestPost);
        const post = await Post.findById(response.body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(newTestPost);
        expect(post).toMatchObject(newTestPost);

        await post!.deleteOne();
    });

    it("should return 400 if message or sender is missing", async () => {
        const postWithoutSender = { message: "Hello World" };
        const postWithoutMessage = { sender: "John Doe" };

        const noSenderResponse = await request(app).post("/posts").send(postWithoutSender);
        const noMessageResponse = await request(app).post("/posts").send(postWithoutMessage);

        expect(noSenderResponse.status).toBe(400);
        expect(noMessageResponse.status).toBe(400);
    });
});

describe("GET /posts", () => {
    it("should get all posts", async () => {
        const response = await request(app).get("/posts");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testPost, id: testPostDoc.id }]);
    });

    it("should get posts by sender", async () => {
        const response = await request(app).get(`/posts?sender=${testPost.sender}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testPost, id: testPostDoc.id }]);
    });

    it("should return an empty result if no posts found", async () => {
        const response = await request(app).get("/posts?sender=Jane Doe");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
    });
});

describe("GET /posts/:id", () => {
    it("should get a post by id", async () => {
        const response = await request(app).get(`/posts/${testPostDoc.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(testPost);
    });

    it("should return 404 if post not found", async () => {
        const response = await request(app).get(`/posts/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});

describe("PUT /posts/:id", () => {
    it("should update a post by id", async () => {
        const postUpdate = { message: "Updated Message" };

        const response = await request(app).put(`/posts/${testPostDoc.id}`).send(postUpdate);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ ...testPost, ...postUpdate });
    });

    it("should return 400 if message is missing", async () => {
        const emptyPostUpdate = {};

        const response = await request(app).put(`/posts/${testPostDoc.id}`).send(emptyPostUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if post not found", async () => {
        const postUpdate = { message: "Updated Message" };

        const response = await request(app).put(`/posts/${nonExistentId}`).send(postUpdate);

        expect(response.status).toBe(404);
    });

    it("should return 400 if post id is invalid", async () => {
        const postUpdate = { message: "Updated Message" };

        const response = await request(app).put(`/posts/${invalidId}`).send(postUpdate);

        expect(response.status).toBe(400);
    });
});
