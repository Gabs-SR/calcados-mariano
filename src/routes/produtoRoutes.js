const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

// Rota 1: Pesquisar produtos (Precisa vir ANTES para o Express não achar que "buscar" é um ID ou outra rota)
router.get('/produtos/buscar', ProdutoController.buscarProdutos);

// Rota 2: Mostrar todos os produtos
router.get('/produtos', ProdutoController.listarProdutos);

// Rota 3: Adicionar um produto
router.post('/produtos', ProdutoController.adicionarProduto);

module.exports = router;