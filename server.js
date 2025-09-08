const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const PORT = 3000;

// Lê o arquivo clientes.json
let clientes = [];
try {
    const data = fs.readFileSync("clientes.json", "utf-8");
    clientes = JSON.parse(data);
} catch (err) {
    console.error("Erro ao ler clientes.json", err);
}

// Endpoint para buscar cliente por nome
app.get("/clientes/:nome", (req, res) => {
    const nome = req.params.nome.toLowerCase();
    const cliente = clientes.find(
        c => c["Nome Completo do Requerente"].toLowerCase() === nome
    );

    if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente); // Retorna OBJETO
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
