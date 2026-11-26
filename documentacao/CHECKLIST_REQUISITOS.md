# Checklist - Enunciado DW1 4º Bimestre 2026

## Front-end
- [x] Tags HTML5 semânticas (`header`, `nav`, `main`, `section`, `aside`, `footer`)
- [x] CSS externo (`frontend/comum/comum.css` + CSS por página)
- [x] Mais de 4 páginas interligadas (11 páginas)
- [x] Cabeçalho (nome/logo), menu de navegação e rodapé (nome, turma, ano) - ajuste a turma em `frontend/comum/comum.js`
- [x] CRUD com imagens: logo do time e foto do jogador (upload local, caminho salvo no banco)

## Back-end e banco
- [x] Node.js + Express com `routes/` e `controllers/` (padrão CandyShop)
- [x] PostgreSQL via `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- [x] Tabela independente, relacionamento 1:N e 1:1 (ver `DIAGRAMA_BD.md`)
- [x] `documentacao/init.sql` com `CREATE TABLE` e `INSERT INTO` (mínimo de 10 registros por tabela)

## Repositório
- [x] `.gitignore` (`node_modules/` e `.env`) e `README.md`
- [ ] Nome do repositório conforme a nomenclatura pedida (`NomeDoAluno_3bim_NomeProjeto`)
- [ ] Colaborador `rjhalmeman@gmail.com` adicionado
- [ ] Link enviado no formulário oficial até 25/11/2026 23h59

## 4º bimestre
- [x] Visão administrativa e visão do cliente (perfil `admin` / `cliente`)
- [x] Login/logout com cookies (cookie assinado e `httpOnly`)
- [x] Núcleo do sistema: venda de ingressos com controle de lotação
- [x] Fluxo de pagamento (simulado: PIX, cartão e boleto)
