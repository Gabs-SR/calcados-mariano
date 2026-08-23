const ProdutoModel = require('../models/ProdutoModel');

const responderErro = (res, erro, mensagemDe500) => {
    if (erro.validacao) {
        return res.status(400).json({ mensagem: erro.message, erros: erro.erros || [] });
    }

    if (erro.naoEncontrado) {
        return res.status(404).json({ mensagem: erro.message });
    }

    console.error('Erro no ProdutoController:', erro);
    return res.status(500).json({ mensagem: mensagemDe500 });
};

const ProdutoController = {
    listarProdutos: async (req, res) => {
        try {
            const filtros = {
                publico: req.query.publico,
                categoria: req.query.categoria,
                ordenar: req.query.ordenar,
                pagina: req.query.pagina,
                limite: req.query.limite
            };

            const resultado = await ProdutoModel.listar(filtros);
            return res.status(200).json(resultado);
        } catch (erro) {
            return responderErro(res, erro, 'Erro interno ao buscar os produtos.');
        }
    },

    listarOpcoesDeFiltro: async (req, res) => {
        try {
            const opcoes = await ProdutoModel.opcoesDeFiltro();
            return res.status(200).json(opcoes);
        } catch (erro) {
            return responderErro(res, erro, 'Erro interno ao buscar as opções.');
        }
    },

    mostrarProduto: async (req, res) => {
        try {
            const produto = await ProdutoModel.porId(req.params.id);
            return res.status(200).json(produto);
        } catch (erro) {
            return responderErro(res, erro, 'Erro interno ao buscar o produto.');
        }
    },

    adicionarProduto: async (req, res) => {
        try {
            const criado = await ProdutoModel.adicionar(req.body);
            return res.status(201).json({
                mensagem: 'Produto adicionado com sucesso!',
                id: criado.id
            });
        } catch (erro) {
            return responderErro(res, erro, 'Erro ao salvar o produto no banco.');
        }
    },

    atualizarProduto: async (req, res) => {
        try {
            const alterado = await ProdutoModel.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Produto atualizado.', id: alterado.id });
        } catch (erro) {
            return responderErro(res, erro, 'Erro ao atualizar o produto.');
        }
    },

    removerProduto: async (req, res) => {
        try {
            const removido = await ProdutoModel.remover(req.params.id);
            return res.status(200).json({ mensagem: 'Produto removido.', id: removido.id });
        } catch (erro) {
            return responderErro(res, erro, 'Erro ao remover o produto.');
        }
    },

    buscarProdutos: async (req, res) => {
        try {
            const resultados = await ProdutoModel.buscar(req.query.termo, req.query.tipo);
            return res.status(200).json(resultados);
        } catch (erro) {
            return responderErro(res, erro, 'Erro ao pesquisar os produtos.');
        }
    }
};

module.exports = ProdutoController;
