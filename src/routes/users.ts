import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function UserRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async () => {
    const tables = await knex("users").select("*");

    return { users: tables };
  });

  app.post("/", async (request, reply) => {
    const userRequestSchema = z.object({
      name: z.string(),
    });

    const { name } = userRequestSchema.parse(request.body);
    let sessionId = request.cookies.session_id;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
