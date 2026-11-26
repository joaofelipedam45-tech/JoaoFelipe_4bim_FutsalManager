// Converte erros do PostgreSQL em respostas HTTP amigáveis
exports.responderErro = (res, err) => {
  console.error(err);
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Operação não permitida: o registro está vinculado a outros dados (ex.: partidas ou vendas).' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Já existe um registro com esse valor único (ex.: e-mail ou técnico já vinculado a outro time).' });
  }
  if (err.code === '23502' || err.code === '23514' || err.code === '22P02') {
    return res.status(400).json({ error: 'Dados inválidos ou obrigatórios não informados.' });
  }
  res.status(500).json({ error: err.message });
};
