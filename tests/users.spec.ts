import { Teardown, createDatabase, invalidId, nonExistentId } from "./utils";
import User, { IUser } from "../src/models/user";
import { connect, disconnect } from "../src/db";
import { HydratedDocument } from "mongoose";
import { createApp } from "../src/app";
import request from "supertest";
import { string } from "joi";

let teardown: Teardown;
let testUserDoc: HydratedDocument<IUser>;
const app = createApp();
const testUser = { email: "test@example.com", username: "testuser", password: "password123" };
const authTestUser = { email: "test@example.com", username: "testuser", password: "password123" };

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
        const newTestUser = { email: "test2@example.com", username: "testuser2", password: "password123" };
        const newTestUserResponse = { email: "test2@example.com", username: "testuser2" };
        const response = await request(app).post("/auth/register").send(newTestUser);
        const body = response.body as IUser;
        const user = await User.findById(body._id);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(newTestUserResponse);
        await user!.deleteOne();
    });

    it("should return 409 if username or email already exists", async () => {
        const response = await request(app).post("/auth/register").send(testUser);

        expect(response.status).toBe(409);
    });

    it("should return 400 if email is invalid", async () => {
        const userWithInvalidEmail = { email: "invalid-email", username: "testuser2" };

        const noEmailResponse = await request(app).post("/auth/register").send(userWithInvalidEmail);

        expect(noEmailResponse.status).toBe(400);
    });

    it("should return 400 if email or username is missing", async () => {
        const userWithoutEmail = { username: "testuser2" };
        const userWithoutUsername = { email: "test2@example.com" };

        const noEmailResponse = await request(app).post("/auth/register").send(userWithoutEmail);
        const noUsernameResponse = await request(app).post("/auth/register").send(userWithoutUsername);

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

    it("should return 400 if user id is invalid", async () => {
        const userUpdate = { email: "different@example.org" };

        const response = await request(app).put(`/users/${invalidId}`).send(userUpdate);

        expect(response.status).toBe(400);
    });

    it("should return 404 if user not found", async () => {
        const userUpdate = { email: "different@example.org" };

        const response = await request(app).put(`/users/${nonExistentId}`).send(userUpdate);

        expect(response.status).toBe(404);
    });

    it("should return 409 if email already exists", async () => {
        const newUser = { email: "new@example.com", username: "new", password: "password123" };
        const userUpdate = { email: newUser.email };

        const newUserDoc = await User.create(newUser);
        const response = await request(app).put(`/users/${testUserDoc.id}`).send(userUpdate);
        await newUserDoc.deleteOne();

        expect(response.status).toBe(409);
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

describe("Auth Tests", () => {
    test("Auth test login", async () => {
        await request(app).post("/auth/register").send(authTestUser);
        const response = await request(app).post("/auth/login").send(authTestUser);
        expect(response.statusCode).toBe(200);
        const { accessToken } = response.body;
        const { refreshToken } = response.body;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();
    });

    test("Check tokens are not the same", async () => {
        const response = await request(app).post("/auth/login").send(authTestUser);
        expect(response.statusCode).toBe(200);
        const { accessToken } = response.body;
        const { refreshToken } = response.body;

        const response2 = await request(app).post("/auth/login").send(authTestUser);
        expect(response2.statusCode).toBe(200);
        const accessToken2 = response2.body.accessToken;
        const refreshToken2 = response2.body.refreshToken;

        expect(accessToken).not.toBe(accessToken2);
        expect(refreshToken).not.toBe(refreshToken2);
    });

    test("Auth test login fail", async () => {
        const response = await request(app).post("/auth/login").send({
            email: authTestUser.email,
            password: "sdfsd",
        });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app).post("/auth/login").send({
            email: "dsfasd",
            password: "sdfsd",
        });
        expect(response2.statusCode).not.toBe(200);
    });

    test("Auth test refresh token", async () => {
        const response = await request(app).post("/auth/login").send(authTestUser);
        expect(response.statusCode).toBe(200);
        const { refreshToken } = response.body;

        const response2 = await request(app).post("/auth/refresh").send({ refreshToken });
        expect(response2.statusCode).toBe(200);
        expect(response2.body.accessToken).toBeDefined();
        expect(response2.body.refreshToken).toBeDefined();
    });

    test("Auth test logout", async () => {
        const loginResponse = await request(app).post("/auth/login").send(authTestUser);
        expect(loginResponse.statusCode).toBe(200);
        const { refreshToken } = loginResponse.body;

        const logoutResponse = await request(app).post("/auth/logout").send({ refreshToken });
        expect(logoutResponse.statusCode).toBe(200);
    });
});
