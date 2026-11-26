const crypto = require('crypto');
const pool = require('../database');
const { criarSessao, encerrarSessao, lerSessao } = require('../middlewares/auth');
const { responderErro } = require('../erros');

const hash = (senha) => crypto.createHash('sha256').update(senha).digest('hex');

// POST /api/auth/login  { email, senha }
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });
    const result = await pool.query(
      'SELECT id, nome, perfil FROM usuario WHERE email = $1 AND senha_hash = $2',
      [email.trim().toLowerCase(), hash(senha)]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    criarSessao(res, result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    responderErro(res, err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  encerrarSessao(res);
  res.json({ message: 'Sessão encerrada.' });
};

// GET /api/auth/me  -> dados do usuário logado (ou 401)
exports.me = (req, res) => {
  const sessao = lerSessao(req);
  if (!sessao) return res.status(401).json({ error: 'Não autenticado.' });
  res.json(sessao);
};

// POST /api/auth/registrar  { nome, email, senha }  -> sempre cria perfil "cliente"
exports.registrar = async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
    if (senha.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    const result = await pool.query(
      "INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, 'cliente') RETURNING id, nome, perfil",
      [nome.trim(), email.trim().toLowerCase(), hash(senha)]
    );
    criarSessao(res, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
    responderErro(res, err);
  }
};
