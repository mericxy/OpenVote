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
- **Node.js** (v18 ou superior)
- **Python** (v3.10 ou superior)

### 🏃 Execução Rápida (Recomendado)

O projeto possui um script de automação que cuida de toda a configuração inicial (instalação de dependências, criação do banco de dados e execução dos servidores).

Basta clonar o repositório e executar:

```bash
python scripts/run.py
```

O script irá:
1.  Verificar e instalar as dependências da **API** e do **Frontend**.
2.  Configurar o arquivo `.env` automaticamente.
3.  Criar o banco de dados SQLite (`dev.db`) e popular com dados iniciais (se necessário).
4.  Iniciar a API (`http://localhost:3333`) e o Frontend (`http://localhost:5173`) em paralelo.

---

### 🛠️ Execução Manual (Passo a Passo)

Caso prefira configurar manualmente, siga os passos abaixo:

#### 1. Configurando o Backend (API)
```bash
cd api
# Instalar dependências
npm install
# Configurar variáveis de ambiente
cp .env.example .env
# Gerar o banco de dados e as tabelas
npx drizzle-kit push
# (Opcional) Popular o banco com dados de teste
npm run seed
# Iniciar o servidor
npm run dev
```

#### 2. Configurando o Frontend
```bash
cd frontend
# Instalar dependências
npm install
# Iniciar o servidor de desenvolvimento
npm run dev
```

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
