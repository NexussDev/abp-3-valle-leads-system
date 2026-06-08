# Padrões de Projeto — 1000 Valle Leads System

Este documento descreve os padrões de projeto (GoF e arquiteturais) aplicados no sistema, com localização no código e justificativa de uso.

---

## 1. Repository Pattern (GoF: Data Access Object)

**Categoria:** Padrão de Acesso a Dados  
**Classificação GoF:** Estrutural (variação de Facade)

### O que é
Separa a lógica de acesso ao banco de dados da lógica de negócio. Cada entidade de domínio tem um repositório dedicado que encapsula todas as queries Prisma/SQL.

### Onde está implementado

| Repositório | Arquivo |
|---|---|
| LeadRepository | `backend/src/infrastructure/repositories/LeadRepository.ts` |
| UserRepository | `backend/src/infrastructure/repositories/UserRepository.ts` |
| ClientRepository | `backend/src/infrastructure/repositories/ClientRepository.ts` |
| TeamRepository | `backend/src/infrastructure/repositories/TeamRepository.ts` |
| LeadSourceRepository | `backend/src/infrastructure/repositories/LeadSourceRepository.ts` |
| LogRepository | `backend/src/infrastructure/repositories/LogRepository.ts` |
| NegotiationRepository | `backend/src/infrastructure/repositories/NegotiationRepository.ts` |

### Exemplo
```typescript
// ClientRepository.ts
class ClientRepository {
  async findAll(): Promise<Client[]> {
    return prisma.client.findMany({ orderBy: { name: 'asc' } });
  }

  async findByCpf(cpf: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { cpf } });
  }
}
```

### Por que foi usado
- Isola o ORM (Prisma) em uma única camada — troca de banco não afeta services
- Facilita testes unitários com mock do repositório
- Mantém os services focados em regra de negócio, sem SQL inline

---

## 2. State Pattern (GoF: Comportamental)

**Categoria:** Padrão de Comportamento
**Classificação GoF:** Comportamental

### O que é

Permite que um objeto altere seu comportamento quando seu estado interno muda. No sistema, o ciclo de vida de um Lead segue uma máquina de estados com transições válidas definidas por regra de negócio.

### Onde está implementado

| Arquivo                                                | Responsabilidade                       |
| ------------------------------------------------------ | -------------------------------------- |
| `backend/src/domain/entities/LeadStage.ts`             | Define os estados válidos do Lead      |
| `backend/src/shared/validators/leadStageValidator.ts`  | Valida transições de estado permitidas |
| `frontend/src/pages/Leads/utils/leadStageValidator.ts` | Espelha as validações no frontend      |

### Estados do Lead

```
novo_lead → contato → proposta → negociacao → fechado
```

### Exemplo

```typescript
const STAGE_ORDER = [
  'novo_lead',
  'contato',
  'proposta',
  'negociacao',
  'fechado',
] as const;

export function validateStageMove(from: LeadStage, to: LeadStage) {
  const fromIdx = STAGE_ORDER.indexOf(from);
  const toIdx = STAGE_ORDER.indexOf(to);

  if (toIdx - fromIdx > 1) {
    throw new Error('Não é permitido pular etapas.');
  }

  if (toIdx < fromIdx) {
    throw new Error('Não é permitido retroceder etapas.');
  }

  return true;
}
```

### Por que foi usado

* Impede transições inválidas no Kanban.
* Garante integridade dos dados do funil de vendas.
* Centraliza as regras de mudança de estágio.
* Mantém frontend e backend sincronizados na validação dos estados.
* Facilita auditoria do histórico de negociações.


## 3. Service Layer Pattern (Camada de Serviço)

**Categoria:** Padrão Arquitetural  
**Classificação:** Domain-Driven Design / Clean Architecture

### O que é
Uma camada intermediária entre os controllers (HTTP) e os repositórios (banco). Concentra toda a lógica de negócio, validações e orquestração.

### Onde está implementado

| Service | Arquivo |
|---|---|
| LeadService | `backend/src/application/services/LeadService.ts` |
| UserService | `backend/src/application/services/UserService.ts` |
| ClientService | `backend/src/application/services/ClientService.ts` |
| TeamService | `backend/src/application/services/TeamService.ts` |
| DashboardService | `backend/src/application/services/DashboardService.ts` |
| NegotiationService | `backend/src/application/services/NegotiationService.ts` |
| LogService | `backend/src/application/services/LogService.ts` |

### Fluxo de uma requisição

```
HTTP Request
     ↓
Controller (valida params HTTP, chama service)
     ↓
Service (lógica de negócio, validações, orquestração)
     ↓
Repository (acesso ao banco via Prisma)
     ↓
PostgreSQL
```

### Exemplo
```typescript
// ClientService.ts
async create(data: { name: string; cpf?: string }): Promise<Client> {
  if (!data.name?.trim()) throw new AppError('Nome obrigatório', 400);

  if (data.cpf) {
    const existing = await clientRepository.findByCpf(data.cpf);
    if (existing) throw new AppError('CPF já cadastrado', 409);
  }

  return clientRepository.create({ name: data.name.trim(), cpf: data.cpf });
}
```

### Por que foi usado
- Controllers ficam magros — apenas orquestram HTTP in/out
- Lógica de negócio testável sem HTTP stack
- Reutilizável por múltiplos controllers (ex: mesma lógica de criação via API e via seed)

---

## 4. Middleware Chain Pattern (Chain of Responsibility)

**Categoria:** Padrão GoF Comportamental  
**Classificação GoF:** Chain of Responsibility

### O que é
Cada requisição HTTP passa por uma cadeia de middlewares em sequência. Cada elo da cadeia decide se processa, rejeita ou passa para o próximo.

### Onde está implementado

| Middleware | Arquivo | Responsabilidade |
|---|---|---|
| authMiddleware | `backend/src/infrastructure/middleware/authMiddleware.ts` | Valida JWT, injeta `req.user` |
| roleMiddleware | `backend/src/infrastructure/middleware/roleMiddleware.ts` | Verifica role do usuário autenticado |
| errorHandler | `backend/src/infrastructure/middleware/errorHandler.ts` | Captura todos os erros e formata resposta |

### Fluxo de autenticação + autorização

```
Request → authMiddleware → roleMiddleware → Controller → errorHandler (se erro)
```

### Exemplo
```typescript
// app.ts — todos os /api/* passam pelo authMiddleware
app.use('/api', authMiddleware, routes);

// userRoutes.ts — só ADMIN acessa
router.get('/', roleMiddleware('ADMIN'), userController.index);

// teamRoutes.ts — ADMIN e GERENTE_GERAL criam equipes
router.post('/', roleMiddleware('ADMIN', 'GERENTE_GERAL'), teamController.store);
```

### Por que foi usado
- Separação de responsabilidades: autenticação e autorização são concerns independentes
- Fácil de estender (adicionar rate limiting, logging, etc. sem alterar controllers)
- Padrão nativo do Express, familiar para toda a equipe

---

## 5. RBAC — Role-Based Access Control

**Categoria:** Padrão de Segurança  
**Classificação:** Não-GoF (padrão de controle de acesso)

### O que é
Controle de acesso baseado em papéis. Cada usuário tem uma `role` e o sistema filtra dados e ações com base nessa role.

### Roles implementadas

| Role | Permissões |
|---|---|
| `ATENDENTE` | Acessa apenas seus próprios leads |
| `GERENTE` | Acessa leads da sua equipe |
| `GERENTE_GERAL` | Acessa todos os leads e pode gerenciar equipes |
| `ADMIN` | Acesso total, incluindo logs e gestão de usuários |

### Onde está implementado

- **Backend:** `LeadService.ts` filtra por `userId` ou `teamId` via `req.user.role`
- **Frontend:** `DashboardService.ts` e componente `Dashboard.tsx` renderizam visão correspondente à role
- **JWT:** token carrega `{ id, role, teamId, storeId }` — role disponível em toda requisição sem hit no banco

### Por que foi usado
- Garante isolamento de dados entre atendentes concorrentes
- Requisito de negócio explícito da 1000 Valle (cada vendedor vê apenas seus leads)
- Implementado em duas camadas (backend + frontend) para UX consistente sem depender só do backend para ocultar dados

---

## Resumo

| Padrão | Classificação | Onde |
|---|---|---|
| Repository | Estrutural (DAL) | `infrastructure/repositories/` |
| State | Comportamental (GoF) | `domain/entities/LeadStage.ts`, `validators/leadStageValidator.ts` |
| Service Layer | Arquitetural | `application/services/` |
| Chain of Responsibility | Comportamental (GoF) | `infrastructure/middleware/` |
| RBAC | Segurança | `middleware/roleMiddleware.ts`, `services/LeadService.ts` |
