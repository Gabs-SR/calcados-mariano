require('./config/ambiente').carregarAmbiente();

const express = require('express'); // Importe o express
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express(); // Crie a instância do app Express
app.use(express.json()); // Importante para rotas funcionarem

const CAMINHO_PADRAO = path.resolve(__dirname, '../../database.sqlite');
const caminhoDb = process.env.DB_PATH || CAMINHO_PADRAO;

const db = new sqlite3.Database(caminhoDb, (erro) => {
    if (erro) {
        console.error('Erro ao conectar no SQLite:', erro.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        tamanhos TEXT NOT NULL,
        categoria TEXT NOT NULL,
        imagem TEXT,
        destaque INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS sessoes (
        id TEXT PRIMARY KEY,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
});

// Adicione o banco à instância do express para usar nas rotas
app.db = db; 

// EXPORTE O APP (que agora é a instância do Express)
module.exports = app;