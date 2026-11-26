# Exemplos de requisições (curl)

Use `-c cookies.txt` no login e `-b cookies.txt` nas demais chamadas.

```bash
# Login (admin) - grava o cookie de sessão
curl -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futsal.com","senha":"admin123"}'

# Quem sou eu?
curl -b cookies.txt http://localhost:3001/api/auth/me

# Listar partidas (qualquer usuário logado)
curl -b cookies.txt http://localhost:3001/api/jogos

# Criar partida (somente admin)
curl -b cookies.txt -X POST http://localhost:3001/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"id_competicao":1,"id_time_casa":1,"id_time_visitante":2,"data_hora":"2027-03-01T20:00","local":"Ginásio","preco":30,"capacidade":500}'

# Comprar ingressos (pagamento simulado)
curl -b cookies.txt -X POST http://localhost:3001/api/compras \
  -H "Content-Type: application/json" \
  -d '{"id_jogo":5,"quantidade":2,"forma_pagamento":"PIX"}'

# Upload da logo de um time (somente admin)
curl -b cookies.txt -X POST http://localhost:3001/api/times/1/imagem -F "imagem=@logo.png"

# Logout
curl -b cookies.txt -X POST http://localhost:3001/api/auth/logout
```
