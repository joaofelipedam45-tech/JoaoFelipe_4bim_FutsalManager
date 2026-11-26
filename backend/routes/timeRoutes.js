const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
const timeController = require('../controllers/timeController');

// Rotas para Time
router.get('/times', exigirLogin, timeController.getTimes);
router.get('/times/:id', exigirLogin, timeController.getTimeById);
router.post('/times', exigirAdmin, timeController.createTime);
router.put('/times/:id', exigirAdmin, timeController.updateTime);
router.delete('/times/:id', exigirAdmin, timeController.deleteTime);

// Upload da logo (multipart/form-data, campo 'imagem')
router.post('/times/:id/imagem', exigirAdmin, upload.single('imagem'), timeController.uploadLogo);

module.exports = router;
