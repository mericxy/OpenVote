# OpenVote — Sistema de Votação

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
- **ORM:** Drizzle ORM (Compatível com MariaDB/MySQL)
- **Banco de Dados:** MariaDB (via driver `mysql2`)
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
- **MariaDB** (ou MySQL 8+) rodando localmente ou via Docker
- **Python** (v3.10 ou superior) para automação

### 🏃 Execução Rápida (Recomendado)

O projeto possui um script de automação que cuida de toda a configuração inicial (instalação de dependências e execução dos servidores).

**Importante:** Antes de rodar o script, certifique-se que o MariaDB está ativo e que você possui as credenciais configuradas no seu `.env` (o script irá criar um `.env` a partir do `.env.example` na primeira execução).

```bash
# Modo Desenvolvimento (Inicia API e Frontend separadamente)
python scripts/run.py

# Modo Produção (Builda o frontend e o serve através da API)
python scripts/run.py --prod
```

O script irá:
1.  Verificar e instalar as dependências da **API** e do **Frontend**.
2.  Configurar o arquivo `.env` automaticamente (se não existir).
3.  Aplicar as migrações no MariaDB e popular com dados iniciais (seed).
4.  No modo **dev**: Inicia a API (`:3333`) e o Frontend (`:5173`) em paralelo.
5.  No modo **prod**: Gera o build do frontend e inicia apenas a API, que servirá os arquivos estáticos.

---

### 🛠️ Execução Manual (Passo a Passo)

Caso prefira configurar manualmente, siga os passos abaixo:

#### 1. Configurando o Backend (API)
```bash
cd api
# Instalar dependências
npm install
# Configurar variáveis de ambiente (edite com seus dados do MariaDB)
cp .env.example .env
# Aplicar migrações ao banco de dados
npx drizzle-kit migrate
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
| **Usuário Comum** | `maria@email.com`| `user123` |

## 🔄 Replicação de Dados (Sistemas Distribuídos)

A consistência e disponibilidade dos dados entre diferentes nós do sistema são garantidas através da **replicação nativa do MariaDB**.

Para testar em um ambiente distribuído:
1.  Configure duas instâncias do MariaDB.
2.  Estabeleça uma topologia de replicação (ex: Master-Slave ou Master-Master).
3.  Aponte cada instância da API para o seu respectivo nó do banco de dados no arquivo `.env`.

Desta forma, os votos registrados em um nó serão propagados automaticamente para os demais através do log binário do banco de dados, seguindo os princípios de sistemas distribuídos.

---

## 📂 Estrutura do Projeto
- `api/`: Código fonte do servidor Fastify.
- `frontend/`: Aplicação React/Vite.
- `docs/`: Documentação de arquitetura e contrato da API.

---
Desenvolvido por acadêmicos da **UFAM ICET — Engenharia de Software**.
