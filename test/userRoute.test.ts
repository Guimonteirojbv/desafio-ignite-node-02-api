import { afterAll, beforeAll, describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "node:child_process";

describe("User routes ", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex -- migrate:rollback --all");
    execSync("npm run knex -- migrate:latest");
  });

  it("should be able create a new user", async () => {
    const response = await request(app.server).post("/users").send({
      name: "New User",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("should be able list all users", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookie = createUserResponse.get("Set-Cookie");

    if (!cookie) return;

    const responseGetAllUsers = await request(app.server)
      .get("/users")
      .set("Cookie", cookie)
      .expect(200);

    expect(responseGetAllUsers.body.users).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "New User",
        session_id: expect.any(String),
      }),
    ]);
  });
});
