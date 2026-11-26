const express = require('express');
const router = express.Router();
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
const tecnicoController = require('../controllers/tecnicoController');

// Rotas para Técnico
router.get('/tecnicos', exigirLogin, tecnicoController.getTecnicos);
router.get('/tecnicos/:id', exigirLogin, tecnicoController.getTecnicoById);
router.post('/tecnicos', exigirAdmin, tecnicoController.createTecnico);
router.put('/tecnicos/:id', exigirAdmin, tecnicoController.updateTecnico);
router.delete('/tecnicos/:id', exigirAdmin, tecnicoController.deleteTecnico);

module.exports = router;
