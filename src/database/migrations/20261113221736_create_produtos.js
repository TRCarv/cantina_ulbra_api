/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("produtos", (table) => {
        table.increments("id").primary();
        table.string("nome", 80).notNullable().unique();
        table.string("categoria", 30).notNullable();
        table.decimal("preco", 8, 2).notNullable();
        table.integer("estoque").notNullable().unsigned();
        table.boolean("ativo").notNullable().defaultTo(true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
