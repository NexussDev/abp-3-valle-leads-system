# API Reference — 1000 Valle Leads System

Base URL: `http://localhost:3000`

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
{
  "email": "admin@1000valle.com",
  "password": "123456"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@1000valle.com",
    "role": "ADMIN"
  }
}
```

**Erros:** `401` credenciais inválidas.

---

## Leads

### GET /api/leads
Lista leads. Filtragem automática por role:
- `ATENDENTE` → apenas seus leads
- `GERENTE` → leads da sua equipe
- `GERENTE_GERAL` / `ADMIN` → todos

**Query params opcionais:** `status`, `userId`, `teamId`

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "phone": "(11) 91234-5678",
    "status": "NOVO",
    "origin": "Instagram",
    "closingReason": null,
    "userId": "uuid",
    "teamId": "uuid",
    "storeId": "uuid",
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
]
```

### GET /api/leads/:id
Retorna um lead pelo ID.

**Resposta 200:** objeto Lead completo.
**Erros:** `404` lead não encontrado.

### POST /api/leads
Cria um novo lead.

**Body:**
```json
{
  "name": "Maria Souza",
  "phone": "(12) 98765-4321",
  "origin": "WhatsApp",
  "userId": "uuid-do-atendente",
  "teamId": "uuid-da-equipe",
  "storeId": "uuid-da-loja"
}
```

**Resposta 201:** objeto Lead criado.

### PUT /api/leads/:id
Atualiza um lead (incluindo mudança de status/etapa no Kanban).

**Body (parcial):**
```json
{
  "status": "EM_NEGOCIACAO",
  "closingReason": "Comprou concorrente"
}
```

**Resposta 200:** objeto Lead atualizado.

### DELETE /api/leads/:id
Remove um lead.

**Resposta 204:** sem corpo.

---

## Negociação

> As negociações são um sub-recurso do Lead. A rota segue o padrão `/api/leads/:leadId/negotiation` em vez de `/negotiations` independente, pois uma negociação só existe no contexto de um lead específico e possui relacionamento 1:1 com ele.

### GET /api/leads/:leadId/negotiation
Retorna a negociação ativa de um lead.

**Resposta 200:**
```json
{
  "id": "uuid",
  "leadId": "uuid",
  "status": "EM_ANDAMENTO",
  "stage": "PROPOSTA",
  "importance": "ALTA",
  "active": true,
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

**Erros:** `404` negociação não encontrada.

### POST /api/leads/:leadId/negotiation
Cria uma negociação para o lead.

**Body:**
```json
{
  "status": "EM_ANDAMENTO",
  "stage": "PRIMEIRO_CONTATO",
  "importance": "MEDIA"
}
```

**Resposta 201:** objeto Negotiation criado.

### PUT /api/leads/:leadId/negotiation
Atualiza a negociação (avança etapa, altera importância).

**Body (parcial):**
```json
{
  "stage": "PROPOSTA",
  "importance": "ALTA"
}
```

**Resposta 200:** objeto Negotiation atualizado.

---

## Clientes

### GET /api/clients
Lista todos os clientes cadastrados.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Carlos Pereira",
    "cpf": "123.456.789-00",
    "email": "carlos@email.com",
    "phone": "(11) 91234-5678"
  }
]
```

### GET /api/clients/:id
Retorna um cliente pelo ID.

**Resposta 200:** objeto Client completo.
**Erros:** `404` cliente não encontrado.

### POST /api/clients
Cadastra um novo cliente.

**Body:**
```json
{
  "name": "Ana Lima",
  "cpf": "987.654.321-00",
  "email": "ana@email.com",
  "phone": "(12) 99999-0000"
}
```

**Resposta 201:** objeto Client criado.
**Erros:** `400` nome obrigatório, `409` CPF já cadastrado.

### PUT /api/clients/:id
Atualiza dados do cliente.

**Body (parcial):**
```json
{
  "phone": "(12) 98888-1111"
}
```

**Resposta 200:** objeto Client atualizado.

### DELETE /api/clients/:id
Remove um cliente. Requer role `ADMIN` ou `GERENTE_GERAL`.

**Resposta 204:** sem corpo.

---

## Equipes

### GET /api/teams
Lista todas as equipes com contagem de membros e leads.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Equipe Norte",
    "_count": { "users": 3, "leads": 47 }
  }
]
```

### GET /api/teams/:id
Retorna uma equipe com seus membros.

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "Equipe Norte",
  "users": [
    { "id": "uuid", "name": "João", "email": "joao@1000valle.com", "role": "ATENDENTE" }
  ]
}
```

**Erros:** `404` equipe não encontrada.

### POST /api/teams
Cria uma equipe. Requer role `ADMIN` ou `GERENTE_GERAL`.

**Body:**
```json
{
  "name": "Equipe Sul"
}
```

**Resposta 201:** objeto Team criado.
**Erros:** `400` nome obrigatório.

### PUT /api/teams/:id
Atualiza uma equipe. Requer role `ADMIN` ou `GERENTE_GERAL`.

**Body:**
```json
{
  "name": "Equipe Sul Expandida"
}
```

**Resposta 200:** objeto Team atualizado.

### DELETE /api/teams/:id
Remove uma equipe. Requer role `ADMIN`.

**Resposta 204:** sem corpo.

---

## Origens de Lead

### GET /api/lead-sources
Lista todas as origens cadastradas.

**Resposta 200:**
```json
[
  { "id": "uuid", "name": "Instagram" },
  { "id": "uuid", "name": "WhatsApp" }
]
```

### GET /api/lead-sources/:id
Retorna uma origem pelo ID.

### POST /api/lead-sources
Cria uma nova origem.

**Body:** `{ "name": "TikTok" }`
**Resposta 201:** objeto LeadSource criado.

### PUT /api/lead-sources/:id
Atualiza o nome de uma origem.

### DELETE /api/lead-sources/:id
Remove uma origem.

---

## Usuários

### GET /api/users
Lista todos os usuários. Requer role `ADMIN`.

**Resposta 200:**
```json
[
  { "id": "uuid", "name": "Admin", "email": "admin@1000valle.com", "role": "ADMIN", "teamId": null }
]
```

### GET /api/users/:id
Retorna um usuário. Requer role `ADMIN`.

### POST /api/users
Cria um novo colaborador. Requer role `ADMIN`.

**Body:**
```json
{
  "name": "Pedro Santos",
  "email": "pedro@1000valle.com",
  "password": "senhaSegura123",
  "role": "ATENDENTE",
  "teamId": "uuid-da-equipe"
}
```

**Resposta 201:** usuário sem campo `password`.
**Erros:** `409` email já em uso, `400` senha curta.

### PUT /api/users/:id
Atualiza um colaborador. Requer role `ADMIN`.

### DELETE /api/users/:id
Remove um colaborador. Requer role `ADMIN`.

### PUT /api/users/me
Atualiza o próprio perfil. Disponível para qualquer role autenticado.

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
Retorna métricas operacionais filtradas pela role do usuário autenticado.

- `ATENDENTE` → pipeline pessoal
- `GERENTE` → visão da equipe
- `GERENTE_GERAL` → visão global
- `ADMIN` → operacional completo

### GET /api/dashboard/analytics
Retorna dados analíticos para gráficos (conversão por etapa, leads por origem, etc.).

---

## Logs

### GET /api/logs
Lista logs de auditoria do sistema. Requer role `ADMIN`.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "action": "CREATE",
    "entity": "lead",
    "entityId": "uuid",
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
]
```

---

## Códigos de Erro Padrão

| Código | Significado |
|--------|-------------|
| 400 | Bad Request — dado inválido ou campo obrigatório ausente |
| 401 | Unauthorized — token ausente ou inválido |
| 403 | Forbidden — role sem permissão para esta ação |
| 404 | Not Found — recurso não encontrado |
| 409 | Conflict — recurso já existe (email, CPF duplicado) |
| 500 | Internal Server Error — erro inesperado no servidor |
