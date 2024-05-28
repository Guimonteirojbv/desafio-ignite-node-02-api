import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("refeicoes", (table) => {
    table.uuid("id").primary();
    table.string("name");
    table.string("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("is_inside");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("refeicoes");
}
