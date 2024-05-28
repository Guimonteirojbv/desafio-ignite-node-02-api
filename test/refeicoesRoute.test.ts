import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "node:child_process";

describe("Refeicoes routes", () => {
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

  it("should be able to get all refeicoes from user", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    if (!cookies) return;

    await request(app.server)
      .post("/meals/create-meal")
      .set("cookie", cookies[0])
      .send({
        name: "New Refeicao",
        description: "almoco",
        is_inside: true,
      });

    const getAllRefeicoes = await request(app.server)
      .get("/meals")
      .set("cookie", cookies[0]);

    expect(getAllRefeicoes.body.foods).toEqual([
      expect.objectContaining({
        name: "New Refeicao",
        description: "almoco",
        is_inside: 1,
        id: expect.any(String),
        session_id: expect.any(String),
      }),
    ]);
  });

  it("should be able to create a new Refeicao", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    if (!cookies) return;

    const createRefeicaoResponse = await request(app.server)
      .post("/meals/create-meal")
      .set("cookie", cookies[0])
      .send({
        name: "New Refeicao",
        description: "almoco",
        is_inside: true,
      });

    expect(createRefeicaoResponse.status).toEqual(201);
  });
  it("should be able to get a refeicao", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    if (!cookies) return;

    await request(app.server)
      .post("/meals/create-meal")
      .set("cookie", cookies[0])
      .send({
        name: "New Refeicao",
        description: "almoco",
        is_inside: true,
      });

    const getAllRefeicoes = await request(app.server)
      .get("/meals")
      .set("cookie", cookies[0]);

    const { id } = getAllRefeicoes.body.foods[0];

    const getRefeicao = await request(app.server)
      .get(`/meals/select-meal/${id}`)
      .set("cookie", cookies[0]);

    expect(getRefeicao.body).toEqual([
      {
        id: expect.any(String),
        name: "New Refeicao",
        description: "almoco",
        is_inside: 1,
        created_at: expect.any(String),
        session_id: expect.any(String),
      },
    ]);
  });

  it("should be able to get a quantity meals registered from user", async () => {
    const responseUserCreate = await request(app.server).post("/").send({
      name: "New user",
    });

    const cookie = responseUserCreate.get("Set-Cookie");

    if (!cookie) return;

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal",
        is_inside: true,
      })
      .set("Cookie", cookie);

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal 2",
        is_inside: false,
      })
      .set("Cookie", cookie);

    const mealsFromUser = await request(app.server)
      .get("/meals/qntd-meals")
      .set("Cookie", cookie);

    expect(mealsFromUser).toEqual(expect.any(Number));
  });

  it("should be able to get the quantity of meals inside on diet", async () => {
    const responseUserCreate = await request(app.server).post("/").send({
      name: "New user",
    });

    const cookie = responseUserCreate.get("Set-Cookie");

    if (!cookie) return;

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal",
        is_inside: true,
      })
      .set("Cookie", cookie);

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal 2",
        is_inside: false,
      })
      .set("Cookie", cookie);

    const responseQuantityInside = await request(app.server)
      .get("/meals/meals-inside")
      .set("Cookie", cookie);

    expect(responseQuantityInside.status).toBe(201);
  });

  it("should be able to get the quantity of meals outside on diet", async () => {
    const responseUserCreate = await request(app.server).post("/").send({
      name: "New user",
    });

    const cookie = responseUserCreate.get("Set-Cookie");

    if (!cookie) return;

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal",
        is_inside: true,
      })
      .set("Cookie", cookie);

    await request(app.server)
      .post("/meals/create-meal")
      .send({
        name: "New meal",
        description: "Description meal 2",
        is_inside: false,
      })
      .set("Cookie", cookie);

    const responseQuantityInside = await request(app.server)
      .get("/meals/meals-outside")
      .set("Cookie", cookie);

    expect(responseQuantityInside).toEqual(2);
  });

  it("should be able to update a Refeicao", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    if (!cookies) return;

    await request(app.server)
      .post("/meals/create-meal")
      .set("cookie", cookies[0])
      .send({
        name: "New Refeicao",
        description: "almoco",
        is_inside: true,
      });

    const getAllRefeicoes = await request(app.server)
      .get("/meals")
      .set("cookie", cookies[0]);

    const { id } = getAllRefeicoes.body.foods[0];

    const getRefeicao = await request(app.server)
      .get(`/meals/select-meal/${id}`)
      .set("cookie", cookies[0]);

    const { id: mealId } = getRefeicao.body[0];

    const responseUpdateRefeicao = await request(app.server)
      .put(`/meals/edit-meal/${mealId}`)
      .send({
        name: "Update Refeicao",
        description: "jantar",
        is_inside: false,
      })
      .set("cookie", cookies[0]);

    expect(responseUpdateRefeicao.status).toEqual(200);
  });

  it("should be able to delete a Refeicao", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "New User",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    if (!cookies) return;

    await request(app.server)
      .post("/meals/create-meal")
      .set("cookie", cookies[0])
      .send({
        name: "New Refeicao",
        description: "almoco",
        is_inside: true,
      });

    const getAllRefeicoes = await request(app.server)
      .get("/meals")
      .set("cookie", cookies[0]);

    const { id } = getAllRefeicoes.body.foods[0];

    const getRefeicao = await request(app.server)
      .get(`/meals/select-meal/${id}`)
      .set("cookie", cookies[0]);

    const { id: refeicaoId } = getRefeicao.body[0];

    const responseDeleteRefeicao = await request(app.server)
      .delete(`/meals/delete-meal/${refeicaoId}`)
      .set("cookie", cookies[0]);

    expect(responseDeleteRefeicao.status).toEqual(200);
  });
});
