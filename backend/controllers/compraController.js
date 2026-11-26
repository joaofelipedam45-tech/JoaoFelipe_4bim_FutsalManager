const pool = require('../database');
const { responderErro } = require('../erros');

const FORMAS_PAGAMENTO = ['PIX', 'CARTAO', 'BOLETO'];
const MAX_POR_COMPRA = 6;

// Consulta base: compra + dados da partida + cliente
const SELECT_COMPRA = `
  SELECT c.*, u.nome AS cliente_nome, u.email AS cliente_email,
         j.data_hora, j.local, j.preco,
         tc.nome AS time_casa_nome, tv.nome AS time_visitante_nome,
         cp.nome AS competicao_nome
    FROM compra c
    JOIN usuario u   ON u.id  = c.id_usuario
    JOIN jogo j      ON j.id  = c.id_jogo
    JOIN time tc     ON tc.id = j.id_time_casa
    JOIN time tv     ON tv.id = j.id_time_visitante
    JOIN competicao cp ON cp.id = j.id_competicao`;

// POST /api/compras  { id_jogo, quantidade, forma_pagamento }
// Regra de negócio principal: venda de ingressos com controle de lotação.
// O pagamento é simulado: a compra já nasce com status PAGO.
exports.criarCompra = async (req, res) => {
  const { id_jogo, forma_pagamento } = req.body;
  const quantidade = parseInt(req.body.quantidade, 10);

  if (!id_jogo) return res.status(400).json({ error: 'Selecione uma partida.' });
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_POR_COMPRA) {
    return res.status(400).json({ error: `Quantidade deve ser de 1 a ${MAX_POR_COMPRA} ingressos.` });
  }
  if (!FORMAS_PAGAMENTO.includes(forma_pagamento)) {
    return res.status(400).json({ error: 'Escolha uma forma de pagamento válida.' });
  }

  const client = await pool.pool.connect();
  try {
    await client.query('BEGIN');

    // Trava a linha da partida para que duas compras simultâneas não estourem a lotação
    const jogoRes = await client.query('SELECT * FROM jogo WHERE id = $1 FOR UPDATE', [id_jogo]);
    if (jogoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }
    const jogo = jogoRes.rows[0];

    if (new Date(jogo.data_hora) <= new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Esta partida já aconteceu. Vendas encerradas.' });
    }

    const vendidosRes = await client.query(
      "SELECT COALESCE(SUM(quantidade), 0)::int AS vendidos FROM compra WHERE id_jogo = $1 AND status = 'PAGO'",
      [id_jogo]
    );
    const disponiveis = jogo.capacidade - vendidosRes.rows[0].vendidos;
    if (quantidade > disponiveis) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: disponiveis === 0 ? 'Ingressos esgotados.' : `Restam apenas ${disponiveis} ingresso(s) para esta partida.`
      });
    }

    const valorTotal = (Number(jogo.preco) * quantidade).toFixed(2);
    const inserida = await client.query(
      `INSERT INTO compra (id_usuario, id_jogo, quantidade, valor_total, forma_pagamento, status)
       VALUES ($1, $2, $3, $4, $5, 'PAGO') RETURNING *`,
      [req.usuario.id, id_jogo, quantidade, valorTotal, forma_pagamento]
    );

    await client.query('COMMIT');
    res.status(201).json(inserida.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    responderErro(res, err);
  } finally {
    client.release();
  }
};

// GET /api/compras/minhas  -> compras do usuário logado
exports.minhasCompras = async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_COMPRA} WHERE c.id_usuario = $1 ORDER BY c.data_compra DESC`, [req.usuario.id]);
    res.json(result.rows);
  } catch (err) {
    responderErro(res, err);
  }
};

// GET /api/compras  -> todas as vendas (admin)
exports.todasCompras = async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_COMPRA} ORDER BY c.data_compra DESC`);
    res.json(result.rows);
  } catch (err) {
    responderErro(res, err);
  }
};

// GET /api/compras/resumo  -> indicadores para o painel do admin
exports.resumo = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE status = 'PAGO')::int                          AS vendas_pagas,
             COALESCE(SUM(quantidade) FILTER (WHERE status = 'PAGO'), 0)::int      AS ingressos_vendidos,
             COALESCE(SUM(valor_total) FILTER (WHERE status = 'PAGO'), 0)::float   AS receita,
             COUNT(*) FILTER (WHERE status = 'CANCELADO')::int                     AS cancelamentos
        FROM compra`);
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// PUT /api/compras/:id/cancelar  -> cliente cancela a própria compra; admin cancela qualquer uma
exports.cancelarCompra = async (req, res) => {
  const { id } = req.params;
  try {
    const compraRes = await pool.query(
      'SELECT c.*, j.data_hora FROM compra c JOIN jogo j ON j.id = c.id_jogo WHERE c.id = $1', [id]
    );
    if (compraRes.rows.length === 0) return res.status(404).json({ error: 'Compra não encontrada.' });
    const compra = compraRes.rows[0];

    if (req.usuario.perfil !== 'admin' && compra.id_usuario !== req.usuario.id) {
      return res.status(403).json({ error: 'Você só pode cancelar as suas próprias compras.' });
    }
    if (compra.status === 'CANCELADO') return res.status(400).json({ error: 'Compra já cancelada.' });
    if (new Date(compra.data_hora) <= new Date()) {
      return res.status(400).json({ error: 'Não é possível cancelar ingresso de partida que já aconteceu.' });
    }

    const result = await pool.query("UPDATE compra SET status = 'CANCELADO' WHERE id = $1 RETURNING *", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};
