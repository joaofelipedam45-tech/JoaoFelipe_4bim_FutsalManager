const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');

// Rotas fixas antes das rotas com :id
router.get('/compras/minhas', exigirLogin, compraController.minhasCompras);
router.get('/compras/resumo', exigirAdmin, compraController.resumo);
router.get('/compras', exigirAdmin, compraController.todasCompras);
router.post('/compras', exigirLogin, compraController.criarCompra);
router.put('/compras/:id/cancelar', exigirLogin, compraController.cancelarCompra);

module.exports = router;
