require('./config/ambiente').carregarAmbiente();

const express = require('express');
const cors = require('cors');

const produtoRoutes = require('./routes/produtoRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Em desenvolvimento o Vite usa proxy. Em produção, a API pode receber o front-end
// hospedado em outro domínio; o CORS reflete a origem solicitada e permite o cookie
// httpOnly usado pelo painel. As rotas de escrita continuam protegidas por sessão.
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type']
    })
);

app.get('/', (req, res) => {
    res.type('text').send('Calçados Mariano API');
});

app.use(healthRoutes);
app.use(authRoutes);
app.use(produtoRoutes);

app.use((req, res) => {
    res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
    if (res.headersSent) return next(erro);

    console.error('Erro não tratado na API:', erro);

    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ mensagem: 'O corpo da requisição precisa ser um JSON válido.' });
    }

    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

module.exports = app;
