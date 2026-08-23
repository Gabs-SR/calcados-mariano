#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const { carregarAmbiente } = require('../src/config/ambiente');

carregarAmbiente();

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não foi definida.');
    process.exit(1);
}

const RAIZ = path.resolve(__dirname, '..');
const PASTA = process.env.BACKUP_PASTA || path.join(RAIZ, 'backups');
const MANTER = Number(process.env.BACKUP_MANTER) || 14;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const carimbo = () => {
    const agora = new Date();
    const dois = (numero) => String(numero).padStart(2, '0');
    return (
        `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}` +
        `-${dois(agora.getHours())}${dois(agora.getMinutes())}${dois(agora.getSeconds())}`
    );
};

const rotacionar = () => {
    const copias = fs
        .readdirSync(PASTA)
        .filter((nome) => /^estoque-.*\.json$/.test(nome))
        .sort()
        .reverse();

    const antigas = copias.slice(MANTER);
    for (const nome of antigas) fs.unlinkSync(path.join(PASTA, nome));
    return { guardadas: copias.length - antigas.length, apagadas: antigas.length };
};

async function main() {
    fs.mkdirSync(PASTA, { recursive: true });

    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    const destino = path.join(PASTA, `estoque-${carimbo()}.json`);

    const backup = {
        formato: 1,
        criado_em: new Date().toISOString(),
        tabela: 'produtos',
        total: resultado.rows.length,
        produtos: resultado.rows
    };

    fs.writeFileSync(destino, `${JSON.stringify(backup, null, 2)}\n`, {
        encoding: 'utf8',
        mode: 0o600
    });

    const conferido = JSON.parse(fs.readFileSync(destino, 'utf8'));
    if (conferido.total !== resultado.rows.length) {
        fs.unlinkSync(destino);
        throw new Error('A cópia de segurança não passou na conferência.');
    }

    const { guardadas, apagadas } = rotacionar();
    const tamanho = fs.statSync(destino).size;

    console.log(`Backup criado: ${path.basename(destino)}`);
    console.log(`Produtos: ${conferido.total}`);
    console.log(`Tamanho: ${tamanho} bytes`);
    console.log(`Cópias guardadas: ${guardadas}`);
    if (apagadas > 0) console.log(`Cópias antigas removidas: ${apagadas}`);
}

main()
    .catch((erro) => {
        console.error(`Backup falhou: ${erro.message}`);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
