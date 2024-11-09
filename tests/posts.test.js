import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("Posts tests", () => {
    test("GET /posts returns a list of posts", async () => {
        const response = await request(app).get("/posts");

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});
