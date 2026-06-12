# 1000 Valle — Sistema de Gestão de Leads

[![Status](https://img.shields.io/badge/sprint-3-green)](#sprints)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)

Sistema web para gestão completa do ciclo de vida de um lead comercial — captação, qualificação, negociação e fechamento — com controle por equipe, loja e perfil de usuário. Inclui vitrine pública de veículos com fluxo de aprovação.

**Parceiro:** 1000 Valle Multimarcas · **Período:** 2026-1 · **Metodologia:** Scrum (sprints de 3 semanas)

---

## Sumário

- [Quick Start](#quick-start)
- [Credenciais de teste](#credenciais-de-teste)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API REST](#api-rest)
- [Testes](#testes)
- [Comandos úteis](#comandos-úteis)
- [Troubleshooting](#troubleshooting)
- [Padrões adotados](#padrões-adotados)
- [Sprints](#sprints)
- [Time](#time)

---

## Quick Start

Pré-requisito único: **Docker Desktop** instalado e em execução. Não precisa de Node, Postgres ou Prisma no host.

```bash
# 1. Clone o repositório
git clone https://github.com/NexussDev/abp-3-valle-leads-system.git
cd abp-3-valle-leads-system

# 2. Copie o template de variáveis (Linux/macOS)
cp .env.example .env

# 2. Copie o template de variáveis (Windows PowerShell)
Copy-Item .env.example .env

# 3. Suba a stack
docker compose up --build -d
```

Aguarde ~60s na primeira vez (o backend roda migrations + seed automaticamente). Acompanhe os logs com:

```bash
docker compose logs -f backend frontend
```

Quando o backend logar `Server running on port 3000` e o frontend logar `VITE ready`, acesse:

| Serviço | URL |
|---|---|
| Frontend (app interno) | http://localhost:5173 |
| Frontend (vitrine pública) | http://localhost:5173/catalogo |
| Backend API | http://localhost:3000 |
| PostgreSQL | `localhost:5433` (user/pass do `.env`) |

> **O que o Docker faz para você** — automaticamente, sem nenhum passo extra:
> 1. Sobe o Postgres 15 com volume persistente.
> 2. Builda o backend (TypeScript → JS) e roda `prisma migrate deploy` para aplicar todas as migrations.
> 3. Roda o seed (`prisma db seed`) — idempotente: se já existem usuários, ignora.
> 4. Inicia o backend Express e o frontend Vite.

Para derrubar tudo sem perder o banco: `docker compose down`. Para resetar inclusive o banco: `docker compose down -v`.

---

## Credenciais de teste

Criadas pelo seed na primeira subida. Senha igual para todas as contas: **`123456`**.

| E-mail | Perfil | Escopo de acesso |
|---|---|---|
| `admin@1000valle.com` | ADMIN | Tudo no sistema |
| `gerente.geral@1000valle.com` | GERENTE_GERAL | Todas as lojas e equipes |
| `maria@1000valle.com` | GERENTE | Toda a Loja Central |
| `joao@1000valle.com` | ATENDENTE | Apenas os próprios leads (Equipe Norte) |
| `carlos@1000valle.com` | ATENDENTE | Apenas os próprios leads (Equipe Sul) |

---

## Arquitetura

### Backend — Clean Architecture (quatro camadas)

```
presentation/     ─→ HTTP: routes, controllers, middlewares de auth
        │
        ▼
application/      ─→ Regras de negócio: services, casos de uso
        │
        ▼
domain/           ─→ Entidades, value objects, validadores de transição
        │
        ▼
infrastructure/   ─→ Detalhes: Prisma, repositories, conexão com Postgres
```

Cada camada só conhece a de baixo. Controllers chamam services; services chamam repositories; repositories falam com o banco. Domain não importa nada de fora — só TypeScript puro.

Pasta `shared/` agrupa código transversal: tipos (`AuthUser`, `Role`), erros (`AppError`), utils e validators.

### Frontend — Organização por responsabilidade

```
pages/         ─→ Cada rota da aplicação (Dashboard, Leads, ModerarVitrine, ...)
components/    ─→ Componentes reutilizáveis (OriginBadge, LeadHistoryTimeline, ...)
services/      ─→ Cliente Axios + chamadas tipadas à API
hooks/         ─→ Lógica reutilizável (useColumnLimit, useKanbanBoard)
types/         ─→ Tipos compartilhados de domínio
styles/        ─→ CSS de página
routes/        ─→ Configuração do React Router
```

### Padrões de projeto aplicados

| Padrão | Onde | Por quê |
|---|---|---|
| **Repository** | `backend/src/infrastructure/repositories/*` | Isola o ORM (Prisma) — services não conhecem SQL |
| **Service Layer** | `backend/src/application/services/*` | Concentra regras de negócio fora de controllers |
| **State (GoF)** | `domain/entities/LeadStage.ts` | Valida transições de estágio do lead (não pode pular etapas, fechar exige motivo) |
| **Middleware Chain** | `infrastructure/middleware/authMiddleware.ts` | Auth + RBAC antes de cada handler |
| **DTO público** | `presentation/controllers/PublicCatalogController.ts` | Vitrine pública não vaza colunas internas do banco |

Diagrama completo: [`docs/diagramas/`](docs/diagramas/) · Discussão de padrões: [`docs/padroes-de-projeto.md`](docs/padroes-de-projeto.md)

---

## Estrutura de pastas

```
abp-3-valle-leads-system/
├── .env.example                # Template de variáveis (copie para .env)
├── docker-compose.yml          # Postgres + backend + frontend
├── README.md
├── backend/
│   ├── Dockerfile              # Build em dois estágios (builder + runtime)
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de dados
│   │   ├── migrations/         # 9 migrations versionadas
│   │   └── seed.ts             # Seed idempotente (skip se já houver dados)
│   └── src/
│       ├── domain/             # Entidades + regras invariantes
│       ├── application/        # Services (LeadService, NegotiationService, ...)
│       ├── infrastructure/     # Repositories Prisma, middlewares, conexão DB
│       ├── presentation/       # Routes + Controllers Express
│       ├── shared/             # Types, errors, validators, utils
│       └── __tests__/          # Suite Jest (14 arquivos de teste)
├── frontend/
│   ├── Dockerfile              # Vite dev server
│   └── src/
│       ├── pages/              # Rotas (Dashboard, Leads, ModerarVitrine, ...)
│       ├── components/         # Reutilizáveis (Sidebar, OriginBadge, ...)
│       ├── hooks/, services/, types/, styles/, routes/
│       └── **/__tests__/       # Vitest (8 arquivos, 54 testes)
└── docs/
    ├── api.md                  # Documentação dos endpoints
    ├── backlog/                # Product backlog e sprint backlogs
    ├── diagramas/              # DER e diagramas UML
    └── retrospectivas/         # Retros das sprints
```

---

## Funcionalidades

**Gestão de leads**
- Cadastro manual + captação via formulário público (`/demonstrar-interesse`)
- Kanban com 5 estágios e validação de transições (não pode pular etapas; fechar exige motivo)
- Filtros por período, loja, equipe, atendente e temperatura
- Edição de lead, histórico de alterações por lead, repescagem de leads frios
- Badges visuais de origem (WhatsApp, Instagram, Facebook, etc) com cor da marca

**Vitrine de veículos**
- Atendente publica veículo (FIPE auto-preenche preço, Pexels sugere foto)
- Gerente modera (aprovar / rejeitar com motivo / marcar como vendido)
- Vitrine pública consome apenas listings aprovados
- Estados: `PENDING → APPROVED → SOLD` ou `PENDING → REJECTED → PENDING` (edição reabilita)

**Equipes & usuários**
- Admin cria equipes, gerencia membros (modal completo com busca + add/remove)
- RBAC em três níveis aplicado no service: ATENDENTE vê só os próprios, LIDER/GERENTE veem a equipe/loja, ADMIN/GERENTE_GERAL veem tudo

**Dashboards**
- Métricas operacionais (total, fechados, conversão, tempo médio de atendimento)
- Gráficos por origem, ranking de atendentes, motivos de fechamento
- Visões distintas por perfil (Atendente / Líder / Gerente / Admin)

**Auditoria**
- `SystemLog` registra CREATE/UPDATE/APPROVE/REJECT/SOLD/LOGIN
- `NegotiationHistory` registra transições de estágio
- Página `/logs` com filtros e paginação

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + TypeScript + Vite | React 19, Vite 5 |
| Roteamento | React Router | 7 |
| Gráficos | Recharts | 3 |
| HTTP client | Axios | 1 |
| Backend | Node + Express + TypeScript | Node 20, Express 5 |
| ORM | Prisma | 5 |
| Banco | PostgreSQL | 15 |
| Auth | JWT (`jsonwebtoken`) + bcrypt | — |
| Containerização | Docker + Docker Compose | — |
| Testes | Vitest (front) · Jest (back) | — |

---

## Variáveis de ambiente

Todas as variáveis ficam em **um único `.env` na raiz** (consumido pelo `docker-compose.yml` para os três serviços). O arquivo `.env.example` é o template oficial.

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=troque-esta-senha
POSTGRES_DB=valle_leads
POSTGRES_PORT=5433

# Backend
DATABASE_URL=postgresql://postgres:troque-esta-senha@postgres:5432/valle_leads
JWT_SECRET=troque-este-segredo-por-um-valor-aleatorio-longo
BACKEND_PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_PORT=5173
```

> ⚠️ **Importante**
> - `DATABASE_URL` aponta para o host `postgres` (nome do serviço no compose), não para `localhost`.
> - Em produção, gere um `JWT_SECRET` forte: `openssl rand -hex 64`
> - O `.env` está no `.gitignore` — **nunca commit**.

---

## API REST

Base URL: `http://localhost:3000`

Rotas autenticadas exigem o header `Authorization: Bearer <token>`. Token é obtido em `POST /auth/login`.

### Autenticação (público)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Retorna `{ user, token }` |

### Captação pública (sem auth)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/public/leads` | Formulário "Quero ser atendido" — cria lead, cliente e negociação |
| `GET`  | `/public/catalog` | Lista veículos publicados (status `APPROVED`) |
| `GET`  | `/public/catalog/:id` | Detalhe público de um veículo |

### Leads (auth + RBAC)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/leads` | Lista leads no escopo do usuário |
| `GET` | `/api/leads/:id` | Detalhe de um lead |
| `GET` | `/api/leads/:id/history` | Timeline unificada (SystemLog + NegotiationHistory) |
| `POST` | `/api/leads` | Cria lead |
| `PUT` / `PATCH` | `/api/leads/:id` | Atualiza (transição de estágio validada) |
| `PATCH` | `/api/leads/:id/contact` | Registra contato |
| `DELETE` | `/api/leads/:id` | Exclui lead |
| `GET` | `/api/leads/recapture?days=30` | Leads para repescagem |

### Negociações
| Método | Endpoint | Descrição |
|---|---|---|
| `GET/POST/PUT` | `/api/leads/:leadId/negotiation` | CRUD da negociação ativa |
| `GET` | `/api/negotiations` | Lista geral |

### Vitrine de veículos (auth)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/vehicle-listings` | Lista (com filtro `?status=PENDING|APPROVED|REJECTED|SOLD` e `?mine=true`) |
| `POST` | `/api/vehicle-listings` | Cria publicação (`PENDING`) |
| `PATCH` | `/api/vehicle-listings/:id` | Edita |
| `PATCH` | `/api/vehicle-listings/:id/approve` | Aprovar (gerentes/admin) |
| `PATCH` | `/api/vehicle-listings/:id/reject` | Rejeitar com motivo |
| `PATCH` | `/api/vehicle-listings/:id/sold` | Marcar como vendido |
| `DELETE` | `/api/vehicle-listings/:id` | Excluir (apenas pending/rejected) |

### Usuários, equipes, dashboard, logs
| Método | Endpoint | Descrição |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/api/users` | Gestão de usuários (admin) |
| `GET/POST/PUT/DELETE` | `/api/teams` | Gestão de equipes (admin) |
| `GET` | `/api/dashboard/operacional` | Métricas operacionais |
| `GET` | `/api/dashboard/analitico` | Métricas analíticas |
| `GET` | `/api/logs` | Auditoria do sistema |
| `GET` | `/api/lead-sources` | Origens cadastradas |

Documentação detalhada: [`docs/api.md`](docs/api.md).

---

## Testes

### Backend (Jest)

```bash
docker compose exec backend npm test
```

14 arquivos de teste cobrindo: autenticação, validador de transição de estágio, RBAC do `LeadService`, recapture, escopo, dashboard TMA, logs CRUD, captação pública, ACL de rotas.

### Frontend (Vitest)

```bash
docker compose exec frontend npm test
```

8 arquivos · 54 testes cobrindo: filtros, adapter de leads, hook de kanban board, hook `useColumnLimit`, `OriginBadge`, `matchesTemperature`, serviços de API.

### Rodando localmente (sem Docker)

```bash
cd backend && npm install && npm test
cd ../frontend && npm install && npm test
```

---

## Comandos úteis

```bash
# Logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Subir só um serviço (após mudanças)
docker compose up --build -d backend

# Acessar shell do backend
docker compose exec backend sh

# Rodar Prisma manualmente
docker compose exec backend npx prisma migrate status
docker compose exec backend npx prisma studio       # abre em :5555

# Resetar o banco (apaga tudo, refaz migrations + seed)
docker compose down -v
docker compose up --build -d

# Conectar no Postgres pelo psql
docker compose exec postgres psql -U postgres -d valle_leads
```

---

## Troubleshooting

**`Port is already allocated` no startup**
Outro processo está usando 5173, 3000 ou 5433. Pare-o ou edite as portas no `.env` (`FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`).

**`npm ci` falha no build do backend com "package-lock out of sync"**
Alguém adicionou dependência sem atualizar o lock. Conserto:
```bash
cd backend && npm install --package-lock-only
docker compose up --build -d
```

**Backend reinicia em loop com erro de migration**
Provavelmente o banco está num estado divergente. Reset:
```bash
docker compose down -v && docker compose up --build -d
```

**Frontend mostra "Network Error" em todas as chamadas**
O backend não subiu. `docker compose logs backend` e procure o erro real. Causa comum: `JWT_SECRET` ausente ou `DATABASE_URL` apontando para `localhost` (deve ser `postgres`).

**Login retorna 401 com credenciais corretas**
O seed não rodou. Verifique:
```bash
docker compose exec postgres psql -U postgres -d valle_leads -c "SELECT COUNT(*) FROM \"user\";"
```
Se for 0, rode manualmente: `docker compose exec backend npx prisma db seed`.

**Erro 503 ao enviar formulário público de interesse**
Significa que não há atendente (`role=ATENDENTE`) cadastrado com `teamId` e `storeId`. O seed cria esse atendente, então rode o seed.

---

## Padrões adotados

**Boas práticas mantidas no código**
- Separação rígida de camadas (clean architecture) — sem `import` de baixo pra cima
- Repository pattern isolando Prisma do resto da aplicação
- Validação na camada de domínio (`validateStageTransition`), não em controllers
- Logs de auditoria centralizados em `LogService`
- Migrations versionadas (9 atualmente) e seed idempotente
- Erros tipados (`AppError`) tratados por middleware único
- Senhas hashadas com bcrypt (cost 10)
- JWT com `expiresIn` configurável
- RBAC aplicado no service (não no controller) — defesa em profundidade
- `.env.example` versionado; `.env` real fora do git

**Definition of Done** — uma feature só é aceita quando:
- [x] Regra de negócio implementada no backend (não só no frontend)
- [x] Dados persistidos corretamente
- [x] RBAC validado por perfil
- [x] Sem erros de console
- [x] `docker compose up --build` passa sem intervenção manual
- [x] Sem credenciais sensíveis no código

---

## Sprints

| Sprint | Período | Status |
|---|---|---|
| Sprint 1 | 24/03 → 14/04 | ✓ Concluída |
| Sprint 2 | 15/04 → 21/05 | ✓ Concluída |
| Sprint 3 | 22/05 → 11/06 | ✓ Concluída |
| Entrega final | Julho 2026 | — |

[▶️ Vídeo Sprint 1](https://youtu.be/JZl4LicdbPs?si=BHBxFvGHBrTLPN_v) · Backlog: [`docs/backlog/`](docs/backlog/) · Retros: [`docs/retrospectivas/`](docs/retrospectivas/)

---

## Time

| Função | Nome | Links |
|---|---|---|
| Product Owner | Pedro Claudino | [GitHub](https://github.com/PeClaudino2006) · [LinkedIn](https://br.linkedin.com/in/pedro-claudino-0566472b9) |
| Scrum Master | Manuela Castro | [GitHub](https://github.com/manuelalemes) · [LinkedIn](https://www.linkedin.com/in/manuela-lemes-castro) |
| Backend & Database | Gabrielly Neu | [GitHub](https://github.com/gabriellyneu) · [LinkedIn](https://www.linkedin.com/in/gabrielly-neu-753906239) |
| Backend Developer | Gabriel Teodoro | [GitHub](https://github.com/teodoroooo) · [LinkedIn](https://www.linkedin.com/in/gabrielteodoroo) |
| Frontend Developer | Alicia Dias | [GitHub](https://github.com/TIALICIA) · [LinkedIn](https://www.linkedin.com/in/alicia-silva-dias-656b2817a/) |
