const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

// Quando alguém acessar 'http://localhost:3000/produtos', o servidor vai chamar a função listarProdutos
router.get('/produtos', ProdutoController.listarProdutos);

module.exports = router;