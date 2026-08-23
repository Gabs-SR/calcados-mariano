const request = require('supertest');
const { vi, describe, it, expect, beforeEach } = require('vitest');

const PRODUTOS = [
    {
        id: 1,
        nome: 'Bota Texana',
        numeracao: '41',
        categoria: 'Bota texana',
        publico: 'Masculino',
        quantidade: 8,
        status_estoque: 'Em estoque',
        marca: 'Mariano',
        cor: 'Preto',
        descricao: 'Bota de couro.',
        imagem_url: null,
        nome_ordenacao: 'bota texana'
    },
    {
        id: 2,
        nome: 'Chuteira Nike',
        numeracao: '39/40',
        categoria: 'Chuteira de futsal',
        publico: 'Unissex',
        quantidade: 15,
        status_estoque: 'Em estoque',
        marca: 'Nike',
        cor: 'Azul',
        descricao: 'Chuteira para quadra.',
        imagem_url: null,
        nome_ordenacao: 'chuteira nike'
    },
    {
        id: 3,
        nome: 'Sandália Feminina',
        numeracao: '37',
        categoria: 'Sandália',
        publico: 'Feminino',
        quantidade: 4,
        status_estoque: 'Em estoque',
        marca: 'Mariano',
        cor: 'Bege',
        descricao: 'Sandália casual.',
        imagem_url: null,
        nome_ordenacao: 'sandalia feminina'
    }
];

const dbMock = {
    query: vi.fn(async () => ({ rows: [{ id: 4 }] })),
    buscarUm: vi.fn(async (sql) => {
        if (sql.includes('COUNT(*)')) return { total: PRODUTOS.length };
        return PRODUTOS[0];
    }),
    buscarTodos: vi.fn(async (sql) => {
        if (sql.includes('DISTINCT')) {
            if (sql.includes('publico')) return [...new Set(PRODUTOS.map((p) => p.publico))].map((valor) => ({ valor }));
            return [...new Set(PRODUTOS.map((p) => p.categoria))].map((valor) => ({ valor }));
        }
        return PRODUTOS;
    })
};

vi.mock('../src/config/db', () => dbMock);

let app;

beforeEach(() => {
    vi.clearAllMocks();
    app = require('../src/app');
});

describe('API smoke', () => {
    it('carrega o Express sem depender de SQLite', () => {
        expect(app).toBeDefined();
        expect(typeof app.use).toBe('function');
    });

    it('GET / responde com a identificação da API', async () => {
        const resposta = await request(app).get('/');

        expect(resposta.status).toBe(200);
        expect(resposta.text).toContain('Calçados Mariano');
    });

    it('GET /health consulta a tabela de produtos', async () => {
        const resposta = await request(app).get('/health');

        expect(resposta.status).toBe(200);
        expect(resposta.body).toEqual({
            status: 'ok',
            banco: 'conectado',
            produtos: PRODUTOS.length
        });
        expect(dbMock.buscarUm).toHaveBeenCalledWith('SELECT COUNT(*)::integer AS total FROM produtos');
    });

    it('GET /produtos entrega o envelope esperado pela vitrine', async () => {
        const resposta = await request(app).get('/produtos');

        expect(resposta.status).toBe(200);
        expect(resposta.body.produtos).toEqual(PRODUTOS);
        expect(resposta.body.total).toBe(PRODUTOS.length);
        expect(resposta.body.pagina).toBe(1);
    });
});
