const db = require('../config/db');

const ProdutoModel = {
    // 1. Função que lista tudo
    listarTodos: (callback) => {
        db.all('SELECT * FROM produtos', [], callback);
    },

    // 2.Função que adiciona um produto
    adicionar: (produto, callback) => {
        const sql = 'INSERT INTO produtos (nome, categoria, quantidade, status_estoque, numeracao) VALUES (?, ?, ?, ?, ?)';
        const valores = [produto.nome, produto.categoria, produto.quantidade, produto.status_estoque, produto.numeracao];
        
        // db.run usado para modificar o banco (inserir, atualizar, apagar)
        db.run(sql, valores, callback);
    },

    // 3. Função: Pesquisar por nome, categoria ou numeração
    buscar: (termo, tipo, callback) => {
        let sql = '';
        let valor = '';

        // Regras simples baseadas no tipo de pesquisa escolhida
        if (tipo === 'nome') {
            sql = 'SELECT * FROM produtos WHERE nome LIKE ?';
            valor = '%' + termo + '%'; // O % permite achar palavras parecidas
        } else if (tipo === 'categoria') {
            sql = 'SELECT * FROM produtos WHERE categoria LIKE ?';
            valor = '%' + termo + '%';
        } else if (tipo === 'numeracao') {
            sql = 'SELECT * FROM produtos WHERE numeracao = ?';
            valor = termo; // Numeração precisa ser exata (ex: 41)
        }

        db.all(sql, [valor], callback);
    }
};

module.exports = ProdutoModel;