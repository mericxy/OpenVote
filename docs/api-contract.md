# Contrato da API

Base URL: `http://localhost:3333`

Autenticação: `Authorization: Bearer <jwt>` em todas as rotas marcadas como **Autenticado** ou **Admin**.

---

## Auth — `/auth`

### POST `/auth/register`
**Acesso:** Público

**Body:**
```json
{ "name": "string", "email": "string", "password": "string (min 6)" }
```

**Resposta 201:**
```json
{ "id": 1, "name": "João", "email": "joao@email.com", "role": "user" }
```

**Regras:**
- `role` é sempre `'user'` — nunca aceitar role no body
- Senha armazenada como hash bcrypt (rounds: 10)
- Retornar 409 se email já existe

---

### POST `/auth/login`
**Acesso:** Público

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Resposta 200:**
```json
{ "token": "jwt_string" }
```

**Payload do JWT:** `{ id, email, role }` — expiração: `7d`

**Regras:**
- Retornar 401 genérico para email não encontrado OU senha errada (nunca diferenciar)

---

## Topics — `/topics`

### GET `/topics`
**Acesso:** Autenticado

**Resposta 200:**
```json
[
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "average_score": 3.7,
    "vote_count": 42,
    "user_vote": 4
  }
]
```

> `user_vote`: nota que o usuário logado deu neste tema. `null` se ainda não votou.
> `average_score`: arredondado para 1 casa decimal. `null` se sem votos.

---

### GET `/topics/:id`
**Acesso:** Autenticado

**Resposta 200:** mesmo shape de um item do GET `/topics`
**Retornar 404** se topic não existe.

---

### POST `/topics`
**Acesso:** Admin

**Body:**
```json
{ "title": "string (min 3)", "description": "string (min 10)" }
```

**Resposta 201:**
```json
{ "id": 1, "title": "...", "description": "...", "created_by": 1, "created_at": "...", "updated_at": "..." }
```

---

### PUT `/topics/:id`
**Acesso:** Admin

**Body:** (todos opcionais, pelo menos 1 obrigatório)
```json
{ "title": "string?", "description": "string?" }
```

**Resposta 200:** topic atualizado completo
**Retornar 404** se topic não existe.

---

### DELETE `/topics/:id`
**Acesso:** Admin

**Resposta 204:** sem body
**Retornar 404** se topic não existe.
**Comportamento:** deleta topic e todos os votos relacionados (cascade).

---

### GET `/topics/:id/stats`
**Acesso:** Admin

**Resposta 200:**
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "vote_count": 42,
  "average_score": 3.7,
  "score_distribution": {
    "0": 2,
    "1": 3,
    "2": 5,
    "3": 10,
    "4": 15,
    "5": 7
  },
  "created_at": "...",
  "updated_at": "..."
}
```

---

## Votes — `/votes`

### POST `/votes`
**Acesso:** Autenticado

**Body:**
```json
{ "topic_id": 1, "score": 4 }
```

**Resposta 200:**
```json
{ "id": 1, "topic_id": 1, "user_id": 1, "score": 4, "updated_at": "..." }
```

**Regras:**
- `score` deve ser inteiro entre 0 e 5 (Zod: `z.number().int().min(0).max(5)`)
- Se já existe voto do usuário nesse topic: UPDATE (upsert)
- Se não existe: INSERT
- Retornar 404 se topic não existe

---

### GET `/votes/me`
**Acesso:** Autenticado

**Resposta 200:**
```json
[
  { "topic_id": 1, "topic_title": "string", "score": 4, "updated_at": "..." }
]
```

---

## Admin — `/admin`

### GET `/admin/users`
**Acesso:** Admin

**Resposta 200:**
```json
[
  { "id": 1, "name": "string", "email": "string", "created_at": "...", "vote_count": 7 }
]
```

> Nunca retornar `password_hash`.

---

### GET `/admin/users/stats`
**Acesso:** Admin

**Resposta 200:**
```json
{
  "total_users": 150,
  "total_votes": 430,
  "latest_registration": "2025-03-01T12:00:00.000Z"
}
```

---

## Códigos de erro padrão

| Código | Situação |
|---|---|
| 400 | Validação Zod falhou |
| 401 | Token ausente, expirado ou inválido |
| 403 | Autenticado mas sem permissão (não é admin) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 500 | Erro interno inesperado |