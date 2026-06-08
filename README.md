# ABP 3º DSM – Sistema de Gestão de Leads · 1000 Valle

Sistema desenvolvido para a disciplina de Aprendizagem Baseada em Projetos (ABP), com foco na gestão de leads comerciais e análise de desempenho por equipe.

---

## Sobre o Projeto

O Sistema de Gestão de Leads gerencia todo o ciclo de um cliente em potencial, desde a captação até a conversão em venda. A aplicação permite controle de leads, acompanhamento de negociações, organização por equipes e lojas, e análise de desempenho por meio de dashboards diferenciados por perfil de acesso.

**Parceiro:** 1000 Valle Automóveis  
**Período:** 2026-1  
**Metodologia:** Scrum com sprints de 3 semanas

---

## Funcionalidades

- Autenticação com e-mail e senha (JWT com expiração)
- Controle de acesso baseado em perfis (RBAC): Atendente, Líder de Equipe, Gerente, Admin
- Gestão de leads com Kanban (5 etapas com validação de transições)
- Gestão de clientes e associação com leads
- Controle de negociações vinculadas a leads
- Dashboards distintos por perfil de acesso
- Filtros por período, equipe e vendedor
- Registro de logs de acesso e operações
- Formulário público de captação de leads

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19.2.4 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Banco de dados | PostgreSQL 15 |
| ORM | Prisma |
| Autenticação | JWT (jsonwebtoken) |
| Containerização | Docker + Docker Compose |
| Gráficos | Recharts |

---

## Arquitetura

O backend segue **Clean Architecture** com separação em camadas:

```
presentation/     → Controllers e Routes (entrada/saída HTTP)
application/      → Services (regras de negócio)
infrastructure/   → Repositories, Middlewares, Database
domain/           → Entities e Interfaces
shared/           → Types, Utils, Errors
```

O frontend segue organização por responsabilidade:

```
pages/      → Páginas da aplicação
components/ → Componentes reutilizáveis
services/   → Chamadas à API
hooks/      → Lógica reutilizável
```

Padrões de projeto utilizados: **Repository**, **Service Layer**, **Middleware Chain**, **GoF State** (validação de transições de lead). Ver [docs/padroes-de-projeto.md](docs/padroes-de-projeto.md).

---

## Estrutura de Diretórios

```
abp-3-valle-leads-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Definição do banco
│   │   ├── migrations/          # Histórico de migrações
│   │   └── seed.ts              # Dados iniciais
│   └── src/
│       ├── application/services/  # Regras de negócio
│       ├── domain/                # Entidades e interfaces
│       ├── infrastructure/        # Repositories, middlewares
│       ├── presentation/          # Controllers e routes
│       └── shared/                # Types, utils, errors
├── frontend/
│   └── src/
│       ├── components/   # Componentes reutilizáveis
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Páginas (Dashboard, Leads, etc.)
│       └── services/     # Serviços de API
├── docs/
│   ├── backlog/          # Product Backlog e Sprint Backlogs
│   ├── diagramas/        # DER e diagramas UML
│   ├── retrospectivas/   # Retrospectivas por sprint
│   └── api.md            # Documentação dos endpoints
├── docker-compose.yml
└── README.md
```

---

## Como Executar (Docker — recomendado)

> Único requisito: **Docker Desktop** instalado e em execução.

```bash
# 1. Clonar o repositório
git clone https://github.com/NexussDev/abp-3-valle-leads-system.git
cd abp-3-valle-leads-system

# 2. Subir todos os containers
docker compose up --build
```

O comando sobe automaticamente:
- PostgreSQL (porta 5433)
- Backend com migrations aplicadas (porta 3000)
- Frontend (porta 5173)

> **Atenção:** o seed com dados iniciais **não é executado automaticamente** pelo Docker.
> Para popular o banco, execute manualmente após subir os containers:
> ```bash
> docker compose exec backend npx prisma db seed
> ```

**Acessar:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

> Não é necessário instalar Node.js, configurar banco ou rodar migrations manualmente.

---

## Contas de Teste

| E-mail | Senha | Perfil | Acesso |
|--------|-------|--------|--------|
| admin@1000valle.com | 123456 | Admin | Tudo |
| pedro@1000valle.com | 123456 | Líder de Equipe | Equipe Norte |
| maria@1000valle.com | 123456 | Gerente | Toda a loja |
| joao@1000valle.com | 123456 | Atendente | Seus leads |
| carlos@1000valle.com | 123456 | Atendente | Seus leads |

---

## Variáveis de Ambiente

As variáveis já estão configuradas no `docker-compose.yml` para execução local. Para execução manual (sem Docker):

**Backend** — criar `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:1234@localhost:5433/valle_leads
JWT_SECRET=segredo_super_forte
```

**Frontend** — criar `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Execução Manual (sem Docker)

```bash
# Terminal 1 — Banco de dados
docker compose up postgres

# Terminal 2 — Backend
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

---

## API REST

Documentação completa dos endpoints em [docs/api.md](docs/api.md).

**Base URL:** `http://localhost:3000`

| Prefixo | Descrição |
|---------|-----------|
| `POST /auth/login` | Autenticação |
| `GET/POST/PUT/DELETE /api/users` | Gestão de usuários |
| `GET/POST/PUT/DELETE /api/leads` | Gestão de leads |
| `GET/POST/PUT/DELETE /api/leads/:id/negotiation` | Negociações |
| `GET /api/dashboard`             | Dashboard operacional |
| `GET /api/dashboard/analytics`   | Dashboard analítico   |
| `GET /api/logs` | Logs do sistema |
| `GET /api/lead-sources` | Origens de leads |

Rotas protegidas exigem header: `Authorization: Bearer <token>`

---

## Definition of Done (DoD)

Uma tarefa é considerada concluída quando:

- [ ] Funcionalidade implementada e testável
- [ ] Regras de negócio aplicadas no backend (não só no frontend)
- [ ] Dados persistidos corretamente no banco
- [ ] RBAC aplicado — usuário acessa apenas o que tem permissão
- [ ] Sem erros de console no frontend
- [ ] Build Docker funcional (`docker compose up --build` sem erros)
- [ ] Código commitado na branch correspondente com mensagem descritiva
- [ ] Sem credenciais sensíveis expostas no código

---

## Planejamento de Sprints

| Sprint | Período | Status |
|--------|---------|--------|
| Sprint 1 | 24/03 → 14/04 | Concluída ✓ |
| Sprint 2 | 15/04 → 21/05 | Concluída ✓ |
| Sprint 3 | 22/05 → 11/06 | Em andamento |
| Entrega Final | Julho 2026 | — |

[▶️ Vídeo Sprint 1](https://youtu.be/JZl4LicdbPs?si=BHBxFvGHBrTLPN_v)

Backlog completo: [docs/backlog/](docs/backlog/)  
Retrospectivas: [docs/retrospectivas/](docs/retrospectivas/)

---

## Time de Desenvolvimento

| Função | Nome | Links |
|--------|------|-------|
| Product Owner | Pedro Claudino | [![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/PeClaudino2006) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://br.linkedin.com/in/pedro-claudino-0566472b9) |
| Scrum Master | Manuela Castro | [![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/manuelalemes) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/manuela-lemes-castro) |
| Backend & Database | Gabrielly Neu | [![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/gabriellyneu) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gabrielly-neu-753906239) |
| Backend Developer | Gabriel Teodoro | [![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/teodoroooo) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gabrielteodoroo) |
| Frontend Developer | Alicia Dias | [![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/TIALICIA) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alicia-silva-dias-656b2817a/) |

---

![Status](https://img.shields.io/badge/status-Sprint%202%20concluída-green)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)
