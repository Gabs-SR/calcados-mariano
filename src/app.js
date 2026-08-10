// Antes de tudo: sem isto, ADMIN_SENHA_HASH e SESSAO_SEGREDO nunca chegam ao
// processo, e o login responde 503 mesmo com o .env preenchido corretamente.
require('./config/ambiente').carregarAmbiente();

const path = require('path');
const Database = require('better-sqlite3');
const { carregarAmbiente } = require('./ambiente');

carregarAmbiente();

// Se houver DATABASE_URL (PostgreSQL do Supabase/Vercel), podemos tratar aqui ou cair para o arquivo local.
// Como o app foi construído estruturalmente para SQLite local na máquina da loja, 
// a Vercel exige uma adaptação para PostgreSQL caso queira rodar o backend lá.
const caminhoDb = process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite');
const db = new Database(caminhoDb);

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        tamanhos TEXT NOT NULL,
        categoria TEXT NOT NULL,
        imagem TEXT,
        destaque INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessoes (
        id TEXT PRIMARY KEY,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;
