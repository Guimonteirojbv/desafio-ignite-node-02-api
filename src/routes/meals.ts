import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { z } from "zod";

const requestParamsSchema = z.object({
  id: z.string(),
});

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId;
    const meals = await knex("meals")
      .select("*")
      .where("session_id", sessionId);

    return { foods: meals };
  });

  app.get("/select-meal/:id", async (request, reply) => {
    const { id } = requestParamsSchema.parse(request.params);

    const meals = await knex("meals").where("id", id);

    reply.status(200).send(meals);
  });

  app.get(
    "/qntd-meals",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;
      const registeredMeals = await knex("meals")
        .count("session_id as quantidade")
        .where("session_id", sessionId);

      const total = registeredMeals[0].quantidade;

      reply.status(200).send(total);
    },
  );

  app.get(
    "/meals-diet",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const meals = await knex("meals")
        .count("session_id as qntd")
        .where("session_id", sessionId);

      reply.status(200).send(meals);
    },
  );

  app.get(
    "/meals-inside",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const qntdMealsInside = await knex("meals")
        .count("is_inside as qntd")
        .where("session_id", sessionId)
        .andWhere("is_inside", true);

      reply.status(200).send(qntdMealsInside);
    },
  );

  app.get(
    "/meals-outside",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const qntdMealsInside = await knex("meals")
        .count("is_inside as qntd")
        .where("session_id", sessionId)
        .andWhere("is_inside", false);

      reply.status(200).send(qntdMealsInside);
    },
  );

  app.post(
    "/create-meal",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createFoodSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_inside: z.boolean(),
      });

      const { name, description, is_inside } = createFoodSchema.parse(
        request.body,
      );

      const sessionId = request.cookies.sessionId;

      await knex("meals").insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        name,
        description,
        is_inside,
      });

      reply.status(201);
    },
  );

  app.put(
    "/edit-meal/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_inside: z.boolean(),
      });
      const { id } = requestParamsSchema.parse(request.params);

      // eslint-disable-next-line camelcase
      const { name, description, is_inside } = bodySchema.parse(request.body);

      const refeicao = await knex("meals")
        // eslint-disable-next-line camelcase
        .update({ name, description, is_inside })
        .where("id", id);

      reply.status(200).send(refeicao);
    },
  );

  app.delete(
    "/delete-meal/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { id } = requestParamsSchema.parse(request.params);

      await knex("meals").where("id", id).del();

      reply.status(200);
    },
  );
}
