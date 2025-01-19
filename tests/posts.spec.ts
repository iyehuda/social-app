import Post, { IPost } from "../src/models/post";
import { Teardown, createDatabase, invalidId, nonExistentId } from "./utils";
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
const testPostContent = { message: "Hello World" };
let testPost: typeof testPostContent;
let testPostDoc: HydratedDocument<IPost>;
let testPostAuthorDoc: HydratedDocument<IUser>;

const generateJWT = (user: IUser) => jwt.sign({ _id: user.id }, tokenSecret, { expiresIn: "1h" });

beforeAll(async () => {
    const { dbConnectionString, closeDatabase } = await createDatabase();
    teardown = closeDatabase;

    await connect(dbConnectionString);
    await Post.deleteMany({});
    await User.deleteMany({});
});

afterAll(async () => {
    await disconnect();
    await teardown();
});

beforeEach(async () => {
    testPostAuthorDoc = await User.create(testPostAuthor);
    testPost = { ...testPostContent };
    testPostDoc = await Post.create({ ...testPost, author: testPostAuthorDoc.id });
});

afterEach(async () => {
    await testPostDoc.deleteOne();
    await testPostAuthorDoc.deleteOne();
});

describe("POST /posts", () => {
    afterAll(async () => {
        await Post.deleteMany({});
    });

    it("should create a new post", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${token}`)
            .send(testPost);
        const body = response.body as IPost;
        const post = await Post.findById(body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(testPost);
        expect(post!.message).toBe(testPost.message);

        await post!.deleteOne();
    });

    it("should return 401 if author did not logged in", async () => {
        const postWithNonExistentAuthor = { ...testPostContent };

        const response = await request(app)
            .post("/posts")
            .send(postWithNonExistentAuthor);

        expect(response.status).toBe(401);
    });

    it("should return 400 if message is missing", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const postWithoutMessage = { author: testPostAuthorDoc.id };

        const noMessageResponse = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${token}`)
            .send(postWithoutMessage);

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
        const response = await request(app).get(`/posts?author=${testPostAuthorDoc.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testPost, id: testPostDoc.id }]);
    });

    it("should return an empty result if no posts found", async () => {
        const response = await request(app).get(`/posts?author=${nonExistentId}`);
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
        const token = generateJWT(testPostAuthorDoc);
        const postUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/posts/${testPostDoc.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(postUpdate);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ ...testPost, ...postUpdate });
    });

    it("should return 400 if message is missing", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const emptyPostUpdate = {};

        const response = await request(app)
            .put(`/posts/${testPostDoc.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(emptyPostUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if post not found", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const postUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/posts/${nonExistentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(postUpdate);

        expect(response.status).toBe(404);
    });

    it("should return 400 if post id is invalid", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const postUpdate = { message: "Updated Message" };

        const response = await request(app)
            .put(`/posts/${invalidId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(postUpdate);

        expect(response.status).toBe(400);
    });
});

describe("DELETE /posts/:id", () => {
    it("should delete a post by id", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const response = await request(app)
            .delete(`/posts/${testPostDoc.id}`)
            .set("Authorization", `Bearer ${token}`);
        const post = await Post.findById(testPostDoc.id);

        expect(response.status).toBe(204);
        expect(post).toBeNull();
    });

    it("should return 404 if post not found", async () => {
        const token = generateJWT(testPostAuthorDoc);
        const response = await request(app)
            .delete(`/posts/${nonExistentId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});
