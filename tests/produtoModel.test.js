const { vi, describe, it, expect } = require('vitest');

const { produtos, dbMock } = vi.hoisted(() => {
    const produtos = [
        {
            id: 1,
            nome: 'Bota Texana',
            numeracao: '41',
            categoria: 'Bota',
            publico: 'Masculino',
            quantidade: 8
        },
        {
            id: 2,
            nome: 'Chuteira Nike',
            numeracao: '39/40',
            categoria: 'Chuteira de futsal',
            publico: 'Unissex',
            quantidade: 15
        }
    ];

    const dbMock = {
        query: vi.fn(async () => ({ rows: [{ id: 3 }] })),
        buscarUm: vi.fn(async (sql) =>
            sql.includes('COUNT(*)') ? { total: produtos.length } : produtos[0]
        ),
        buscarTodos: vi.fn(async () => produtos)
    };

    return { produtos, dbMock };
});

vi.mock('../src/config/db', () => dbMock);

const ProdutoModel = require('../src/models/ProdutoModel');

describe('ProdutoModel PostgreSQL', () => {
    it('lista produtos usando paginação e retorna envelope numérico', async () => {
        const resultado = await ProdutoModel.listar({ pagina: '1', limite: '10' });

        expect(resultado).toEqual({
            produtos,
            total: 2,
            pagina: 1,
            limite: 10,
            paginas: 1
        });
        expect(dbMock.buscarUm).toHaveBeenCalled();
        expect(dbMock.buscarTodos).toHaveBeenCalled();
    });

    it('valida público antes de consultar o banco', async () => {
        await expect(
            ProdutoModel.adicionar({
                nome: 'Produto',
                numeracao: '40',
                categoria: 'Bota',
                publico: 'Qualquer',
                quantidade: 1
            })
        ).rejects.toMatchObject({ validacao: true });

        expect(dbMock.query).not.toHaveBeenCalled();
    });

    it('valida quantidade negativa', async () => {
        await expect(
            ProdutoModel.adicionar({
                nome: 'Produto',
                numeracao: '40',
                categoria: 'Bota',
                publico: 'Masculino',
                quantidade: -1
            })
        ).rejects.toMatchObject({ validacao: true });
    });

    it('insere todas as colunas do schema e usa RETURNING id', async () => {
        const resultado = await ProdutoModel.adicionar({
            nome: '  Bota Nova  ',
            numeracao: '42',
            categoria: 'Bota',
            publico: 'Masculino',
            subcategoria: 'Couro',
            quantidade: 5,
            marca: 'Mariano',
            cor: 'Preto',
            descricao: 'Produto novo',
            imagem_url: '/img/bota.jpg'
        });

        expect(resultado).toEqual({ id: 3 });
        const [sql, parametros] = dbMock.query.mock.calls.at(-1);
        expect(sql).toContain('INSERT INTO produtos');
        expect(sql).toContain('subcategoria');
        expect(sql).toContain('nome_ordenacao');
        expect(sql).toContain('RETURNING id');
        expect(parametros[0]).toBe('Bota Nova');
        expect(parametros[11]).toBe('bota nova');
    });

    it('rejeita tipo de busca desconhecido sem executar SQL', async () => {
        await expect(ProdutoModel.buscar('bota', 'cor')).rejects.toMatchObject({ validacao: true });
    });

    it('rejeita termo de busca vazio', async () => {
        await expect(ProdutoModel.buscar('   ', 'nome')).rejects.toMatchObject({ validacao: true });
    });
});
