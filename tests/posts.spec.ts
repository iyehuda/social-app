import Post, { IPost } from "../src/models/post";
import { Teardown, createDatabase, invalidId, nonExistentId } from "./utils";
import { connect, disconnect } from "../src/db";
import { HydratedDocument } from "mongoose";
import { createApp } from "../src/app";
import request from "supertest";

let teardown: Teardown;
let testPostDoc: HydratedDocument<IPost>;
const app = createApp();
const testPost = { author: "John Doe", message: "Hello World" };

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
        const newTestPost = { author: "John Newman", message: "Hello World" };
        const response = await request(app).post("/posts").send(newTestPost);
        const body = response.body as IPost;
        const post = await Post.findById(body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(newTestPost);
        expect(post).toMatchObject(newTestPost);

        await post!.deleteOne();
    });

    it("should return 400 if message or author is missing", async () => {
        const postWithoutauthor = { message: "Hello World" };
        const postWithoutMessage = { author: "John Doe" };

        const noauthorResponse = await request(app).post("/posts").send(postWithoutauthor);
        const noMessageResponse = await request(app).post("/posts").send(postWithoutMessage);

        expect(noauthorResponse.status).toBe(400);
        expect(noMessageResponse.status).toBe(400);
    });
});

describe("GET /posts", () => {
    it("should get all posts", async () => {
        const response = await request(app).get("/posts");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testPost, id: testPostDoc.id }]);
    });

    it("should get posts by author", async () => {
        const response = await request(app).get(`/posts?author=${testPost.author}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testPost, id: testPostDoc.id }]);
    });

    it("should return an empty result if no posts found", async () => {
        const response = await request(app).get("/posts?author=Jane Doe");
        const posts = response.body as IPost[];

        expect(response.status).toBe(200);
        expect(posts.length).toBe(0);
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
