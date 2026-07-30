const express = require('express');

//Importa a biblioteca CORS
const cors = require('cors');

const app = express();

// O 'app.use' aplica o CORS no seu servidor, ele libera a entrada do front-end para o back-end,
//permitindo que eles se comuniquem sem problemas de bloqueio de origem cruzada (CORS).
app.use(cors());

// Puxando a conexão com o banco de dados para ele ser inicializado
require('./src/config/db');

// Permite que o servidor entenda dados enviados no formato JSON
app.use(express.json());

// Rota de teste simples para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor da Calçados Mariano rodando com sucesso!');
});

// Iniciando o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);