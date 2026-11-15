const express = require("express");
const produtosController = require("../controllers/produtosController");

const router = express.Router();

router.get("/", produtosController.index);
router.get("/:id", produtosController.show);
router.post("/", produtosController.create);
router.put("/:id", produtosController.update);
router.delete("/:id", produtosController.delete);

module.exports = router;
