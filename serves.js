const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());

// Puxando a conexão com o banco de dados
require('./src/config/db');


// Permite que o servidor entenda dados enviados no formato JSON
app.use(express.json());

// Importando o arquivo de rotas que acabamos de criar
const produtoRoutes = require('./src/routes/produtoRoutes');

// Avisando ao servidor para usar essas rotas
app.use('/', produtoRoutes);

// Rota de teste simples para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor da Calçados Mariano rodando com sucesso!');
});

// Iniciando o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});