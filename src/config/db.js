const sqlite3 = require('sqlite3').verbose();

// Cria ou conecta a um arquivo de banco de dados na raiz do projeto
const conexao = new sqlite3.Database('./calcados_mariano.db', (erro) => {
  if (erro) {
    console.error('Erro ao conectar no SQLite:', erro.message);
  } else {
    console.log('Conectado ao banco de dados SQLite da Calçados Mariano!');
  }
});

module.exports = conexao;