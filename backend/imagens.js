const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PASTA = path.join(__dirname, '../imagens');

// Redimensiona a imagem enviada e salva como PNG em /imagens.
// Retorna o caminho público que será gravado no banco.
exports.salvarImagem = async (buffer, nomeArquivo) => {
  fs.mkdirSync(PASTA, { recursive: true });
  await sharp(buffer)
    .resize(400, 400, { fit: 'cover' })
    .png()
    .toFile(path.join(PASTA, nomeArquivo));
  return `/imagens/${nomeArquivo}`;
};
