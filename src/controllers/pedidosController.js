const db = require("../database/connection");

module.exports = {
    async index(req, res) {
        try {
            const { limit = 10, offset = 0, aluno_nome } = req.query;

            const parsedLimit = Number(limit);
            const parsedOffset = Number(offset);

            if (
                isNaN(parsedLimit) ||
                parsedLimit <= 0 ||
                isNaN(parsedOffset) ||
                parsedOffset < 0
            ) {
                return res.status(400).json({
                    erro: "Os parâmetros limit e offset devem ser números válidos (limit > 0, offset >= 0).",
                });
            }

            const query = db("pedidos")
                .select(
                    "id",
                    "aluno_nome",
                    "produto_id",
                    "quantidade",
                    "valor_total",
                    "created_at",
                    "updated_at",
                )
                .limit(parsedLimit)
                .offset(parsedOffset);

            if (aluno_nome) {
                query.where("aluno_nome", "like", `%${aluno_nome}%`);
            }

            const pedidos = await query;
            return res.status(200).json(pedidos);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao listar pedidos." });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;

            const pedido = await db("pedidos")
                .join("produtos", "pedidos.produto_id", "produtos.id")
                .select(
                    "pedidos.id",
                    "pedidos.aluno_nome",
                    "pedidos.produto_id",
                    "produtos.nome as produto_nome",
                    "pedidos.quantidade",
                    "pedidos.valor_total",
                    "pedidos.created_at",
                    "pedidos.updated_at",
                )
                .where("pedidos.id", id)
                .first();

            if (!pedido) {
                return res.status(404).json({ erro: "Pedido não encontrado." });
            }

            return res.status(200).json(pedido);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao buscar pedido." });
        }
    },

    async create(req, res) {
        try {
            const { aluno_nome, produto_id, quantidade } = req.body;

            if (!aluno_nome || !produto_id || quantidade === undefined) {
                return res.status(400).json({
                    erro: "Campos obrigatórios: aluno_nome, produto_id e quantidade.",
                });
            }

            const qtd = Number(quantidade);
            if (isNaN(qtd) || qtd < 1) {
                return res.status(400).json({
                    erro: "A quantidade deve ser um número inteiro maior ou igual a 1.",
                });
            }

            const produto = await db("produtos")
                .where({ id: produto_id })
                .first();
            if (!produto) {
                return res
                    .status(404)
                    .json({ erro: "Produto não encontrado." });
            }

            if (!produto.ativo) {
                return res.status(400).json({
                    erro: "Não é permitido criar pedido para um produto inativo.",
                });
            }

            if (produto.estoque < qtd) {
                return res.status(409).json({
                    erro: `Estoque insuficiente. Disponível: ${produto.estoque}, solicitado: ${qtd}.`,
                });
            }

            const valorTotalCalculado = Number(
                (produto.preco * qtd).toFixed(2),
            );

            const novoPedido = await db.transaction(async (trx) => {
                const [pedidoId] = await trx("pedidos").insert({
                    aluno_nome,
                    produto_id,
                    quantidade: qtd,
                    valor_total: valorTotalCalculado,
                });

                await trx("produtos")
                    .where({ id: produto_id })
                    .decrement("estoque", qtd);

                return trx("pedidos").where({ id: pedidoId }).first();
            });

            return res.status(201).json(novoPedido);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao registrar pedido." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const pedido = await db("pedidos").where({ id }).first();
            if (!pedido) {
                return res.status(404).json({ erro: "Pedido não encontrado." });
            }

            // usando o db.transaction para garantir atomicidade
            await db.transaction(async (trx) => {
                await trx("produtos")
                    .where({ id: pedido.produto_id })
                    .increment("estoque", pedido.quantidade);

                await trx("pedidos").where({ id }).del();
            });

            return res.status(204).send();
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao cancelar pedido." });
        }
    },
};
