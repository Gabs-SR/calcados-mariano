const db = require('../config/db');

const ProdutoModel = {
  // Função para buscar todos os produtos
  listarTodos: (callback) => {
    const sql = 'SELECT * FROM produtos';
    
    db.all(sql, [], (erro, resultados) => {
      if (erro) {
        console.error('Erro ao buscar produtos:', erro.message);
        return callback(erro, null);
      }
      callback(null, resultados);
    });
  }
};

module.exports = ProdutoModel;