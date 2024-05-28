import { knex as knexSetup } from "knex";
import { env } from "./env";

export const config = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./database/migrations",
  },
};
export const knex = knexSetup(config);
