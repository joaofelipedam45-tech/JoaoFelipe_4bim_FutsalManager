# Diagrama do Banco de Dados - Futsal Manager

```mermaid
erDiagram
    TECNICO ||--o| TIME : "comanda (1:1)"
    TIME ||--o{ JOGADOR : "possui (1:N)"
    COMPETICAO ||--o{ JOGO : "tem (1:N)"
    TIME ||--o{ JOGO : "joga em casa (1:N)"
    TIME ||--o{ JOGO : "joga como visitante (1:N)"
    USUARIO ||--o{ COMPRA : "realiza (1:N)"
    JOGO ||--o{ COMPRA : "recebe (1:N)"

    TECNICO { int id PK  string nome  string email  string telefone  string licenca }
    COMPETICAO { int id PK  string nome  text descricao  date data_inicio  date data_fim  string local }
    TIME { int id PK  string nome  string cidade  int id_tecnico FK  string logo }
    JOGADOR { int id PK  string nome  int numero  string posicao  int id_time FK  date data_nascimento  string foto }
    USUARIO { int id PK  string nome  string email  string senha_hash  string perfil }
    JOGO { int id PK  int id_competicao FK  int id_time_casa FK  int id_time_visitante FK  timestamp data_hora  string local  numeric preco  int capacidade }
    COMPRA { int id PK  int id_usuario FK  int id_jogo FK  int quantidade  numeric valor_total  string forma_pagamento  string status  timestamp data_compra }
```

## Relacionamentos exigidos no enunciado

| Tipo | Onde |
|------|------|
| Tabela independente | `competicao` (e `usuario`) |
| 1:1 | `tecnico` ↔ `time` (`time.id_tecnico` é `UNIQUE`) |
| 1:N | `time` → `jogador`, `competicao` → `jogo`, `usuario` → `compra`, `jogo` → `compra` |

Valores válidos: `usuario.perfil` = `admin` ou `cliente`; `compra.forma_pagamento` = `PIX`, `CARTAO` ou `BOLETO`; `compra.status` = `PAGO` ou `CANCELADO`.
