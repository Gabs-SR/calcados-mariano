const ProdutoModel = require('../models/ProdutoModel');

const ProdutoController = {
    // Função simples para listar os calçados e enviar para o site (front-end)
    listarProdutos: (req, res) => {
        ProdutoModel.listarTodos((erro, resultados) => {
            // Se houver algum problema, avisamos o front-end com um erro
            if (erro) {
                return res.status(500).json({ 
                    mensagem: 'Erro interno ao buscar os produtos no banco de dados.' 
                });
            }
            
            // Se der tudo certo, enviamos a lista de sapatos, tênis e chuteiras com sucesso
            return res.status(200).json(resultados);
        });
    }
};

module.exports = ProdutoController;