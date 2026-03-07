# Convenções de Código

## Nomenclatura

| Contexto | Padrão | Exemplo |
|---|---|---|
| Arquivos | `kebab-case` | `auth.service.ts` |
| Variáveis e funções | `camelCase` | `getUserById` |
| Types e Interfaces | `PascalCase` | `JwtPayload` |
| Constantes globais | `UPPER_SNAKE_CASE` | `JWT_EXPIRATION` |

---

## TypeScript

- `strict: true` no `tsconfig.json` — obrigatório
- Proibido usar `any` — crie interfaces explícitas
- Prefira `type` para shapes simples, `interface` para contratos que podem ser estendidos
- Augmentação de tipos do Fastify em `src/types/fastify.d.ts`:

```ts
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number
      email: string
      role: 'user' | 'admin'
    }
  }
}
```

---

## Estrutura de uma rota

```ts
// src/routes/topics.ts
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const topicsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/topics', {
    schema: {
      response: { 200: z.array(TopicSchema) }
    },
    onRequest: [app.authenticate], // middleware de auth
  }, async (request, reply) => {
    return topicsController.list(request, reply)
  })
}
```

---

## Camadas (responsabilidades)

- **route**: define schema Zod, registra middleware, chama controller
- **controller**: extrai dados do request, chama service, retorna reply
- **service**: contém a lógica de negócio, acessa `db`, lança `httpErrors`

```ts
// Exemplo de service lançando erro corretamente
import { httpErrors } from '@fastify/sensible'

export async function getTopicById(id: number) {
  const topic = await db.select().from(topics).where(eq(topics.id, id)).get()
  if (!topic) throw httpErrors.notFound('Topic not found')
  return topic
}
```

---

## Variáveis de ambiente

Sempre lidas via `process.env`, nunca hardcoded. Arquivo `.env.example`:

```env
DATABASE_URL=./dev.db
JWT_SECRET=troca_esse_valor_para_producao
PORT=3333
NODE_ENV=development
```

---

## Seed (`scripts/seed.ts`)

O seed deve criar:
1. 1 admin: `admin@openvote.com` / senha `admin123`
2. 2 usuários comuns com alguns votos
3. 3 temas de exemplo

Executar com: `npx tsx scripts/seed.ts`

---

## O que NÃO implementar agora

Não implemente as funcionalidades abaixo, mesmo que pareçam simples ou úteis. Elas estão planejadas para fases futuras:

- Upload de imagem para temas
- Paginação nas listagens
- Refresh token / rotação de JWT
- Verificação de email no cadastro
- Soft delete (usar hard delete por enquanto)
- Rate limiting
- WebSocket / atualizações em tempo real

---

## Próximos passos previstos (não implementar agora)

- Migração do driver Drizzle de SQLite → PostgreSQL
- Replicação via PostgreSQL streaming replication
- Frontend React + Vite consumindo esta API
- WebSocket para médias em tempo real