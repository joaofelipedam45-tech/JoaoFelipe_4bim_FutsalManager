const pool = require('../database');
const { responderErro } = require('../erros');

// Consulta base: partida + times + competição + ingressos disponíveis
const SELECT_JOGO = `
  SELECT j.*,
         c.nome  AS competicao_nome,
         tc.nome AS time_casa_nome,  tc.logo AS time_casa_logo,
         tv.nome AS time_visitante_nome, tv.logo AS time_visitante_logo,
         COALESCE((SELECT SUM(quantidade) FROM compra WHERE id_jogo = j.id AND status = 'PAGO'), 0)::int AS ingressos_vendidos
    FROM jogo j
    JOIN competicao c ON c.id = j.id_competicao
    JOIN time tc ON tc.id = j.id_time_casa
    JOIN time tv ON tv.id = j.id_time_visitante`;

const comDisponiveis = (row) => ({ ...row, ingressos_disponiveis: row.capacidade - row.ingressos_vendidos });

// GET /api/jogos
exports.getJogos = async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_JOGO} ORDER BY j.data_hora`);
    res.json(result.rows.map(comDisponiveis));
  } catch (err) {
    responderErro(res, err);
  }
};

// GET /api/jogos/:id
exports.getJogoById = async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_JOGO} WHERE j.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partida não encontrada' });
    res.json(comDisponiveis(result.rows[0]));
  } catch (err) {
    responderErro(res, err);
  }
};

function validar(body) {
  const { id_competicao, id_time_casa, id_time_visitante, data_hora, preco, capacidade } = body;
  if (!id_competicao || !id_time_casa || !id_time_visitante || !data_hora) return 'Preencha competição, times e data/hora.';
  if (String(id_time_casa) === String(id_time_visitante)) return 'Os times da partida devem ser diferentes.';
  if (preco === '' || preco === undefined || Number(preco) < 0) return 'Informe um preço válido.';
  if (!capacidade || Number(capacidade) < 1) return 'Informe a capacidade do ginásio.';
  return null;
}

// POST /api/jogos
exports.createJogo = async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { id_competicao, id_time_casa, id_time_visitante, data_hora, local, preco, capacidade } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jogo (id_competicao, id_time_casa, id_time_visitante, data_hora, local, preco, capacidade)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id_competicao, id_time_casa, id_time_visitante, data_hora, local || null, preco, capacidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// PUT /api/jogos/:id
exports.updateJogo = async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { id_competicao, id_time_casa, id_time_visitante, data_hora, local, preco, capacidade } = req.body;
  try {
    const result = await pool.query(
      `UPDATE jogo SET id_competicao = $1, id_time_casa = $2, id_time_visitante = $3,
              data_hora = $4, local = $5, preco = $6, capacidade = $7
        WHERE id = $8 RETURNING *`,
      [id_competicao, id_time_casa, id_time_visitante, data_hora, local || null, preco, capacidade, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partida não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// DELETE /api/jogos/:id
exports.deleteJogo = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM jogo WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Partida não encontrada' });
    res.json({ message: 'Partida deletada com sucesso' });
  } catch (err) {
    responderErro(res, err);
  }
};
