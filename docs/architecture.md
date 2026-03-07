# Arquitetura do Projeto

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework HTTP | Fastify |
| ORM | Drizzle ORM |
| Banco (dev) | SQLite (`better-sqlite3`) |
| Banco (prod futuro) | PostgreSQL — mesma schema, só troca o driver |
| Linguagem | TypeScript estrito (`strict: true`) |
| Autenticação | JWT via `@fastify/jwt` |
| Validação | Zod + `fastify-type-provider-zod` |
| Utilitários HTTP | `@fastify/sensible` (httpErrors), `@fastify/cors` |

> ⚠️ O schema Drizzle deve ser escrito compatível com PostgreSQL desde agora.
> Evite tipos exclusivos do SQLite. Use `integer` para IDs e `text` para datas ISO 8601.

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
| id | integer PK autoincrement | |
| name | text not null | |
| email | text not null unique | |
| password_hash | text not null | hash bcrypt, nunca texto puro |
| role | text not null | `'user'` ou `'admin'` |
| created_at | text not null | ISO 8601 |

### `topics`
| Campo | Tipo | Notas |
|---|---|---|
| id | integer PK autoincrement | |
| title | text not null | |
| description | text not null | |
| created_by | integer FK → users.id | admin que criou |
| created_at | text not null | ISO 8601 |
| updated_at | text not null | ISO 8601 |

### `votes`
| Campo | Tipo | Notas |
|---|---|---|
| id | integer PK autoincrement | |
| user_id | integer FK → users.id | |
| topic_id | integer FK → topics.id | |
| score | integer not null | 0 a 5 inclusive |
| created_at | text not null | ISO 8601 |
| updated_at | text not null | ISO 8601 |

**Constraint obrigatória:** `UNIQUE(user_id, topic_id)` — 1 voto por usuário por tema.
**Revotar:** UPDATE no registro existente (upsert), nunca INSERT duplicado.
**Exclusão de topic:** cascade delete nos votos relacionados.
**Média:** calculada via `AVG(score)` na query, nunca armazenada na tabela.