// Sessão guardada em cookie assinado (cookie-parser + COOKIE_SECRET do .env)
const NOME_COOKIE = 'sessao';
const DURACAO_MS = 2 * 60 * 60 * 1000; // 2 horas

exports.NOME_COOKIE = NOME_COOKIE;

exports.criarSessao = (res, usuario) => {
  const dados = JSON.stringify({ id: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
  res.cookie(NOME_COOKIE, dados, {
    httpOnly: true,     // JavaScript do navegador não lê o cookie
    signed: true,       // protegido contra alteração
    sameSite: 'lax',
    maxAge: DURACAO_MS
  });
};

exports.encerrarSessao = (res) => res.clearCookie(NOME_COOKIE);

function lerSessao(req) {
  const valor = req.signedCookies && req.signedCookies[NOME_COOKIE];
  if (!valor) return null;
  try { return JSON.parse(valor); } catch { return null; }
}
exports.lerSessao = lerSessao;

// Exige usuário logado (cliente ou admin)
exports.exigirLogin = (req, res, next) => {
  const sessao = lerSessao(req);
  if (!sessao) return res.status(401).json({ error: 'Faça login para continuar.' });
  req.usuario = sessao;
  next();
};

// Exige usuário logado com perfil admin
exports.exigirAdmin = (req, res, next) => {
  const sessao = lerSessao(req);
  if (!sessao) return res.status(401).json({ error: 'Faça login para continuar.' });
  if (sessao.perfil !== 'admin') return res.status(403).json({ error: 'Acesso restrito à administração.' });
  req.usuario = sessao;
  next();
};
