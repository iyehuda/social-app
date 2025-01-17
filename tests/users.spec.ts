import { Teardown, createDatabase, invalidId, nonExistentId } from "./utils";
import User, { IUser } from "../src/models/user";
import { connect, disconnect } from "../src/db";
import { HydratedDocument } from "mongoose";
import { createApp } from "../src/app";
import request from "supertest";

let teardown: Teardown;
let testUserDoc: HydratedDocument<IUser>;
const app = createApp();
const testUser = { email: "test@example.com", username: "testuser" };

beforeAll(async () => {
    const { dbConnectionString, closeDatabase } = await createDatabase();
    teardown = closeDatabase;

    await connect(dbConnectionString);
    await User.deleteMany({});
    testUserDoc = await User.create(testUser);
});

afterAll(async () => {
    await disconnect();
    await teardown();
});

describe("POST /users", () => {
    it("should create a new user", async () => {
        const newTestUser = { email: "test2@example.com", username: "testuser2" };
        const response = await request(app).post("/users").send(newTestUser);
        const body = response.body as IUser;
        const user = await User.findById(body.id);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(newTestUser);
        expect(user).toMatchObject(newTestUser);

        await user!.deleteOne();
    });

    it("should return 429 if username or email already exists", async () => {
        const response = await request(app).post("/users").send(testUser);

        expect(response.status).toBe(429);
    });

    it("should return 400 if email is invalid", async () => {
        const userWithInvalidEmail = { email: "invalid-email", username: "testuser2" };

        const noEmailResponse = await request(app).post("/users").send(userWithInvalidEmail);

        expect(noEmailResponse.status).toBe(400);
    });

    it("should return 400 if email or username is missing", async () => {
        const userWithoutEmail = { username: "testuser2" };
        const userWithoutUsername = { email: "test2@example.com" };

        const noEmailResponse = await request(app).post("/users").send(userWithoutEmail);
        const noUsernameResponse = await request(app).post("/users").send(userWithoutUsername);

        expect(noEmailResponse.status).toBe(400);
        expect(noUsernameResponse.status).toBe(400);
    });
});

describe("GET /users", () => {
    it("should get all users", async () => {
        const response = await request(app).get("/users");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([{ ...testUser, id: testUserDoc.id }]);
    });
});

describe("GET /users/:id", () => {
    it("should get a user by id", async () => {
        const response = await request(app).get(`/users/${testUserDoc.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(testUser);
    });

    it("should return 404 if user not found", async () => {
        const response = await request(app).get(`/users/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});

describe("PUT /users/:id", () => {
    it("should update a user by id", async () => {
        const userUpdate = { email: "different@example.org" };

        const response = await request(app).put(`/users/${testUserDoc.id}`).send(userUpdate);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ ...testUser, ...userUpdate });
    });

    it("should return 400 if email is missing", async () => {
        const emptyUserUpdate = {};

        const response = await request(app).put(`/users/${testUserDoc.id}`).send(emptyUserUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if user not found", async () => {
        const userUpdate = { email: "different@example.org" };

        const response = await request(app).put(`/users/${nonExistentId}`).send(userUpdate);

        expect(response.status).toBe(404);
    });

    it("should return 400 if user id is invalid", async () => {
        const userUpdate = { email: "different@example.org" };

        const response = await request(app).put(`/users/${invalidId}`).send(userUpdate);

        expect(response.status).toBe(400);
    });
});

describe("DELETE /users/:id", () => {
    it("should delete a user by id", async () => {
        const response = await request(app).delete(`/users/${testUserDoc.id}`);
        const user = await User.findById(testUserDoc.id);

        expect(response.status).toBe(204);
        expect(user).toBeNull();
    });

    it("should return 404 if user not found", async () => {
        const response = await request(app).delete(`/users/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});
