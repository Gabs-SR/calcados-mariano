const request = require('supertest');
const { vi, describe, it, expect, beforeEach, afterEach } = require('vitest');
const { gerarHashDeSenha } = require('../src/auth/sessao');

const dbMock = vi.hoisted(() => ({
    query: vi.fn(async () => ({ rows: [{ id: 10 }] })),
    buscarUm: vi.fn(async () => ({ total: 0 })),
    buscarTodos: vi.fn(async () => [])
}));

vi.mock('../src/config/db', () => dbMock);

const app = require('../src/app');
const SENHA = 'senha-de-teste-segura';

beforeEach(() => {
    process.env.ADMIN_SENHA_HASH = gerarHashDeSenha(SENHA);
    process.env.SESSAO_SEGREDO = 'segredo-de-teste-longo-o-bastante';
    vi.clearAllMocks();
});

afterEach(() => {
    delete process.env.ADMIN_SENHA_HASH;
    delete process.env.SESSAO_SEGREDO;
});

describe('autenticação', () => {
    it('inicia sessão com a senha correta', async () => {
        const resposta = await request(app).post('/auth/login').send({ senha: SENHA });

        expect(resposta.status).toBe(200);
        expect(resposta.headers['set-cookie'][0]).toContain('HttpOnly');
        expect(resposta.headers['set-cookie'][0]).toContain('sessao_mariano=');
    });

    it('recusa senha incorreta', async () => {
        const resposta = await request(app).post('/auth/login').send({ senha: 'errada' });

        expect(resposta.status).toBe(401);
    });

    it('recusa escrita sem sessão', async () => {
        const resposta = await request(app).post('/produtos').send({
            nome: 'Bota',
            categoria: 'Bota',
            publico: 'Masculino',
            numeracao: '42',
            quantidade: 2
        });

        expect(resposta.status).toBe(401);
        expect(dbMock.query).not.toHaveBeenCalled();
    });

    it('permite escrita depois do login', async () => {
        const login = await request(app).post('/auth/login').send({ senha: SENHA });
        const cookie = login.headers['set-cookie'][0].split(';')[0];

        const resposta = await request(app)
            .post('/produtos')
            .set('Cookie', cookie)
            .send({
                nome: 'Bota',
                categoria: 'Bota',
                publico: 'Masculino',
                numeracao: '42',
                quantidade: 2
            });

        expect(resposta.status).toBe(201);
        expect(resposta.body.id).toBe(10);
    });

    it('retorna 503 quando a autenticação não está configurada', async () => {
        delete process.env.ADMIN_SENHA_HASH;
        delete process.env.SESSAO_SEGREDO;

        const resposta = await request(app).post('/auth/login').send({ senha: SENHA });

        expect(resposta.status).toBe(503);
    });
});
