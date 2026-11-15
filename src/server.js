const express = require("express");
const produtosRoutes = require("./routes/produtosRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");
const relatoriosRoutes = require("./routes/relatoriosRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/relatorios", relatoriosRoutes);

app.use((req, res) => {
    return res.status(404).json({ erro: "Rota não encontrada." });
});

app.listen(PORT, () => {
    console.log(`Servidor da Cantina ULBRA rodando na porta ${PORT}`);
});
