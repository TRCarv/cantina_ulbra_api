const db = require("../database/connection");

module.exports = {
    async index(req, res) {
        try {
            const { categoria, ativo } = req.query;

            const query = db("produtos").select(
                "id",
                "nome",
                "categoria",
                "preco",
                "estoque",
                "ativo",
            );

            if (categoria) {
                query.where("categoria", categoria);
            }

            if (ativo !== undefined) {
                const isAtivo = ativo === "true" || ativo === "1";
                query.where("ativo", isAtivo);
            }

            const produtos = await query;
            return res.status(200).json(produtos);
        } catch (error) {
            return res.status(500).json({
                erro: "Erro interno ao listar produtos",
            });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;

            const produto = await db("produtos")
                .select("id", "nome", "categoria", "preco", "estoque", "ativo")
                .where({ id })
                .first();

            if (!produto) {
                return res.status(404).json({ erro: "Produto não encontrado" });
            }

            return res.status(200).json(produto);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao buscar produto" });
        }
    },

    async create(req, res) {
        try {
            const { nome, categoria, preco, estoque, ativo } = req.body;

            if (
                !nome ||
                !categoria ||
                preco === undefined ||
                estoque === undefined
            ) {
                return res.status(400).json({
                    erro: "Campos obrigatórios: nome, categoria, preco e estoque",
                });
            }

            if (Number(preco) <= 0 || Number(estoque) < 0) {
                return res.status(400).json({
                    erro: "Preco deve ser maior que zero e estoque não pode ser negativo",
                });
            }

            const produtoExiste = await db("produtos").where({ nome }).first();

            if (produtoExiste) {
                return res.status(409).json({
                    erro: "Já existe um produto cadastrado com este nome",
                });
            }
            const [id] = await db("produtos").insert({
                nome,
                categoria,
                preco: Number(preco),
                estoque: Number(estoque),
                ativo: ativo !== undefined ? Boolean(ativo) : true,
            });

            const novoProduto = await db("produtos").where({ id }).first();
            return res.status(201).json(novoProduto);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao cadastrar produto" });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, categoria, preco, estoque, ativo } = req.body;

            const produto = await db("produtos").where({ id }).first();
            if (!produto) {
                return res.status(404).json({ erro: "Produto não encontrado" });
            }

            if (nome && nome !== produto.nome) {
                const nomeDuplicado = await db("produtos")
                    .where({ nome })
                    .first();
                if (nomeDuplicado) {
                    return res.status(409).json({
                        erro: "Já existe outro produto com este nome cadastrado",
                    });
                }
            }

            if (preco !== undefined && Number(preco) <= 0) {
                return res
                    .status(400)
                    .json({ erro: "O preço deve ser maior que zero" });
            }

            if (estoque !== undefined && Number(estoque) < 0) {
                return res
                    .status(400)
                    .json({ erro: "O estoque não pode ser negativo" });
            }

            await db("produtos")
                .where({ id })
                .update({
                    nome: nome ?? produto.nome,
                    categoria: categoria ?? produto.categoria,
                    preco: preco !== undefined ? Number(preco) : produto.preco,
                    estoque:
                        estoque !== undefined
                            ? Number(estoque)
                            : produto.estoque,
                    ativo: ativo !== undefined ? Boolean(ativo) : produto.ativo,
                });
            const produtoAtualizado = await db("produtos")
                .where({ id })
                .first();
            return res.status(200).json(produtoAtualizado);
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao atualizar o produto" });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const produto = await db("produtos").where({ id }).first();
            if (!produto) {
                return res.status(404).json({ erro: "Produto não encontrado" });
            }

            const pedidoVinculado = await db("pedidos")
                .where({ produto_id: id })
                .first();
            if (pedidoVinculado) {
                return res.status(409).json({
                    erro: "Não é possível excluir um produto que já possui pedidos vinculados",
                });
            }

            await db("produtos").where({ id }).del();
            return res.status(204).send();
        } catch (error) {
            return res
                .status(500)
                .json({ erro: "Erro interno ao remover produto" });
        }
    },
};
