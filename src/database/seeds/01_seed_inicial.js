/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("pedidos").del();
    await knex("produtos").del();

    await knex.raw(
        "DELETE FROM sqlite_sequence WHERE name IN ('produtos', 'pedidos')",
    );

    await knex("produtos").insert([
        {
            id: 1,
            nome: "Coxinha de Frango com Catupiry",
            categoria: "Salgados",
            preco: 7.5,
            estoque: 25,
            ativo: true,
        },
        {
            id: 2,
            nome: "Pastel Assado de Carne",
            categoria: "Salgados",
            preco: 8.0,
            estoque: 15,
            ativo: true,
        },
        {
            id: 3,
            nome: "Pão de Queijo Grande",
            categoria: "Salgados",
            preco: 5.0,
            estoque: 30,
            ativo: true,
        },
        {
            id: 4,
            nome: "Café Expresso 100ml",
            categoria: "Bebidas",
            preco: 4.5,
            estoque: 40,
            ativo: true,
        },
        {
            id: 5,
            nome: "Suco Natural de Laranja 300ml",
            categoria: "Bebidas",
            preco: 7.0,
            estoque: 20,
            ativo: true,
        },
        {
            id: 6,
            nome: "Bolo de Cenoura com Chocolate",
            categoria: "Doces",
            preco: 6.5,
            estoque: 12,
            ativo: true,
        },
        // para teste da regra que não pode vender produto inativo
        {
            id: 7,
            nome: "Refrigerante Lata 350ml (Descontinuado)",
            categoria: "Bebidas",
            preco: 6.0,
            estoque: 5,
            ativo: false,
        },
    ]);
    // pedidos com datas diferentes e valores totais já calculados
    await knex("pedidos").insert([
        {
            aluno_nome: "Lucas Mendes",
            produto_id: 1,
            quantidade: 2,
            valor_total: 15.0,
            created_at: "2026-11-10 08:00:00",
            updated_at: "2026-11-10 08:30:00",
        },
        {
            aluno_nome: "Mariana Silva",
            produto_id: 4,
            quantidade: 1,
            valor_total: 4.5,
            created_at: "2026-11-10 10:15:00",
            updated_at: "2026-11-10 10:15:00",
        },
        {
            aluno_nome: "Pedro Henrique",
            produto_id: 2,
            quantidade: 3,
            valor_total: 24.0,
            created_at: "2026-11-11 19:20:00",
            updated_at: "2026-11-11 19:20:00",
        },
        {
            aluno_nome: "Ana Carolina",
            produto_id: 6,
            quantidade: 2,
            valor_total: 13.0,
            created_at: "2026-11-12 14:45:00",
            updated_at: "2026-11-12 14:45:00",
        },
        {
            aluno_nome: "Lucas Mendes",
            produto_id: 5,
            quantidade: 1,
            valor_total: 7.0,
            created_at: "2026-11-13 20:00:00",
            updated_at: "2026-11-13 20:00:00",
        },
        {
            aluno_nome: "Camila Rocha",
            produto_id: 1,
            quantidade: 4,
            valor_total: 30.0,
            created_at: "2026-11-14 09:10:00",
            updated_at: "2026-11-14 09:10:00",
        },
    ]);
};
