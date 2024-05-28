import fastify from "fastify";

import { UserRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";
import cookies from "@fastify/cookie";

export const app = fastify();

app.register(cookies);

app.register(UserRoutes, {
  prefix: "users",
});

app.register(mealsRoutes, {
  prefix: "meals",
});
