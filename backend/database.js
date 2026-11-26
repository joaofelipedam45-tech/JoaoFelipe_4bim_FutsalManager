const { Pool, types } = require('pg');
const path = require('path');

// Carrega o .env localizado na pasta backend
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Lista de variáveis obrigatórias
const variaveisObrigatorias = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

for (const variavel of variaveisObrigatorias) {
    if (!process.env[variavel]) {
        throw new Error(`❌ A variável de ambiente '${variavel}' não está definida no arquivo .env`);
    }
}

// Colunas DATE chegam como texto 'AAAA-MM-DD' (evita deslocamento de fuso horário)
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
    console.error('Erro no pool de conexão:', err);
});

// Exporta no formato do CandyShop (query + pool).
// O próprio objeto exportado também responde a .query(), mantendo compatibilidade com os controllers.
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
