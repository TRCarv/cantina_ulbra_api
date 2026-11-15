const db = require("../database/connection");

module.exports = {
    async vendasPorCategoria(req, res) {
        try {
            const relatorio = await db("pedidos")
                .join("produtos", "pedidos.produto_id", "produtos.id")
                .select("produtos.categoria")
                .sum("pedidos.valor_total as total_vendido")
                .sum("pedidos.quantidade as quantidade_itens")
                .count("pedidos.id as total_pedidos")
                .groupBy("produtos.categoria")
                .orderBy("total_vendido", "desc");

            return res.status(200).json(relatorio);
        } catch (error) {
            return res.status(500).json({
                erro: "Erro interno ao gerar relatório de vendas por categoria.",
            });
        }
    },

    async topProdutos(req, res) {
        try {
            const topProdutos = await db("pedidos")
                .join("produtos", "pedidos.produto_id", "produtos.id")
                .select("produtos.id", "produtos.nome")
                .sum("pedidos.quantidade as total_unidades_vendidas")
                .sum("pedidos.valor_total as total_vendido")
                .groupBy("produtos.id", "produtos.nome")
                .orderBy("total_unidades_vendidas", "desc")
                .limit(5);

            return res.status(200).json(topProdutos);
        } catch (error) {
            return res.status(500).json({
                erro: "Erro interno ao gerar relatório de top produtos.",
            });
        }
    },

    async faturamento(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;

            if (!data_inicio || !data_fim) {
                return res.status(400).json({
                    erro: "Os parâmetros data_inicio e data_fim são obrigatórios (ex: ?data_inicio=2026-11-10&data_fim=2026-11-14).",
                });
            }

            const inicioFormatado = `${data_inicio} 00:00:00`;
            const fimFormatado = `${data_fim} 23:59:59`;

            const resultado = await db("pedidos")
                .whereBetween("created_at", [inicioFormatado, fimFormatado])
                .sum("valor_total as faturamento_total")
                .count("id as total_pedidos")
                .first();

            return res.status(200).json({
                data_inicio,
                data_fim,
                faturamento_total: Number(resultado.faturamento_total || 0),
                total_pedidos: Number(resultado.total_pedidos || 0),
            });
        } catch (error) {
            return res.status(500).json({
                erro: "Erro interno ao gerar relatório de faturamento.",
            });
        }
    },
};
