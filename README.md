# OpenVote — Sistema de Votação Estrelada

**OpenVote** é uma aplicação web de votação simples e eficiente, onde usuários autenticados podem votar em temas específicos com notas de 0 a 5 estrelas. O sistema conta com um painel administrativo para gerenciamento de temas e visualização de métricas da plataforma.

---

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como parte integrante da disciplina de **Sistemas Distribuídos** do curso de **Engenharia de Software** da **Universidade Federal do Amazonas (UFAM)**, campus **ICET**.

A aplicação tem como objetivos principais:
1.  **Teste de Deploy:** Validação de processos de implantação tanto em provedores de nuvem (online) quanto em servidores caseiros (local/on-premise).
2.  **Replicação de Banco de Dados:** Estudo e implementação de estratégias de consistência e disponibilidade através da replicação de dados entre diferentes nós do sistema.

---

## 🛠️ Stack Tecnológica

### Backend (`/api`)
- **Runtime:** Node.js
- **Framework:** Fastify (com suporte a Zod para validação)
- **Linguagem:** TypeScript
- **ORM:** Drizzle ORM (Compatível com PostgreSQL)
- **Banco de Dados (Dev):** SQLite (`better-sqlite3`)
- **Autenticação:** JWT (`@fastify/jwt`)

### Frontend (`/frontend`)
- **Framework:** React + Vite
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS + daisyUI
- **Ícones:** Lucide React
- **Navegação:** React Router DOM

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### 1. Configurando o Backend (API)
```bash
cd api
# Instalar dependências
npm install
# Configurar variáveis de ambiente (edite o arquivo .env conforme necessário)
cp .env.example .env
# Gerar o banco de dados e as tabelas
npx drizzle-kit push
# (Opcional) Popular o banco com dados de teste
npm run seed
# Iniciar o servidor
npm run dev
```
A API estará rodando em `http://localhost:3333`.

### 2. Configurando o Frontend
```bash
cd frontend
# Instalar dependências
npm install
# Iniciar o servidor de desenvolvimento
npm run dev
```
O frontend estará acessível em `http://localhost:5173`.

---

## 🔑 Credenciais de Teste (Padrão do Seed)

| Perfil | Email | Senha |
|---|---|---|
| **Administrador** | `admin@openvote.com` | `admin123` |
| **Usuário Comum** | `joao@email.com` | `user123` |

---

## 📂 Estrutura do Projeto
- `api/`: Código fonte do servidor Fastify.
- `frontend/`: Aplicação React/Vite.
- `docs/`: Documentação de arquitetura e contrato da API.

---
Desenvolvido por acadêmicos da **UFAM ICET — Engenharia de Software**.
