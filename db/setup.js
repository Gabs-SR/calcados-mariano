const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const { carregarAmbiente } = require('../src/config/ambiente');

carregarAmbiente();

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não foi definida.');
    process.exit(1);
}

const ARQUIVO_ESQUEMA = path.join(__dirname, 'schema.sql');
const ARQUIVO_INDICES = path.join(__dirname, 'indexes.sql');
const ARQUIVO_CARGA = path.join(__dirname, 'seed.sql');
const reset = process.argv.includes('--reset');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const executarArquivo = async (arquivo) => {
    const sql = fs.readFileSync(arquivo, 'utf8');
    if (sql.trim()) await pool.query(sql);
};

const migrarColunas = async () => {
    const esperadas = [
        ['nome', 'TEXT'],
        ['numeracao', 'TEXT'],
        ['categoria', 'TEXT'],
        ['publico', 'TEXT'],
        ['subcategoria', 'TEXT'],
        ['quantidade', 'INTEGER'],
        ['status_estoque', 'TEXT'],
        ['marca', 'TEXT'],
        ['cor', 'TEXT'],
        ['descricao', 'TEXT'],
        ['imagem_url', 'TEXT'],
        ['nome_ordenacao', 'TEXT']
    ];

    const resultado = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'produtos'`
    );

    const existentes = new Set(resultado.rows.map((linha) => linha.column_name));

    for (const [nome, tipo] of esperadas) {
        if (!existentes.has(nome)) {
            await pool.query(`ALTER TABLE produtos ADD COLUMN ${nome} ${tipo}`);
            console.log(`Coluna adicionada: ${nome}`);
        }
    }
};

const garantirGeracaoDeId = async () => {
    const resultado = await pool.query(
        `SELECT column_default
         FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'produtos'
           AND column_name = 'id'`
    );

    const padrao = resultado.rows[0]?.column_default || '';
    if (padrao.includes('nextval(')) return;

    await pool.query(`CREATE SEQUENCE IF NOT EXISTS produtos_id_seq`);
    await pool.query(`
        SELECT setval(
            'produtos_id_seq',
            GREATEST(COALESCE((SELECT MAX(id) FROM produtos), 0), 1),
            EXISTS (SELECT 1 FROM produtos)
        )
    `);
    await pool.query('ALTER SEQUENCE produtos_id_seq OWNED BY produtos.id');
    await pool.query(
        'ALTER TABLE produtos ALTER COLUMN id SET DEFAULT nextval(\'produtos_id_seq\')'
    );
};

const preencherOrdenacao = async () => {
    await pool.query(`
        UPDATE produtos
        SET nome_ordenacao = lower(translate(
            nome,
            'ÁÀÃÂÄáàãâäÉÈÊËéèêëÍÌÎÏíìîïÓÒÕÔÖóòõôöÚÙÛÜúùûüÇç',
            'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
        ))
        WHERE nome IS NOT NULL
          AND (nome_ordenacao IS NULL OR nome_ordenacao = '')
    `);
};

const carregarDadosSeNecessario = async () => {
    if (reset) {
        await pool.query('TRUNCATE TABLE produtos RESTART IDENTITY');
        console.log('Produtos existentes removidos.');
    }

    const resultado = await pool.query('SELECT COUNT(*)::integer AS total FROM produtos');
    const total = Number(resultado.rows[0].total);

    if (total > 0) {
        console.log(`A tabela já possui ${total} produtos. Nenhuma carga aplicada.`);
        return;
    }

    await executarArquivo(ARQUIVO_CARGA);
    console.log('Carga inicial aplicada.');
};

const main = async () => {
    try {
        console.log('Conectando ao PostgreSQL/Supabase...');
        await pool.query('SELECT 1');

        await executarArquivo(ARQUIVO_ESQUEMA);
        await migrarColunas();
        await garantirGeracaoDeId();
        await preencherOrdenacao();
        await executarArquivo(ARQUIVO_INDICES);
        await carregarDadosSeNecessario();

        const resultado = await pool.query('SELECT COUNT(*)::integer AS total FROM produtos');
        console.log(`Banco pronto. Produtos: ${resultado.rows[0].total}.`);
    } catch (erro) {
        console.error(`Falha na configuração do banco: ${erro.message}`);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

main();
