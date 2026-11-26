const pool = require('../database');
const { responderErro } = require('../erros');
const { salvarImagem } = require('../imagens');

// Listar todos os times
exports.getTimes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, tc.nome as tecnico_nome 
      FROM time t 
      LEFT JOIN tecnico tc ON t.id_tecnico = tc.id 
      ORDER BY t.id
    `);
    res.json(result.rows);
  } catch (err) {
    responderErro(res, err);
  }
};

// Obter time por ID
exports.getTimeById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT t.*, tc.nome as tecnico_nome 
      FROM time t 
      LEFT JOIN tecnico tc ON t.id_tecnico = tc.id 
      WHERE t.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// Criar novo time
exports.createTime = async (req, res) => {
  const { nome, cidade, id_tecnico } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO time (nome, cidade, id_tecnico) VALUES ($1, $2, $3) RETURNING *',
      [nome, cidade, id_tecnico || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// Atualizar time
exports.updateTime = async (req, res) => {
  const { id } = req.params;
  const { nome, cidade, id_tecnico } = req.body;
  try {
    const result = await pool.query(
      'UPDATE time SET nome = $1, cidade = $2, id_tecnico = $3 WHERE id = $4 RETURNING *',
      [nome, cidade, id_tecnico || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// Deletar time
exports.deleteTime = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM time WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }
    res.json({ message: 'Time deletado com sucesso' });
  } catch (err) {
    responderErro(res, err);
  }
};

// Upload da logo do time (arquivo salvo em /imagens e caminho gravado no banco)
exports.uploadLogo = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    const caminho = await salvarImagem(req.file.buffer, `time_${id}.png`);
    const result = await pool.query('UPDATE time SET logo = $1 WHERE id = $2 RETURNING *', [caminho, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Time não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};
