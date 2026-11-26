const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');

router.get('/jogos', exigirLogin, jogoController.getJogos);
router.get('/jogos/:id', exigirLogin, jogoController.getJogoById);
router.post('/jogos', exigirAdmin, jogoController.createJogo);
router.put('/jogos/:id', exigirAdmin, jogoController.updateJogo);
router.delete('/jogos/:id', exigirAdmin, jogoController.deleteJogo);

module.exports = router;
