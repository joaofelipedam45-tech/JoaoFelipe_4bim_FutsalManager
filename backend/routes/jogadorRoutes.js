const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
const jogadorController = require('../controllers/jogadorController');

// Rotas para Jogador
router.get('/jogadores', exigirLogin, jogadorController.getJogadores);
router.get('/jogadores/:id', exigirLogin, jogadorController.getJogadorById);
router.get('/times/:id_time/jogadores', exigirLogin, jogadorController.getJogadoresByTime);
router.post('/jogadores', exigirAdmin, jogadorController.createJogador);
router.put('/jogadores/:id', exigirAdmin, jogadorController.updateJogador);
router.delete('/jogadores/:id', exigirAdmin, jogadorController.deleteJogador);

// Upload da foto (multipart/form-data, campo 'imagem')
router.post('/jogadores/:id/imagem', exigirAdmin, upload.single('imagem'), jogadorController.uploadFoto);

module.exports = router;
