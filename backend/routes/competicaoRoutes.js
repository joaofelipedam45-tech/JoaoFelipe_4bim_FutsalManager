const express = require('express');
const router = express.Router();
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
const competicaoController = require('../controllers/competicaoController');

// Rotas para Competição
router.get('/competicoes', exigirLogin, competicaoController.getCompeticoes);
router.get('/competicoes/:id', exigirLogin, competicaoController.getCompeticaoById);
router.post('/competicoes', exigirAdmin, competicaoController.createCompeticao);
router.put('/competicoes/:id', exigirAdmin, competicaoController.updateCompeticao);
router.delete('/competicoes/:id', exigirAdmin, competicaoController.deleteCompeticao);

module.exports = router;
