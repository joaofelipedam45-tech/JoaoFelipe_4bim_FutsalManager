const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importa a função de consulta do banco
const { query } = require('./database');

// Importa as rotas
const authRoutes = require('./routes/authRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const timeRoutes = require('./routes/timeRoutes');
const jogadorRoutes = require('./routes/jogadorRoutes');
const competicaoRoutes = require('./routes/competicaoRoutes');
const jogoRoutes = require('./routes/jogoRoutes');
const compraRoutes = require('./routes/compraRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'segredo-de-desenvolvimento'));

// Servir imagens enviadas (logos e fotos) e o frontend
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Página inicial: o menu decide se manda para o login
app.get('/', (req, res) => {
    res.redirect('/frontend/menu/menu.html');
});

// Definir Rotas da API
app.use('/api', authRoutes);
app.use('/api', tecnicoRoutes);
app.use('/api', timeRoutes);
app.use('/api', jogadorRoutes);
app.use('/api', competicaoRoutes);
app.use('/api', jogoRoutes);
app.use('/api', compraRoutes);

const PORT = process.env.PORT || 3001;

// Inicializa o servidor e testa o PostgreSQL
app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando em http://localhost:${PORT}`);

    try {
        await query('SELECT 1');
        console.log(`✅ Banco de Dados ${process.env.DB_NAME} conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`👉 Ajuste o arquivo backend/.env com a senha correta do seu PostgreSQL.`);
    }
    console.log(`=================================\n`);
});
