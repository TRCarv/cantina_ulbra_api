const express = require("express");
const pedidosController = require("../controllers/pedidosController");

const router = express.Router();

router.get("/", pedidosController.index);
router.get("/:id", pedidosController.show);
router.post("/", pedidosController.create);
router.delete("/:id", pedidosController.delete);

module.exports = router;
