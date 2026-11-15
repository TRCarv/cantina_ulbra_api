const express = require("express");
const relatoriosController = require("../controllers/relatoriosController");

const router = express.Router();

router.get("/vendas-por-categoria", relatoriosController.vendasPorCategoria);
router.get("/top-produtos", relatoriosController.topProdutos);
router.get("/faturamento", relatoriosController.faturamento);

module.exports = router;
