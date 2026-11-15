/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("pedidos", (table) => {
        table.increments("id").primary();
        table.string("aluno_nome", 100).notNullable();
        table
            .integer("produto_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("produtos")
            .onDelete("RESTRICT");
        table.integer("quantidade").unsigned().notNullable();
        table.decimal("valor_total", 8, 2).unsigned().notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
