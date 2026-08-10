const path = require('path');
const { carregarAmbiente } = require('./ambiente');

carregarAmbiente();

let db;

// Se a DATABASE_URL estiver presente (Vercel / Supabase), usamos PostgreSQL
if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Criamos um adaptador leve para imitar os métodos básicos do sqlite que seu projeto usa
    db = {
        prepare: (sql) => {
            // Converte sintaxe básica do SQLite para Postgres se necessário, ou executa direto
            return {
                all: async (...params) => {
                    const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
                    return res.rows;
                },
                get: async (...params) => {
                    const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
                    return res.rows[0];
                },
                run: async (...params) => {
                    const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
                    return { lastInsertRowid: res.rows[0]?.id };
                }
            };
        },
        exec: async (sql) => {
            await pool.query(sql);
        }
    };

    // Inicializa as tabelas no PostgreSQL do Supabase de forma assíncrona segura
    pool.query(`
        CREATE TABLE IF NOT EXISTS produtos (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            tamanhos TEXT NOT NULL,
            categoria TEXT NOT NULL,
            imagem TEXT,
            destaque INTEGER DEFAULT 0,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessoes (
            id TEXT PRIMARY KEY,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).catch(err => console.error("Erro ao criar tabelas no Postgres:", err));

} else {
    // Modo local: continua usando SQLite normalmente na sua máquina
    const Database = require('better-sqlite3');
    const caminhoDb = process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite');
    db = new Database(caminhoDb);

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
}

module.exports = db;
