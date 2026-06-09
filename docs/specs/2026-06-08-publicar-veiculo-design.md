# Publicação de Veículos na Vitrine — Design

**Data:** 2026-06-08
**Sprint:** 3
**Status:** Aprovado

## Resumo

Atendentes e Líderes de Equipe poderão publicar veículos via `/publicar-veiculo`. As publicações entram em estado `PENDING` e precisam de aprovação por Gerente+ antes de aparecerem em `/catalogo` (atualmente hardcoded — será refatorado para consumir API pública). Inclui telas de moderação, "minhas publicações", e tela de logs ADMIN-only (endpoint backend já existe; frontend não).

## Decisões fechadas com o usuário

1. **Fluxo de aprovação obrigatório** (não publicação direta).
2. **Estender o model `Car`** (não criar `VehicleListing` separado).
3. **Dropdown FIPE em cascata** (marca → modelo → ano).
4. **LIDER_EQUIPE e GERENTE são escopados ao team** (consistente com `LeadService` existente).

## Modelo de dados

Migration `add_vehicle_listing_fields` adiciona ao model `Car`:

```prisma
model Car {
  // existentes
  id, brand, model, year, price, color, plate, leads...

  // novos — atributos de vitrine
  km             Int?
  fuel           String?  @db.VarChar(20)   // Flex, Gasolina, Diesel, Híbrido, Elétrico
  transmission   String?  @db.VarChar(20)   // Automático, Manual, CVT
  category       String?  @db.VarChar(20)   // suv, sedan, hatch, pickup
  description    String?  @db.Text
  photoUrl       String?  @db.VarChar(500)
  badge          String?  @db.VarChar(20)   // novo, destaque, oferta

  // novos — controle de publicação
  listingStatus    String?   @map("listing_status") @db.VarChar(20)
  publishedById    String?   @map("published_by_id") @db.Uuid
  publishedTeamId  String?   @map("published_team_id") @db.Uuid
  publishedAt      DateTime? @map("published_at") @db.Timestamp(6)
  approvedById     String?   @map("approved_by_id") @db.Uuid
  approvedAt       DateTime? @map("approved_at") @db.Timestamp(6)
  rejectionReason  String?   @map("rejection_reason") @db.VarChar(255)

  publishedBy   User? @relation("CarPublishedBy", fields: [publishedById], references: [id])
  approvedBy    User? @relation("CarApprovedBy",  fields: [approvedById],  references: [id])
  publishedTeam Team? @relation(fields: [publishedTeamId], references: [id])

  @@index([listingStatus],   map: "idx_car_listing_status")
  @@index([publishedTeamId], map: "idx_car_published_team_id")
}
```

Regras de `listingStatus`:

- `null` → registro interno (Car ligado a Lead). Catálogo ignora.
- `PENDING` → criado por usuário, aguardando moderação.
- `APPROVED` → aparece em `/catalogo` público.
- `REJECTED` → `rejectionReason` populado; autor vê o motivo e pode reenviar.
- `SOLD` → fechou venda, removido da vitrine pública, mantém histórico.

## RBAC

| Ação | ATENDENTE | LIDER_EQUIPE | GERENTE | GERENTE_GERAL | ADMIN |
|---|---|---|---|---|---|
| Criar (PENDING) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Listar / ver detalhe | próprias | próprias + equipe | próprias + equipe | todas | todas |
| Aprovar / rejeitar / sold | ❌ | ❌ | ✅ (equipe) | ✅ (todas) | ✅ (todas) |
| Editar/deletar própria (PENDING/REJECTED) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar/deletar alheia | ❌ | ❌ | ✅ (equipe) | ✅ (todas) | ✅ (todas) |
| Catálogo público | público | público | público | público | público |

`assertCanAccess` no service espelha `LeadService.assertCanAccessLead`. Escopo de team via `publishedTeamId` capturado do `publishedBy.teamId` no momento da criação.

Após `APPROVED`, autor perde permissão de editar — só Gerente+. Evita mudar preço de oferta já anunciada.

## Endpoints

```
POST   /api/vehicle-listings                auth, qualquer role     → cria PENDING
GET    /api/vehicle-listings                auth                    → lista filtrável (status, mine, marca, categoria)
GET    /api/vehicle-listings/:id            auth + scope            → detalhe
PATCH  /api/vehicle-listings/:id            auth (autor-se-pendente | gerente+) → editar
DELETE /api/vehicle-listings/:id            auth (autor-se-pendente | gerente+) → soft delete (ARCHIVED) ou hard (PENDING)
PATCH  /api/vehicle-listings/:id/approve    gerente+                → APPROVED
PATCH  /api/vehicle-listings/:id/reject     gerente+, body { reason } → REJECTED
PATCH  /api/vehicle-listings/:id/sold       gerente+                → SOLD

GET    /api/public/catalog                  sem auth                → APPROVED only, DTO sem campos sensíveis
GET    /api/public/catalog/:id              sem auth                → detalhe público
```

Camadas (segue Clean Architecture do projeto):
- `infrastructure/repositories/VehicleListingRepository.ts`
- `application/services/VehicleListingService.ts`
- `presentation/controllers/VehicleListingController.ts`
- `presentation/controllers/PublicCatalogController.ts`
- `presentation/routes/vehicleListingRoutes.ts`
- Rotas públicas via `presentation/routes/publicRoutes.ts` (já existe)

### Validação de transição

Pattern espelha `domain/entities/LeadStage.ts`:

- `PENDING → APPROVED | REJECTED | (deletado)`
- `APPROVED → SOLD | (gerente edita)`
- `REJECTED → PENDING` (reenvio após editar)
- `SOLD` → terminal

### Concorrência

Toda transição roda como `prisma.car.updateMany({ where: { id, listingStatus: <esperado> }, data: {...} })`. `count: 0` → 409 Conflict.

## Frontend

### Rotas novas (`frontend/src/routes/index.tsx`)

```tsx
<Route path="/publicar-veiculo"   element={<Layout><PublicarVeiculo /></Layout>} />
<Route path="/minhas-publicacoes" element={<Layout><MinhasPublicacoes /></Layout>} />
<Route path="/moderar-vitrine"    element={<Layout><ModerarVitrine /></Layout>} />
<Route path="/logs"               element={<Layout><Logs /></Layout>} />
```

Role gating cosmético dentro de cada página + via `allowedRoles` na Sidebar. Backend é a fonte de verdade.

### Sidebar — itens novos

```tsx
{ path: '/publicar-veiculo', label: 'Publicar Veículo',
  allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'] }
{ path: '/moderar-vitrine',  label: 'Moderar Vitrine',
  allowedRoles: ['GERENTE', 'GERENTE_GERAL', 'ADMIN'] }
{ path: '/logs',             label: 'Logs',
  allowedRoles: ['ADMIN'] }
```

`/minhas-publicacoes` acessada via link no header do `/publicar-veiculo` — não polui sidebar.

### Telas

**`pages/PublicarVeiculo/PublicarVeiculo.tsx`**
- 3 seções: Identificação (FIPE cascata: marca → modelo → ano, cor, categoria) · Especificações (km, preço pré-preenchido com `lookupFipe()`, combustível, câmbio) · Descrição (textarea + badge).
- Preview ao vivo lateral usando `cat-card` do catálogo, foto via `carPhotoPexels()`.
- Submit → `POST /api/vehicle-listings` → toast "Enviado para aprovação" → redirect `/minhas-publicacoes`.

**`pages/MinhasPublicacoes/MinhasPublicacoes.tsx`**
- Lista (`GET /api/vehicle-listings?mine=true`), filtros por status.
- Cards mostram badge de status; REJECTED mostra `rejectionReason` + botão "Editar e reenviar".

**`pages/ModerarVitrine/ModerarVitrine.tsx`** (Gerente+)
- Tabs por status. Pendentes com botões Aprovar / Rejeitar (modal pede motivo).

**`pages/Catalogo/Catalogo.tsx`** (refactor)
- Remove array hardcoded. `useEffect` busca `GET /api/public/catalog`.
- Loading skeleton + empty state. Fallback de foto: `photoUrl` do banco → Pexels → SVG.

**`pages/Logs/Logs.tsx`** (ADMIN)
- Tabela paginada (server-side via `limit`/`offset`). Filtros: action, userId, date range, entityId.
- Reuso visual: padrão de tabela do `Users/Users.tsx`.

### Serviços

- `services/vehicleListings.ts`: `create`, `list`, `getMine`, `getById`, `update`, `approve`, `reject`, `markSold`, `remove`.
- `services/publicCatalog.ts`: `getAll`, `getById` (sem `Authorization`).
- `services/logs.ts`: `list({ action?, userId?, startDate?, endDate?, limit, offset })`.

## Validação

| Campo | Regra |
|---|---|
| `brand`, `model` | 1–50 chars, obrigatórios |
| `year` | int, 1990 ≤ y ≤ ano atual + 1 |
| `price` | decimal > 0, ≤ 9.999.999,99 |
| `km` | int, 0 ≤ km ≤ 999.999 |
| `category` | `suv \| sedan \| hatch \| pickup` |
| `fuel` | `Flex \| Gasolina \| Diesel \| Híbrido \| Elétrico` |
| `transmission` | `Automático \| Manual \| CVT` |
| `badge` | opcional: `novo \| destaque \| oferta` |
| `description` | ≤ 500 chars, escape automático no render |
| `photoUrl` | regex `^https://`, opcional |
| `rejectionReason` (reject) | 1–255 chars, obrigatório |

## Edge cases

- **FIPE indisponível** — formulário mostra erro inline + botão recarregar. `lookupFipe()` falhando deixa preço vazio (preenchimento manual). Publicação não depende de FIPE.
- **Pexels indisponível** — `photoUrl: null`, catálogo mostra SVG fallback.
- **Race de moderação** — `updateMany` com guarda de status no `WHERE` → 409.
- **Spam** — máx 10 PENDING simultâneas por usuário → 429.
- **Cache do catálogo público** — `Cache-Control: public, max-age=60`.
- **Estado errado** — 403 com mensagem clara: "Publicações aprovadas só podem ser editadas pelo gerente".

## Segurança

- Todas as rotas autenticadas via `authMiddleware` existente; moderação via `roleMiddleware`.
- `description` rendered as text (escape automático React).
- `photoUrl` valida regex `^https://`.
- Rota pública retorna DTO sem `publishedById`, `approvedById`, `rejectionReason`.

## Auditoria

Todo CREATE/UPDATE/APPROVE/REJECT/SOLD/DELETE grava `SystemLog` com `entity: 'VEHICLE_LISTING'`. ADMIN visualiza na nova tela `/logs`.

## Testes

**Backend:**
- `VehicleListingService.rbac.test.ts` — matriz role × ação × scope
- `VehicleListingService.transitions.test.ts` — válidas e inválidas
- `VehicleListingService.concurrency.test.ts` — guard 409
- `VehicleListingController.test.ts` — happy path + validação
- `PublicCatalogController.test.ts` — só APPROVED, DTO seguro, sem auth
- `VehicleListingLogging.test.ts` — `SystemLog` em todas as transições

**Frontend:**
- `PublicarVeiculo.test.tsx`, `MinhasPublicacoes.test.tsx`, `ModerarVitrine.test.tsx`, `Catalogo.test.tsx`, `Logs.test.tsx`

**Smoke manual:**
1. ATENDENTE publica → vê PENDING em "Minhas publicações".
2. GERENTE da mesma equipe aprova.
3. `/catalogo` anônimo mostra o veículo.
4. LIDER_EQUIPE vê publicações de toda a equipe; outro time não vê.
5. ADMIN em `/logs` vê eventos `CREATE` e `APPROVE` de `VEHICLE_LISTING`.

## Plano de build (ordem de commits)

1. Backend — schema & migration `add_vehicle_listing_fields`
2. Backend — repository + helpers de transição
3. Backend — service (RBAC + transições + logs) + testes
4. Backend — controller + routes (privadas e públicas) + testes
5. Frontend — services + types
6. Frontend — refactor Catalogo consumindo API pública
7. Frontend — PublicarVeiculo (FIPE cascata + preview)
8. Frontend — MinhasPublicacoes
9. Frontend — ModerarVitrine
10. Frontend — Logs (ADMIN)
11. Sidebar + rotas
12. QA + responsividade + ajustes finos
