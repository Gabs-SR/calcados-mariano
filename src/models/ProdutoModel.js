const db = require('../config/db');

const TIPOS_DE_BUSCA = Object.freeze({
    nome: { coluna: 'nome', exata: false },
    categoria: { coluna: 'categoria', exata: false },
    numeracao: { coluna: 'numeracao', exata: true }
});

const PUBLICOS = Object.freeze(['Masculino', 'Feminino', 'Infantil', 'Unissex']);

const ORDENACOES = Object.freeze({
    nome: 'nome_ordenacao ASC, id ASC',
    nome_desc: 'nome_ordenacao DESC, id DESC',
    quantidade: 'quantidade ASC, id ASC',
    quantidade_desc: 'quantidade DESC, id DESC',
    recentes: 'id DESC'
});

const ORDENACAO_PADRAO = 'nome';
const LIMITE_PADRAO = 50;
const LIMITE_MAXIMO = 100;

const MAX_TEXTO = 200;
const MAX_DESCRICAO = 1000;
const MAX_URL = 500;

const COLUNAS_GRAVAVEIS = [
    'nome',
    'numeracao',
    'categoria',
    'publico',
    'subcategoria',
    'quantidade',
    'status_estoque',
    'marca',
    'cor',
    'descricao',
    'imagem_url',
    'nome_ordenacao'
];

const temPropria = (objeto, chave) => Object.prototype.hasOwnProperty.call(objeto, chave);

const chaveDeOrdenacao = (texto) =>
    texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const erroDeValidacao = (mensagem, erros) => {
    const erro = new Error(mensagem);
    erro.validacao = true;
    if (erros) erro.erros = erros;
    return erro;
};

const erroNaoEncontrado = (mensagem) => {
    const erro = new Error(mensagem);
    erro.naoEncontrado = true;
    return erro;
};

const imagemUrlAceita = (valor) =>
    valor.startsWith('/') || valor.startsWith('http://') || valor.startsWith('https://');

const textoLimpo = (valor) => (typeof valor === 'string' ? valor.trim() : valor);

const validarProduto = (produto) => {
    if (produto === null || typeof produto !== 'object' || Array.isArray(produto)) {
        return ['O corpo do pedido precisa ser um objeto JSON.'];
    }

    const erros = [];

    for (const campo of ['nome', 'categoria', 'numeracao']) {
        const valor = produto[campo];
        if (typeof valor !== 'string' || valor.trim() === '') {
            erros.push(`O campo "${campo}" é obrigatório e precisa ser um texto.`);
        } else if (valor.trim().length > MAX_TEXTO) {
            erros.push(`O campo "${campo}" passa de ${MAX_TEXTO} caracteres.`);
        }
    }

    if (typeof produto.publico !== 'string' || !PUBLICOS.includes(produto.publico.trim())) {
        erros.push(
            `O campo "publico" é obrigatório e precisa ser um destes: ${PUBLICOS.join(', ')}.`
        );
    }

    if (!Number.isInteger(produto.quantidade)) {
        erros.push('O campo "quantidade" é obrigatório e precisa ser um número inteiro.');
    } else if (produto.quantidade < 0) {
        erros.push('O campo "quantidade" não pode ser negativo.');
    }

    for (const [campo, limite] of [
        ['subcategoria', MAX_TEXTO],
        ['status_estoque', MAX_TEXTO],
        ['marca', MAX_TEXTO],
        ['cor', MAX_TEXTO],
        ['descricao', MAX_DESCRICAO],
        ['imagem_url', MAX_URL]
    ]) {
        const valor = produto[campo];
        if (valor === undefined || valor === null || valor === '') continue;
        if (typeof valor !== 'string') {
            erros.push(`O campo "${campo}" precisa ser um texto.`);
        } else if (valor.trim().length > limite) {
            erros.push(`O campo "${campo}" passa de ${limite} caracteres.`);
        }
    }

    const imagem = textoLimpo(produto.imagem_url);
    if (imagem && !imagemUrlAceita(imagem)) {
        erros.push('O campo "imagem_url" precisa começar com "/", "http://" ou "https://".');
    }

    return erros;
};

const opcional = (valor) => {
    const limpo = textoLimpo(valor);
    return limpo === undefined || limpo === '' ? null : limpo;
};

const valoresParaGravar = (produto) => {
    const quantidade = produto.quantidade;
    const status =
        typeof produto.status_estoque === 'string' && produto.status_estoque.trim() !== ''
            ? produto.status_estoque.trim()
            : quantidade > 0
              ? 'Em estoque'
              : 'Sem estoque';

    const nome = produto.nome.trim();

    return [
        nome,
        produto.numeracao.trim(),
        produto.categoria.trim(),
        produto.publico.trim(),
        opcional(produto.subcategoria),
        quantidade,
        status,
        opcional(produto.marca),
        opcional(produto.cor),
        opcional(produto.descricao),
        opcional(produto.imagem_url),
        chaveDeOrdenacao(nome)
    ];
};

const montarListagem = (filtros = {}) => {
    const erros = [];
    const condicoes = [];
    const parametros = [];

    if (filtros.publico !== undefined && filtros.publico !== '') {
        if (!PUBLICOS.includes(filtros.publico)) {
            erros.push(`O parâmetro "publico" precisa ser um destes: ${PUBLICOS.join(', ')}.`);
        } else {
            parametros.push(filtros.publico);
            condicoes.push(`publico = $${parametros.length}`);
        }
    }

    if (filtros.categoria !== undefined && filtros.categoria !== '') {
        parametros.push(filtros.categoria);
        condicoes.push(`categoria = $${parametros.length}`);
    }

    const chaveOrdenacao = filtros.ordenar || ORDENACAO_PADRAO;
    if (!temPropria(ORDENACOES, chaveOrdenacao)) {
        erros.push(
            `O parâmetro "ordenar" precisa ser um destes: ${Object.keys(ORDENACOES).join(', ')}.`
        );
    }

    const inteiroPositivo = (valor, nome, padrao, maximo) => {
        if (valor === undefined || valor === '') return padrao;
        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 1) {
            erros.push(`O parâmetro "${nome}" precisa ser um número inteiro a partir de 1.`);
            return padrao;
        }
        if (maximo !== undefined && numero > maximo) {
            erros.push(`O parâmetro "${nome}" não pode passar de ${maximo}.`);
            return padrao;
        }
        return numero;
    };

    const pagina = inteiroPositivo(filtros.pagina, 'pagina', 1);
    const limite = inteiroPositivo(filtros.limite, 'limite', LIMITE_PADRAO, LIMITE_MAXIMO);

    if (erros.length > 0) return { erros };

    const onde = condicoes.length ? ` WHERE ${condicoes.join(' AND ')}` : '';
    const offset = (pagina - 1) * limite;

    return {
        erros: [],
        pagina,
        limite,
        parametros,
        parametrosPagina: [...parametros, limite, offset],
        sqlTotal: `SELECT COUNT(*)::integer AS total FROM produtos${onde}`,
        sqlPagina: `SELECT * FROM produtos${onde} ORDER BY ${ORDENACOES[chaveOrdenacao]} LIMIT $${parametros.length + 1} OFFSET $${parametros.length + 2}`
    };
};

const idValido = (id) => /^[1-9][0-9]*$/.test(String(id));

const ProdutoModel = {
    async listar(filtros = {}) {
        const consulta = montarListagem(filtros);
        if (consulta.erros.length) {
            throw erroDeValidacao(
                'Os parâmetros da listagem não passaram na validação.',
                consulta.erros
            );
        }

        const contagem = await db.buscarUm(consulta.sqlTotal, consulta.parametros);
        const produtos = await db.buscarTodos(consulta.sqlPagina, consulta.parametrosPagina);
        const total = Number(contagem.total);

        return {
            produtos,
            total,
            pagina: consulta.pagina,
            limite: consulta.limite,
            paginas: total === 0 ? 0 : Math.ceil(total / consulta.limite)
        };
    },

    async porId(id) {
        if (!idValido(id)) {
            throw erroDeValidacao('O id precisa ser um número inteiro a partir de 1.');
        }

        const produto = await db.buscarUm('SELECT * FROM produtos WHERE id = $1', [Number(id)]);
        if (!produto) throw erroNaoEncontrado('Produto não encontrado.');
        return produto;
    },

    async adicionar(produto) {
        const erros = validarProduto(produto);
        if (erros.length) {
            throw erroDeValidacao('O produto enviado não passou na validação.', erros);
        }

        const placeholders = COLUNAS_GRAVAVEIS.map((_, indice) => `$${indice + 1}`).join(', ');
        const resultado = await db.query(
            `INSERT INTO produtos (${COLUNAS_GRAVAVEIS.join(', ')}) VALUES (${placeholders}) RETURNING id`,
            valoresParaGravar(produto)
        );

        return { id: resultado.rows[0].id };
    },

    async atualizar(id, produto) {
        if (!idValido(id)) {
            throw erroDeValidacao('O id precisa ser um número inteiro a partir de 1.');
        }

        const erros = validarProduto(produto);
        if (erros.length) {
            throw erroDeValidacao('O produto enviado não passou na validação.', erros);
        }

        const atribuicoes = COLUNAS_GRAVAVEIS.map(
            (coluna, indice) => `${coluna} = $${indice + 1}`
        ).join(', ');

        const resultado = await db.query(
            `UPDATE produtos SET ${atribuicoes} WHERE id = $${COLUNAS_GRAVAVEIS.length + 1} RETURNING id`,
            [...valoresParaGravar(produto), Number(id)]
        );

        if (!resultado.rows[0]) throw erroNaoEncontrado('Produto não encontrado.');
        return { id: resultado.rows[0].id };
    },

    async remover(id) {
        if (!idValido(id)) {
            throw erroDeValidacao('O id precisa ser um número inteiro a partir de 1.');
        }

        const resultado = await db.query(
            'DELETE FROM produtos WHERE id = $1 RETURNING id',
            [Number(id)]
        );

        if (!resultado.rows[0]) throw erroNaoEncontrado('Produto não encontrado.');
        return { id: resultado.rows[0].id };
    },

    async opcoesDeFiltro() {
        const [categorias, publicos] = await Promise.all([
            db.buscarTodos(
                `SELECT DISTINCT categoria AS valor
                 FROM produtos
                 WHERE categoria IS NOT NULL AND categoria <> ''
                 ORDER BY categoria ASC`
            ),
            db.buscarTodos(
                `SELECT DISTINCT publico AS valor
                 FROM produtos
                 WHERE publico IS NOT NULL AND publico <> ''
                 ORDER BY publico ASC`
            )
        ]);

        return {
            categorias: categorias.map((linha) => linha.valor),
            publicos: publicos.map((linha) => linha.valor)
        };
    },

    async buscar(termo, tipo) {
        const tipoValido = typeof tipo === 'string' && temPropria(TIPOS_DE_BUSCA, tipo);
        if (!tipoValido) {
            throw erroDeValidacao(
                `O parâmetro "tipo" é obrigatório e precisa ser um destes: ${Object.keys(TIPOS_DE_BUSCA).join(', ')}.`
            );
        }

        if (typeof termo !== 'string' || termo.trim() === '') {
            throw erroDeValidacao('O parâmetro "termo" é obrigatório.');
        }

        const busca = TIPOS_DE_BUSCA[tipo];
        const valor = busca.exata ? termo.trim() : `%${termo.trim()}%`;
        const operador = busca.exata ? '=' : 'ILIKE';

        return db.buscarTodos(
            `SELECT * FROM produtos WHERE ${busca.coluna} ${operador} $1 ORDER BY nome_ordenacao ASC, id ASC`,
            [valor]
        );
    },

    async listarTodos() {
        return db.buscarTodos('SELECT * FROM produtos ORDER BY id ASC');
    }
};

module.exports = ProdutoModel;
