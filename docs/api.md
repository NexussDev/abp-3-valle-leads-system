# API Reference — 1000 Valle Leads System

**Base URL:** `http://localhost:3000`

Todos os endpoints sob `/api/*` exigem autenticação via header:
```
Authorization: Bearer <token>
```
O token é obtido via `POST /auth/login`.

---

## Autenticação

### POST /auth/login
Autentica um colaborador e retorna o JWT.

**Body:**
```json
{ "email": "admin@1000valle.com", "password": "123456" }
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "name": "Admin", "email": "admin@1000valle.com", "role": "ADMIN" }
}
```

**Erros:** `401` credenciais inválidas.

---

## Leads

### GET /api/leads
Lista leads com filtragem automática por role do usuário autenticado:
- `ATENDENTE` → apenas seus próprios leads
- `LIDER_EQUIPE` / `GERENTE` → leads da equipe vinculada
- `GERENTE_GERAL` / `ADMIN` → todos os leads

**Query params opcionais:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | string | Filtra por etapa do funil (`novo_lead`, `contato`, `proposta`, `negociacao`, `fechado`) |
| `userId` | UUID | Filtra por vendedor (só Admin/Gerente) |
| `teamId` | UUID | Filtra por equipe (só Admin/Gerente) |
| `startDate` | ISO 8601 | Data início do período (padrão: 30 dias atrás) |
| `endDate` | ISO 8601 | Data fim do período (padrão: hoje) |

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "phone": "(11) 91234-5678",
    "status": "novo_lead",
    "origin": "Instagram",
    "closingReason": null,
    "converted": false,
    "createdAt": "2026-05-01T10:00:00.000Z",
    "user":  { "id": "uuid", "name": "Carlos", "email": "carlos@1000valle.com", "role": "ATENDENTE" },
    "team":  { "id": "uuid", "name": "Equipe Norte" },
    "store": { "id": "uuid", "name": "Loja Centro" },
    "client": null
  }
]
```

**Erros:** `401` não autenticado, `403` sem permissão.

---

### GET /api/leads/:id
Retorna um lead pelo ID.

**Resposta 200:** objeto Lead completo (mesmo formato do array acima).

**Erros:** `404` lead não encontrado, `403` lead de outro scope.

---

### POST /api/leads
Cria um novo lead. O `userId`, `teamId` e `storeId` são derivados automaticamente da sessão autenticada — **não devem ser enviados no body.**

**Body:**
```json
{
  "name": "Maria Souza",
  "phone": "(12) 98765-4321",
  "origin": "WhatsApp"
}
```

**Resposta 201:** objeto Lead criado.

**Erros:** `422` usuário sem loja ou equipe configurada.

---

### PUT /api/leads/:id
Atualiza um lead. Usado para mudanças de etapa (Kanban), dados cadastrais e encerramento.

**Body (todos os campos opcionais):**
```json
{
  "status": "negociacao",
  "name": "Maria Souza Atualizada",
  "phone": "(12) 98765-0000",
  "origin": "Instagram",
  "closingReason": "Comprou veículo concorrente",
  "converted": false
}
```

> **Regra de transição:** as etapas seguem ordem sequencial obrigatória. Pular etapas retorna `400`.
> Sequência: `novo_lead → contato → proposta → negociacao → fechado`

**Resposta 200:** objeto Lead atualizado.

**Erros:** `400` transição inválida, `403` sem permissão, `404` lead não encontrado.

---

### DELETE /api/leads/:id
Remove um lead. Requer role `ADMIN` ou `GERENTE_GERAL`.

**Resposta 204:** sem corpo.

---

## Negociações

> Negociações são sub-recurso do Lead. Uma negociação tem relacionamento 1:1 com um lead.

### GET /api/leads/:leadId/negotiation
Retorna a negociação ativa do lead.

**Resposta 200:**
```json
{
  "id": "uuid",
  "leadId": "uuid",
  "status": "EM_ANDAMENTO",
  "stage": "PROPOSTA",
  "importance": "ALTA",
  "active": true,
  "createdAt": "2026-05-01T10:00:00.000Z",
  "history": [
    {
      "id": "uuid",
      "oldStatus": null,
      "newStatus": "EM_ANDAMENTO",
      "oldStage": null,
      "newStage": "PRIMEIRO_CONTATO",
      "changedAt": "2026-05-01T10:00:00.000Z"
    }
  ]
}
```

**Erros:** `404` negociação não encontrada.

### POST /api/leads/:leadId/negotiation
Cria uma negociação para o lead.

**Body:**
```json
{ "status": "EM_ANDAMENTO", "stage": "PRIMEIRO_CONTATO", "importance": "MEDIA" }
```

**Resposta 201:** objeto Negotiation criado.

### PUT /api/leads/:leadId/negotiation
Atualiza a negociação (avança etapa, altera importância).

**Body (parcial):**
```json
{ "stage": "PROPOSTA", "importance": "ALTA" }
```

**Resposta 200:** objeto Negotiation atualizado com histórico.

---

## Clientes

### GET /api/clients
Lista todos os clientes cadastrados.

**Resposta 200:**
```json
[{ "id": "uuid", "name": "Carlos Pereira", "cpf": "123.456.789-00", "email": "carlos@email.com", "phone": "(11) 91234-5678" }]
```

### GET /api/clients/:id
Retorna um cliente pelo ID. **Erros:** `404`.

### POST /api/clients
**Body:** `{ "name": "Ana Lima", "cpf": "987.654.321-00", "email": "ana@email.com", "phone": "(12) 99999-0000" }`
**Resposta 201.** **Erros:** `400` nome obrigatório, `409` CPF duplicado.

### PUT /api/clients/:id
**Body parcial.** **Resposta 200.**

### DELETE /api/clients/:id
Requer role `ADMIN` ou `GERENTE_GERAL`. **Resposta 204.**

---

## Equipes

### GET /api/teams
Lista equipes com contagem de membros e leads.

**Resposta 200:**
```json
[{ "id": "uuid", "name": "Equipe Norte", "_count": { "users": 3, "leads": 47 } }]
```

### GET /api/teams/:id
Retorna equipe com membros. **Erros:** `404`.

### POST /api/teams
Requer `ADMIN` ou `GERENTE_GERAL`. **Body:** `{ "name": "Equipe Sul" }` **Resposta 201.**

### PUT /api/teams/:id
Requer `ADMIN` ou `GERENTE_GERAL`. **Resposta 200.**

### DELETE /api/teams/:id
Requer `ADMIN`. **Resposta 204.**

---

## Origens de Lead

### GET /api/lead-sources
Lista origens cadastradas. **Resposta 200:** `[{ "id": "uuid", "name": "Instagram" }]`

### GET /api/lead-sources/:id
### POST /api/lead-sources — **Body:** `{ "name": "TikTok" }` **Resposta 201.**
### PUT /api/lead-sources/:id
### DELETE /api/lead-sources/:id

---

## Usuários

### GET /api/users
Requer `ADMIN`. Lista todos os colaboradores.

### GET /api/users/:id
Requer `ADMIN`.

### POST /api/users
Requer `ADMIN`.

**Body:**
```json
{
  "name": "Pedro Santos",
  "email": "pedro@1000valle.com",
  "password": "senhaSegura123",
  "role": "ATENDENTE",
  "teamId": "uuid-da-equipe",
  "storeId": "uuid-da-loja"
}
```

**Resposta 201:** usuário sem campo `password`. **Erros:** `409` email duplicado.

### PUT /api/users/:id
Requer `ADMIN`.

### DELETE /api/users/:id
Requer `ADMIN`.

### PUT /api/users/me
Disponível para qualquer role autenticado. Atualiza o próprio perfil.

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}
```

---

## Dashboard

### GET /api/dashboard
Métricas operacionais filtradas pela role:
- `ATENDENTE` → pipeline pessoal
- `GERENTE` / `LIDER_EQUIPE` → visão da equipe
- `GERENTE_GERAL` / `ADMIN` → visão global

**Query params opcionais:** `startDate`, `endDate` (ISO 8601)

### GET /api/dashboard/analytics
Dados analíticos para gráficos (conversão por etapa, leads por origem, performance por equipe).

**Query params opcionais:** `startDate`, `endDate`

---

## Formulário Público de Captação

### POST /public/lead
Endpoint sem autenticação para captura de leads via formulário externo (site/catálogo).

**Body:**
```json
{ "name": "Cliente Interessado", "phone": "(11) 91234-5678", "origin": "Site" }
```

**Resposta 201:** `{ "id": "uuid", "message": "Lead registrado com sucesso." }`

---

## Logs

### GET /api/logs
Requer `ADMIN`. Lista logs de auditoria.

**Resposta 200:**
```json
[{
  "id": "uuid",
  "userId": "uuid",
  "action": "CREATE",
  "entity": "Lead",
  "entityId": "uuid",
  "createdAt": "2026-05-01T10:00:00.000Z",
  "user": { "name": "Carlos", "email": "carlos@1000valle.com" }
}]
```

A�ões registradas: `CREATE`, `UPDATE`, `DELETE`.

---

## Códigos de Erro Padrão

| Código | Significado |
|--------|-------------|
| `400` | Bad Request — dado inválido ou campo obrigatório ausente |
| `401` | Unauthorized — token ausente, inválido ou expirado |
| `403` | Forbidden — role sem permissão para esta ação |
| `404` | Not Found — recurso não encontrado |
| `409` | Conflict — recurso já existe (email ou CPF duplicado) |
| `422` | Unprocessable Entity — dados válidos mas regra de negócio violada |
| `500` | Internal Server Error — erro inesperado no servidor |

**Formato padrão de erro:**
```json
{ "status": "error", "message": "Descrição do problema" }
```
