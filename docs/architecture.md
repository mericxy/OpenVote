# Arquitetura do Projeto

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework HTTP | Fastify |
| ORM | Drizzle ORM |
| Banco | MariaDB / MySQL |
| Linguagem | TypeScript estrito (`strict: true`) |
| Autenticação | JWT via `@fastify/jwt` |
| Validação | Zod + `fastify-type-provider-zod` |
| Utilitários HTTP | `@fastify/sensible` (httpErrors), `@fastify/cors` |

> ⚠️ O schema Drizzle está configurado para MariaDB (MySQL dialect).
> Use `int` para IDs (com `autoincrement()`) e `timestamp` para datas.

---

## Estrutura de pastas — `api/`

```
api/
├── src/
│   ├── server.ts                 # Entry point: registra plugins e rotas
│   ├── db/
│   │   ├── index.ts              # Instância Drizzle (exporta `db`)
│   │   ├── schema.ts             # Todas as tabelas definidas aqui
│   │   └── migrations/           # Gerado pelo drizzle-kit (não editar à mão)
│   ├── routes/
│   │   ├── auth.ts               # POST /auth/register, POST /auth/login
│   │   ├── topics.ts             # GET|POST|PUT|DELETE /topics
│   │   └── votes.ts              # POST /votes, GET /votes/me
│   ├── controllers/              # Handlers (recebem request/reply, chamam services)
│   │   ├── auth.controller.ts
│   │   ├── topics.controller.ts
│   │   └── votes.controller.ts
│   ├── services/                 # Regras de negócio (chamam db, lançam erros)
│   │   ├── auth.service.ts
│   │   ├── topics.service.ts
│   │   └── votes.service.ts
│   ├── middlewares/
│   │   └── auth.ts               # Verifica JWT e injeta `request.user`
│   ├── plugins/
│   │   ├── jwt.ts                # Configuração do @fastify/jwt
│   │   └── cors.ts               # Configuração do @fastify/cors
│   └── types/
│       └── fastify.d.ts          # Augmentação: declara `request.user`
├── scripts/
│   └── seed.ts                   # Popula banco com dados iniciais
├── drizzle.config.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Modelo de dados

### `users`
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK autoincrement | |
| name | varchar(255) not null | |
| email | varchar(255) not null unique | |
| password_hash | varchar(255) not null | hash bcrypt |
| role | enum('user', 'admin') | |
| created_at | timestamp | default now() |

### `topics`
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK autoincrement | |
| title | varchar(255) not null | |
| description | varchar(500) not null | |
| created_by | int FK → users.id | admin que criou |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() on update now() |

### `votes`
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK autoincrement | |
| user_id | int FK → users.id | |
| topic_id | int FK → topics.id | |
| score | int not null | 0 a 5 inclusive |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() on update now() |

**Constraint obrigatória:** `UNIQUE(user_id, topic_id)` — 1 voto por usuário por tema.
**Revotar:** UPDATE no registro existente (upsert), nunca INSERT duplicado.
**Exclusão de topic:** cascade delete nos votos relacionados.
**Média:** calculada via `AVG(score)` na query, nunca armazenada na tabela.

---

## Estratégia de Distribuição e Replicação

Diferente de versões anteriores onde a replicação era feita via chamadas HTTP entre APIs, a arquitetura atual utiliza **replicação nativa do MariaDB**.

- **Eventual Consistency:** A propagação de votos entre nós ocorre de forma assíncrona através do log binário do MariaDB.
- **Topologia:** Suporta Master-Slave para leitura escalável ou Master-Master para alta disponibilidade de escrita.
- **Transparência:** A camada de aplicação (API) é agnóstica à replicação, apenas conectando-se ao nó local do banco de dados configurado no `.env`.