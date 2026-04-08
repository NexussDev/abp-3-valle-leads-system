# 🗺️ GUIA COMPLETO — Backend ABP: Sistema de Gestão de Leads

> **Autor:** Gerado como material de apoio para o time de backend  
> **Projeto:** ABP 2026-1 — 1000 Valle Multimarcas  
> **Stack:** Node.js + TypeScript + Express + PostgreSQL + Docker  
> **Período:** Sprint 1 (24/03 a 14/04/2026)

---

## ÍNDICE

1. [Visão Geral do que Vamos Construir](#1-visão-geral)
2. [Conceitos Fundamentais que Você Precisa Entender](#2-conceitos-fundamentais)
3. [Estratégia de Git e Branches](#3-estratégia-de-git-e-branches)
4. [TASK 1 — Criar Estrutura do Backend (4 abril)](#4-task-1--criar-estrutura-do-backend)
5. [TASK 2 — Configurar Express (4 abril)](#5-task-2--configurar-express)
6. [TASK 3 — Estrutura de Pastas Controller/Service (4 abril)](#6-task-3--estrutura-de-pastas)
7. [TASK 4 — Dockerfile do Backend (6 abril)](#7-task-4--dockerfile-do-backend)
8. [TASK 5 — CRUD Básico Users + Leads (7 abril)](#8-task-5--crud-básico)
9. [TASK 6 — Dockerfile do Frontend (8 abril)](#9-task-6--dockerfile-do-frontend)
10. [TASK 7 — Autenticação JWT (10 abril)](#10-task-7--autenticação-jwt)
11. [TASK 8 — Middleware RBAC (12 abril)](#11-task-8--middleware-rbac)
12. [TASK 9 — Sistema Rodando via Docker (12 abril)](#12-task-9--docker-compose-completo)
13. [Padrões de Projeto (GoF) — O que Usar e Onde](#13-padrões-de-projeto-gof)
14. [Checklist Final da Sprint 1](#14-checklist-final)

---

## 1. VISÃO GERAL

### O que é o sistema?

Um CRM (Customer Relationship Management) simplificado para uma revendedora de veículos. Quando alguém demonstra interesse em comprar um carro — seja pelo WhatsApp, por visita na loja, por Instagram — isso vira um **Lead**. O sistema gerencia esses leads desde o primeiro contato até a venda (ou desistência).

### O que o backend faz?

O backend é o **cérebro** do sistema. Ele:

- **Recebe requisições** do frontend (ex: "crie um novo lead")
- **Valida dados** (ex: "esse email é válido?")
- **Aplica regras de negócio** (ex: "esse atendente pode ver esse lead?")
- **Persiste dados** no banco PostgreSQL
- **Retorna respostas** formatadas em JSON

### Arquitetura que vamos seguir

O documento exige **padrão arquitetural reconhecido**. Vamos usar **Clean Architecture simplificada** com **camadas bem definidas**:

```
Requisição HTTP
    ↓
[Controller] → Recebe a requisição, valida entrada básica
    ↓
[Service]    → Aplica regras de negócio
    ↓
[Repository] → Acessa o banco de dados
    ↓
[Entity]     → Representa os dados (modelo de domínio)
```

**Por que essa arquitetura?**

- Atende RNF01 (API REST estruturada), RNF11 (padrão arquitetural), RNF12 (camadas) e RNF13 (SRP)
- É a mais comum no mercado para APIs Node.js
- Facilita testes: você pode testar o Service sem precisar do banco
- Facilita trabalho em equipe: cada pessoa pode trabalhar numa camada diferente

---

## 2. CONCEITOS FUNDAMENTAIS

Antes de codar, você precisa entender estes conceitos. Leia com calma — isso vai te economizar horas de debug.

### 2.1 O que é TypeScript e por que usar?

TypeScript é JavaScript com **tipos**. Imagine que JavaScript é como falar sem regras gramaticais — funciona, mas às vezes causa mal-entendidos. TypeScript adiciona as regras.

```typescript
// JavaScript - funciona, mas pode dar problema:
function somar(a, b) {
  return a + b;
}
somar("5", 3); // Retorna "53" (string!) - bug silencioso

// TypeScript - te avisa ANTES de rodar:
function somar(a: number, b: number): number {
  return a + b;
}
somar("5", 3); // ERRO em tempo de compilação! Você corrige antes.
```

**Termos importantes:**
- **Compilação:** TypeScript NÃO roda direto no Node.js. Ele precisa ser **transpilado** (convertido) para JavaScript. O `tsc` (TypeScript Compiler) faz isso.
- **tsconfig.json:** Arquivo de configuração que diz ao compilador COMO converter. Ex: pra qual versão do JS, onde salvar os arquivos compilados, etc.
- **Tipagem:** Definir que tipo de dado uma variável/parâmetro aceita (`string`, `number`, `boolean`, interfaces customizadas, etc.)

### 2.2 O que é Express?

Express é um **framework web** para Node.js. Ele facilita a criação de servidores HTTP. Sem Express, você teria que lidar manualmente com parsing de URL, headers, body da requisição, etc.

**Conceitos do Express:**
- **Rota (Route):** Um caminho + método HTTP. Ex: `GET /api/users`, `POST /api/leads`
- **Middleware:** Função que roda ANTES da rota. Exemplo: verificar se o usuário está logado antes de deixar ele acessar `/api/leads`
- **Request (req):** Objeto com dados da requisição (body, params, headers)
- **Response (res):** Objeto para enviar resposta ao cliente

```
Cliente faz POST /api/leads com body { nome: "João" }
    ↓
Express recebe
    ↓
Middleware 1: verifyToken() → Token válido? Continua. Inválido? Retorna 401.
    ↓
Middleware 2: checkRole("atendente") → Tem permissão? Continua. Não? Retorna 403.
    ↓
Controller: leadController.create() → Processa e retorna 201 Created
```

### 2.3 O que é uma API REST?

REST (Representational State Transfer) é um **estilo de arquitetura** para APIs. Regras principais:

| Método HTTP | Ação      | Exemplo                  | O que faz                    |
|-------------|-----------|--------------------------|------------------------------|
| GET         | Ler       | `GET /api/users`         | Lista todos os usuários      |
| GET         | Ler um    | `GET /api/users/5`       | Retorna o usuário com id=5   |
| POST        | Criar     | `POST /api/users`        | Cria um novo usuário         |
| PUT         | Atualizar | `PUT /api/users/5`       | Atualiza o usuário id=5      |
| DELETE      | Excluir   | `DELETE /api/users/5`    | Remove o usuário id=5        |

**Status codes importantes:**
- `200 OK` — Deu certo
- `201 Created` — Criou com sucesso
- `400 Bad Request` — Dados inválidos
- `401 Unauthorized` — Não autenticado (sem token / token inválido)
- `403 Forbidden` — Autenticado mas sem permissão
- `404 Not Found` — Recurso não existe
- `500 Internal Server Error` — Erro no servidor

### 2.4 O que é JWT?

JWT (JSON Web Token) é um **padrão para autenticação**. Funciona assim:

```
1. Usuário faz login com email + senha
2. Backend verifica se está correto
3. Backend gera um TOKEN (string longa codificada)
4. Frontend armazena esse token
5. Em toda requisição, frontend envia o token no header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
6. Backend decodifica o token e sabe QUEM é o usuário e QUAL o papel dele
```

Um JWT tem 3 partes separadas por ponto:
- **Header** — Tipo do token e algoritmo
- **Payload** — Dados (id do usuário, role, expiração)
- **Signature** — Assinatura com chave secreta (garante que ninguém alterou)

### 2.5 O que é RBAC?

RBAC (Role-Based Access Control) significa controlar o que cada usuário pode fazer baseado no seu **papel (role)**. No nosso sistema:

| Role            | O que pode fazer                                    |
|-----------------|-----------------------------------------------------|
| Atendente       | CRUD nos próprios leads, ver só os seus              |
| Gerente         | Ver leads da equipe, dashboard da equipe             |
| Gerente Geral   | Ver tudo (somente leitura), dashboard global         |
| Administrador   | CRUD em tudo, ver logs                               |

### 2.6 O que é Docker?

Docker cria **containers** — ambientes isolados que empacotam seu app com tudo que ele precisa para rodar. Pense assim:

- **Sem Docker:** "Funciona na minha máquina" → professor/colega instala Node versão diferente → não funciona
- **Com Docker:** Você define EXATAMENTE o que precisa num arquivo → qualquer pessoa roda com um comando

**Termos:**
- **Dockerfile:** Receita para criar uma **image** (modelo do container)
- **Image:** Template pronto. Como um `.iso` de um sistema operacional
- **Container:** Instância rodando de uma image. Como uma VM leve
- **Docker Compose:** Orquestrador. Define MÚLTIPLOS containers e como eles se comunicam
- **Volume:** Pasta compartilhada entre host e container (para persistir dados)

### 2.7 O que é ORM e por que escolher Prisma?

ORM (Object-Relational Mapping) traduz entre **objetos** do código e **tabelas** do banco.

**Sem ORM (SQL puro):**
```typescript
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1', [email]
);
```

**Com Prisma (ORM):**
```typescript
const user = await prisma.user.findUnique({
  where: { email }
});
```

**Por que Prisma?**
- Gera tipos TypeScript automaticamente (tipagem segura)
- Migrations automáticas (cria/altera tabelas via código)
- Gera o DDL que o documento pede (RP03)
- Mais moderno e com melhor DX (Developer Experience) que TypeORM
- Comunidade grande, boa documentação

> **NOTA:** O documento exige "uso explícito de DDL e DML" (RP03). O Prisma gera os arquivos de migration em SQL puro — o que atende ao requisito. Guarde esses arquivos `.sql` para a documentação.

---

## 3. ESTRATÉGIA DE GIT E BRANCHES

### 3.1 Fluxo de branches recomendado

Para um projeto acadêmico em equipe, usaremos o **Git Flow simplificado**:

```
main ─────────────────────────────────────────────── (produção, sempre estável)
  │
  └── develop ────────────────────────────────────── (integração do time)
        │
        ├── feature/setup-backend ────────────────── (tasks 1, 2, 3)
        │
        ├── feature/docker-config ────────────────── (tasks 4, 6, 9)
        │
        ├── feature/crud-users-leads ─────────────── (task 5)
        │
        ├── feature/auth-jwt ─────────────────────── (task 7)
        │
        └── feature/rbac-middleware ───────────────── (task 8)
```

**Por que separar assim?**
- Tasks 1, 2, 3 são todas sobre a fundação do projeto — faz sentido juntar
- Tasks 4, 6, 9 são todas sobre Docker — mesma branch
- Tasks 5, 7, 8 são features independentes — branches próprias

### 3.2 Comandos Git que você vai usar

**ANTES DE TUDO — Configuração inicial (uma vez só):**

```bash
# Configura seu nome e email (aparece nos commits)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# (Opcional) Define o editor padrão
git config --global core.editor "code --wait"   # VS Code
```

**Criando o repositório (quem criar no time faz isso):**

```bash
# 1. Crie o repositório no GitHub (interface web)
#    Nome sugerido: abp-lead-management
#    Visibilidade: Public (RNF09 exige)
#    Marque "Add README"
#    Adicione .gitignore para Node

# 2. Clone na sua máquina
git clone https://github.com/seu-time/abp-lead-management.git
cd abp-lead-management

# 3. Crie a branch develop a partir da main
git checkout -b develop
git push -u origin develop
```

**Fluxo diário de trabalho:**

```bash
# 1. SEMPRE comece atualizando develop
git checkout develop
git pull origin develop

# 2. Crie sua branch de feature (ou entre nela se já existe)
git checkout -b feature/setup-backend    # cria nova branch
# ou
git checkout feature/setup-backend       # entra na existente

# 3. Trabalhe, faça commits frequentes e descritivos (RNF09)
git add .
git commit -m "feat: inicializar projeto Node.js com TypeScript"

# 4. Subiu pro GitHub regularmente
git push origin feature/setup-backend

# 5. Quando terminar a feature, faça merge na develop
git checkout develop
git pull origin develop                 # pega atualizações do time
git merge feature/setup-backend         # traz suas mudanças
git push origin develop

# 6. Se der conflito no merge:
#    - O Git vai marcar os arquivos com conflito
#    - Abra cada arquivo, resolva manualmente
#    - git add <arquivo-resolvido>
#    - git commit (sem mensagem, ele cria automaticamente)
```

### 3.3 Padrão de mensagens de commit

Use **Conventional Commits** — é profissional e o professor vai gostar:

```
feat: adicionar endpoint de criação de leads
fix: corrigir validação de email no login
docs: adicionar documentação das rotas de auth
refactor: extrair lógica de validação para utils
chore: atualizar dependências do backend
style: formatar código com prettier
test: adicionar testes para UserService
```

**Formato:** `tipo: descrição curta em português (letras minúsculas, sem ponto final)`

---

## 4. TASK 1 — CRIAR ESTRUTURA DO BACKEND

> **Deadline:** 4 de abril  
> **Branch:** `feature/setup-backend`  
> **Objetivo:** Ter um projeto Node.js + TypeScript funcional

### 4.1 O que você vai fazer

Inicializar um projeto Node.js com TypeScript configurado corretamente.

### 4.2 Passo a passo

**PASSO 1 — Crie a pasta do backend dentro do repositório:**

```bash
cd abp-lead-management
mkdir backend
cd backend
```

> **Por que uma pasta `backend/`?** Porque o frontend vai ficar em `frontend/` no mesmo repositório. Isso é um **monorepo** — tudo num lugar só. Facilita o Docker Compose depois.

**PASSO 2 — Inicialize o projeto Node.js:**

```bash
npm init -y
```

**O que acontece:** Cria o arquivo `package.json`. Esse arquivo é o "RG" do seu projeto — lista nome, versão, dependências e scripts.

**PASSO 3 — Instale o TypeScript e configurações:**

```bash
# Dependências de DESENVOLVIMENTO (só usadas durante dev, não vão pro deploy)
npm install --save-dev typescript @types/node ts-node-dev
```

**O que cada pacote faz:**
- `typescript` — O compilador TypeScript em si
- `@types/node` — Definições de tipo para APIs do Node.js (fs, path, etc.)
- `ts-node-dev` — Roda TypeScript direto sem compilar manualmente + auto-restart quando você salva

> **`--save-dev` vs `--save`:**
> - `--save-dev` (ou `-D`): Dependência de desenvolvimento. Não vai pro container final. Ex: TypeScript, ESLint
> - `--save` (padrão, pode omitir): Dependência de produção. Vai pro container. Ex: Express, Prisma

**PASSO 4 — Configure o TypeScript:**

Crie o arquivo `tsconfig.json` na pasta `backend/`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Explicação de CADA campo (leia, é importante entender):**

| Campo | Valor | Por que |
|-------|-------|---------|
| `target` | `ES2020` | Compila pra JavaScript moderno. Node 18+ suporta ES2020 |
| `module` | `commonjs` | Sistema de módulos do Node.js (`require/module.exports`) |
| `outDir` | `./dist` | Onde ficam os arquivos JS compilados |
| `rootDir` | `./src` | Onde ficam seus arquivos TypeScript fonte |
| `strict` | `true` | Ativa TODAS as verificações rigorosas. É chato no começo mas evita bugs |
| `esModuleInterop` | `true` | Permite `import express from 'express'` ao invés de `import * as express` |
| `skipLibCheck` | `true` | Não verifica tipos de node_modules (mais rápido) |
| `sourceMap` | `true` | Gera mapas para debug — você vê erro no .ts, não no .js compilado |
| `paths` | `@/*` | Alias de importação. `import { x } from '@/services/UserService'` ao invés de `'../../../services/UserService'` |

**PASSO 5 — Crie a estrutura de pastas inicial:**

```bash
mkdir -p src
```

**PASSO 6 — Crie o arquivo de entrada:**

Crie `src/server.ts`:

```typescript
console.log("Backend ABP - Lead Management System");
console.log("Servidor será configurado na próxima task!");
```

**PASSO 7 — Configure os scripts no package.json:**

Abra `package.json` e substitua a seção `"scripts"` por:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only --ignore-watch node_modules src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint src --ext .ts"
}
```

**O que cada script faz:**
- `npm run dev` — Roda o servidor em modo dev (auto-restart ao salvar)
- `npm run build` — Compila TypeScript → JavaScript
- `npm start` — Roda o JavaScript compilado (produção)
- `npm run lint` — Verifica estilo do código

> **Flags do ts-node-dev:**
> - `--respawn` — Reinicia quando detecta mudança
> - `--transpile-only` — Só transpila, não verifica tipos (mais rápido pra dev)
> - `--ignore-watch node_modules` — Não monitora a pasta node_modules

**PASSO 8 — Teste:**

```bash
npm run dev
```

Deve imprimir as mensagens do `console.log` no terminal. Se funcionar, a base está pronta!

**PASSO 9 — Crie o `.gitignore` na pasta backend:**

```
node_modules/
dist/
.env
*.js.map
```

**PASSO 10 — Commit:**

```bash
cd ..  # volta pra raiz do repositório
git add backend/
git commit -m "feat: inicializar projeto backend com Node.js e TypeScript"
git push origin feature/setup-backend
```

### 4.3 Resultado esperado

```
abp-lead-management/
├── backend/
│   ├── node_modules/         (ignorado pelo git)
│   ├── src/
│   │   └── server.ts
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
└── README.md
```

---

## 5. TASK 2 — CONFIGURAR EXPRESS

> **Deadline:** 4 de abril  
> **Branch:** `feature/setup-backend` (continua)  
> **Objetivo:** Servidor Express rodando e respondendo requisições

### 5.1 Instale as dependências

```bash
cd backend

# Dependência de produção
npm install express dotenv cors

# Tipos para TypeScript (desenvolvimento)
npm install --save-dev @types/express @types/cors
```

**O que cada pacote faz:**
- `express` — Framework web (o servidor em si)
- `dotenv` — Carrega variáveis de ambiente de um arquivo `.env` (RNF02 exige)
- `cors` — Permite que o frontend (outro domínio) acesse a API
- `@types/express` e `@types/cors` — Tipos TypeScript para esses pacotes

### 5.2 Crie o arquivo de variáveis de ambiente

Crie `.env` na pasta `backend/`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-aqui-trocar-em-producao
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/abp_leads
```

> **IMPORTANTE:** O `.env` já está no `.gitignore`. NUNCA suba ele pro GitHub.  
> Crie um `.env.example` com os mesmos campos mas valores fictícios — esse sim vai pro git.

Crie `.env.example`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### 5.3 Crie a estrutura do app Express

**Conceito importante: separar `app` de `server`**

Vamos separar a configuração do Express (middlewares, rotas) da inicialização do servidor (listen na porta). Por quê? Porque na hora de testar, você importa só o `app` sem levantar o servidor.

Crie `src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';

// Cria a instância do Express
const app = express();

// --- MIDDLEWARES GLOBAIS ---

// Permite que o frontend (rodando em outro domínio/porta) acesse a API
app.use(cors());

// Faz o Express entender JSON no body das requisições
// Sem isso, req.body seria undefined em POST/PUT
app.use(express.json());

// --- ROTA DE TESTE (health check) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default app;
```

**O que é cada middleware e por que a ordem importa:**

Middlewares são executados na **ordem que são registrados**. É como uma fila:

```
Requisição → cors() → express.json() → sua rota
```

1. `cors()` — Adiciona headers CORS na resposta. Sem ele, o navegador bloqueia requisições do frontend
2. `express.json()` — Parseia o body de requisições com `Content-Type: application/json`. Sem ele, `req.body` é `undefined`

Agora atualize `src/server.ts`:

```typescript
import app from './app';
import dotenv from 'dotenv';

// Carrega as variáveis do .env para process.env
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Rodando em http://localhost:${PORT}`);
  console.log(`[server] Ambiente: ${process.env.NODE_ENV}`);
});
```

### 5.4 Teste

```bash
npm run dev
```

Abra o navegador ou use o terminal:

```bash
curl http://localhost:3000/api/health
```

Deve retornar:
```json
{ "status": "ok", "timestamp": "2026-03-31T..." }
```

### 5.5 Commit

```bash
git add .
git commit -m "feat: configurar Express com middlewares cors e json"
```

---

## 6. TASK 3 — ESTRUTURA DE PASTAS

> **Deadline:** 4 de abril  
> **Branch:** `feature/setup-backend` (continua)  
> **Objetivo:** Organizar o backend em camadas claras (RNF12)

### 6.1 A estrutura completa

```bash
# Execute esses comandos na pasta backend/
mkdir -p src/controllers
mkdir -p src/services
mkdir -p src/repositories
mkdir -p src/entities
mkdir -p src/middlewares
mkdir -p src/routes
mkdir -p src/utils
mkdir -p src/config
mkdir -p src/types
```

**Estrutura resultante com explicação de cada pasta:**

```
backend/src/
│
├── config/          → Configurações do sistema
│   └── database.ts    (conexão com banco, configuração Prisma)
│
├── controllers/     → CAMADA DE APRESENTAÇÃO (RNF12)
│   └── UserController.ts  (recebe req, chama service, retorna res)
│
├── services/        → CAMADA DE APLICAÇÃO (RNF12)
│   └── UserService.ts     (regras de negócio, validações)
│
├── repositories/    → CAMADA DE ACESSO A DADOS (RNF12)
│   └── UserRepository.ts  (queries ao banco via Prisma)
│
├── entities/        → CAMADA DE DOMÍNIO (RNF12)
│   └── (gerenciado pelo Prisma - schema.prisma)
│
├── middlewares/      → Funções intermediárias
│   ├── authMiddleware.ts    (verifica JWT)
│   └── roleMiddleware.ts    (verifica permissão RBAC)
│
├── routes/          → Definição das rotas
│   ├── index.ts       (agrupa todas as rotas)
│   └── userRoutes.ts  (rotas de /api/users)
│
├── types/           → Interfaces e tipos TypeScript
│   └── index.ts       (tipos compartilhados)
│
├── utils/           → Funções utilitárias
│   └── AppError.ts    (classe de erro customizada)
│
├── app.ts           → Configuração do Express
└── server.ts        → Inicialização do servidor
```

### 6.2 Como as camadas se comunicam

Regra de ouro: **cada camada só conhece a camada imediatamente abaixo**.

```
Controller  →  conhece Service
Service     →  conhece Repository
Repository  →  conhece o Banco (Prisma)

Controller  ✖  NÃO acessa Repository diretamente
Controller  ✖  NÃO faz query no banco
Service     ✖  NÃO acessa req/res do Express
```

**Exemplo concreto do fluxo "Criar Usuário":**

```
POST /api/users  { nome: "Ana", email: "ana@email.com", senha: "123456" }

1. [Router]      → Direciona para UserController.create
2. [Controller]  → Pega dados do req.body, chama userService.create(dados)
3. [Service]     → Valida dados, faz hash da senha, chama userRepository.create(dados)
4. [Repository]  → Insere no banco via Prisma, retorna o user criado
5. [Service]     → Retorna user (sem a senha!) pro controller
6. [Controller]  → Retorna res.status(201).json(user)
```

### 6.3 Crie os arquivos base

**`src/types/index.ts`** — Tipos compartilhados:

```typescript
// Enum para os papéis do sistema (RF02)
export enum Role {
  ATENDENTE = 'ATENDENTE',
  GERENTE = 'GERENTE',
  GERENTE_GERAL = 'GERENTE_GERAL',
  ADMIN = 'ADMIN'
}

// Tipo para os dados decodificados do JWT
export interface TokenPayload {
  userId: string;
  role: Role;
}

// Extensão do Request do Express para incluir dados do usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
```

**O que é `declare global`?**  
Estamos "estendendo" o tipo `Request` do Express para incluir uma propriedade `user`. Sem isso, `req.user` daria erro de tipo. Isso é chamado **declaration merging** no TypeScript.

**`src/utils/AppError.ts`** — Classe de erro customizada:

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantém o stack trace correto
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**Por que criar uma classe de erro?**
- Permite diferenciar erros "esperados" (dados inválidos, 400) de erros inesperados (bug, 500)
- `statusCode` é enviado na resposta automaticamente
- `isOperational` indica se é um erro controlado ou um bug
- Isso é o padrão de projeto **Template Method** implícito e demonstra SRP (RNF13)

**`src/routes/index.ts`** — Agregador de rotas:

```typescript
import { Router } from 'express';
// Aqui você vai importar as rotas de cada módulo conforme criar

const router = Router();

// Rota de saúde (já funciona)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Futuras rotas:
// router.use('/users', userRoutes);
// router.use('/leads', leadRoutes);

export default router;
```

Agora atualize o `src/app.ts` para usar o router:

```typescript
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Todas as rotas ficam sob /api
app.use('/api', routes);

export default app;
```

### 6.4 Crie um exemplo funcional (Controller + Service)

Para provar que a estrutura funciona, vamos criar um exemplo simples.

**`src/services/UserService.ts`:**

```typescript
// Por enquanto, sem banco — dados fictícios para provar a estrutura
class UserService {
  async findAll() {
    // Futuramente: return await userRepository.findAll();
    return [
      { id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
      { id: '2', name: 'Ana', email: 'ana@example.com', role: 'ATENDENTE' },
    ];
  }
}

// Exporta uma instância única (Singleton pattern - GoF!)
export default new UserService();
```

**`src/controllers/UserController.ts`:**

```typescript
import { Request, Response } from 'express';
import userService from '../services/UserService';

class UserController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new UserController();
```

**`src/routes/userRoutes.ts`:**

```typescript
import { Router } from 'express';
import userController from '../controllers/UserController';

const router = Router();

router.get('/', userController.index);

export default router;
```

Atualize `src/routes/index.ts`:

```typescript
import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/users', userRoutes);

export default router;
```

### 6.5 Teste

```bash
npm run dev
curl http://localhost:3000/api/users
```

Deve retornar a lista de usuários fictícios. A estrutura de camadas está funcionando!

### 6.6 Commit e merge

```bash
git add .
git commit -m "feat: criar estrutura de pastas com exemplo controller/service"

# Agora faz merge na develop
git checkout develop
git pull origin develop
git merge feature/setup-backend
git push origin develop
```

---

## 7. TASK 4 — DOCKERFILE DO BACKEND

> **Deadline:** 6 de abril  
> **Branch:** `feature/docker-config`  
> **Objetivo:** Container Docker para o backend

### 7.1 Conceito: como funciona um Dockerfile

Um Dockerfile é uma **lista de instruções** que o Docker executa sequencialmente para criar uma imagem:

```
FROM     → Imagem base (ex: Node.js 20)
WORKDIR  → Define a pasta de trabalho dentro do container
COPY     → Copia arquivos do host para o container
RUN      → Executa comandos (ex: npm install)
EXPOSE   → Documenta a porta que o container usa
CMD      → Comando que roda quando o container inicia
```

### 7.2 Crie o Dockerfile

Crie `backend/Dockerfile`:

```dockerfile
# ---- Estágio de build ----
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia APENAS os arquivos de dependência primeiro
# Por que? Docker usa CACHE por camadas. Se package.json não mudou,
# não reinstala tudo — muito mais rápido!
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies para compilar TS)
RUN npm ci

# Agora copia o código fonte
COPY . .

# Compila TypeScript para JavaScript
RUN npm run build

# ---- Estágio de produção ----
FROM node:20-alpine

WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Instala APENAS dependências de produção
RUN npm ci --only=production

# Documenta a porta (não abre de fato, é documentação)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "dist/server.js"]
```

**O que é Multi-stage build?**

O Dockerfile acima tem DOIS estágios:
1. **builder** — Instala tudo, compila TypeScript. Imagem grande (~400MB)
2. **produção** — Copia só o JavaScript compilado e deps de produção. Imagem pequena (~150MB)

Resultado: imagem final muito menor e sem código-fonte exposto.

**O que é `npm ci` vs `npm install`?**
- `npm ci` — Instala EXATAMENTE o que está no `package-lock.json`. Mais rápido, mais confiável, ideal para CI/CD e Docker
- `npm install` — Pode atualizar versões dentro do range permitido. Pode mudar o lock file

### 7.3 Crie o .dockerignore

Crie `backend/.dockerignore`:

```
node_modules
dist
.env
.git
*.md
```

> **Por que .dockerignore?** Sem ele, o `COPY . .` copia node_modules (que pode ter 500MB) pro container, mesmo que o `npm ci` vá reinstalar tudo. O `.dockerignore` funciona como `.gitignore` mas para o Docker.

### 7.4 Teste o build (opcional por enquanto)

```bash
cd backend
docker build -t abp-backend .
```

Se buildou sem erro, está correto. Não precisa rodar ainda — vamos rodar tudo junto no Docker Compose.

### 7.5 Commit

```bash
git add .
git commit -m "feat: criar Dockerfile multi-stage para backend"
git push origin feature/docker-config
```

---

## 8. TASK 5 — CRUD BÁSICO (Users + Leads)

> **Deadline:** 7 de abril  
> **Branch:** `feature/crud-users-leads`  
> **Objetivo:** Endpoints funcionais para criar, listar, editar e deletar Users e Leads

### 8.1 Configurar o Prisma

**PASSO 1 — Instale o Prisma:**

```bash
cd backend
npm install @prisma/client
npm install --save-dev prisma
```

- `@prisma/client` — O "cliente" que você usa no código para fazer queries
- `prisma` — A CLI (ferramenta de linha de comando) para gerar migrations, etc.

**PASSO 2 — Inicialize o Prisma:**

```bash
npx prisma init
```

Isso cria:
- `prisma/schema.prisma` — Onde você define os modelos (tabelas)
- Atualiza `.env` com `DATABASE_URL`

**PASSO 3 — Defina o schema:**

Edite `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================
// ENUMS
// =====================

enum Role {
  ATENDENTE
  GERENTE
  GERENTE_GERAL
  ADMIN
}

enum LeadOrigin {
  VISITA_PRESENCIAL
  TELEFONE
  WHATSAPP
  INSTAGRAM
  FORMULARIO_DIGITAL
  OUTRO
}

enum NegotiationImportance {
  FRIO
  MORNO
  QUENTE
}

enum NegotiationStatus {
  ABERTA
  ENCERRADA
}

// =====================
// MODELOS (TABELAS)
// =====================

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(ATENDENTE)
  teamId    String?  @map("team_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relações
  team  Team?  @relation(fields: [teamId], references: [id])
  leads Lead[]

  @@map("users")
}

model Team {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relações
  members User[]
  leads   Lead[]

  @@map("teams")
}

model Client {
  id        String   @id @default(uuid())
  name      String
  email     String?
  phone     String?
  document  String?  @unique  // CPF
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relações
  leads Lead[]

  @@map("clients")
}

model Lead {
  id         String     @id @default(uuid())
  origin     LeadOrigin
  clientId   String     @map("client_id")
  userId     String     @map("user_id")
  teamId     String     @map("team_id")
  storeId    String     @map("store_id")
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")

  // Relações
  client      Client       @relation(fields: [clientId], references: [id])
  user        User         @relation(fields: [userId], references: [id])
  team        Team         @relation(fields: [teamId], references: [id])
  store       Store        @relation(fields: [storeId], references: [id])
  negotiation Negotiation?

  @@map("leads")
}

model Store {
  id        String   @id @default(uuid())
  name      String
  address   String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  leads Lead[]

  @@map("stores")
}

model Negotiation {
  id         String                @id @default(uuid())
  leadId     String                @unique @map("lead_id")
  importance NegotiationImportance @default(FRIO)
  status     NegotiationStatus     @default(ABERTA)
  reason     String?
  createdAt  DateTime              @default(now()) @map("created_at")
  updatedAt  DateTime              @updatedAt @map("updated_at")

  // Relações
  lead    Lead                  @relation(fields: [leadId], references: [id])
  history NegotiationHistory[]

  @@map("negotiations")
}

model NegotiationHistory {
  id            String   @id @default(uuid())
  negotiationId String   @map("negotiation_id")
  field         String   // qual campo mudou (status, importance, etc.)
  oldValue      String   @map("old_value")
  newValue      String   @map("new_value")
  changedBy     String   @map("changed_by")
  changedAt     DateTime @default(now()) @map("changed_at")

  negotiation Negotiation @relation(fields: [negotiationId], references: [id])

  @@map("negotiation_history")
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String   // CREATE, UPDATE, DELETE, LOGIN
  entity    String   // USER, LEAD, CLIENT, TEAM, NEGOTIATION
  entityId  String?  @map("entity_id")
  userId    String   @map("user_id")
  details   String?  // JSON com detalhes da operação
  createdAt DateTime @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

**Explicação das anotações do Prisma:**

| Anotação | O que faz | Por que usar |
|----------|-----------|--------------|
| `@id` | Define como chave primária | Toda tabela precisa de PK |
| `@default(uuid())` | Gera UUID automático | Mais seguro que inteiros sequenciais |
| `@unique` | Cria constraint UNIQUE | Email não pode repetir |
| `@map("nome_snake")` | Nome da coluna no banco | Prisma usa camelCase, banco usa snake_case |
| `@@map("nome_tabela")` | Nome da tabela no banco | Mesma razão acima |
| `@relation` | Define FK | Integridade referencial (RNF05) |
| `@updatedAt` | Atualiza automaticamente | Timestamp de última alteração |

**PASSO 4 — Gere a migration:**

(Precisa do PostgreSQL rodando — se não tiver local, pule para a task Docker e volte)

```bash
npx prisma migrate dev --name init
```

Isso cria um arquivo SQL em `prisma/migrations/` — esse é o DDL que o documento pede (RP03)!

**PASSO 5 — Gere o Prisma Client:**

```bash
npx prisma generate
```

Agora você pode importar `@prisma/client` no código com tipos automáticos.

### 8.2 Configure a conexão com o banco

Crie `src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

// Cria uma instância única do Prisma (Singleton - GoF!)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export default prisma;
```

**Por que Singleton aqui?**  
Cada instância do PrismaClient abre um pool de conexões com o banco. Se você criasse uma nova instância em cada arquivo, teria dezenas de conexões abertas — o banco morreria. Uma única instância compartilhada é o correto.

### 8.3 Crie o Repository de Users

Crie `src/repositories/UserRepository.ts`:

```typescript
import prisma from '../config/database';
import { User, Prisma } from '@prisma/client';

class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
        password: false,  // NUNCA retorna a senha
      }
    }) as unknown as User[];
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}

export default new UserRepository();
```

**Por que o Repository?**
- Se um dia trocar o Prisma por outro ORM, muda SÓ o repository
- O Service não sabe como os dados são salvos — só pede "salve isso"
- Isso é o princípio de **inversão de dependência** (SOLID)

### 8.4 Crie o Service de Users

Crie `src/services/UserService.ts` (substitua o anterior):

```typescript
import userRepository from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';

class UserService {
  async findAll(): Promise<User[]> {
    return userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  }

  async create(data: { name: string; email: string; password: string; role?: string; teamId?: string }): Promise<User> {
    // Regra de negócio: email deve ser único
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email já está em uso', 409);
    }

    // Regra de negócio: senha deve ter pelo menos 6 caracteres
    if (data.password.length < 6) {
      throw new AppError('Senha deve ter pelo menos 6 caracteres', 400);
    }

    // Segurança: hash da senha (RNF02)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepository.create({
      ...data,
      password: hashedPassword,
    } as Prisma.UserCreateInput);
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    await this.findById(id); // Verifica se existe
    return userRepository.update(id, data);
  }

  async delete(id: string): Promise<User> {
    await this.findById(id); // Verifica se existe
    return userRepository.delete(id);
  }
}

export default new UserService();
```

**Não esqueça de instalar bcrypt:**

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**O que é bcrypt e o salt rounds (10)?**
- bcrypt é um algoritmo de hash **unidirecional** — transforma a senha em uma string irreversível
- O número 10 é o "custo" — quantas vezes o algoritmo roda. Maior = mais seguro mas mais lento
- 10 é o padrão recomendado para produção

### 8.5 Crie o Controller de Users

Atualize `src/controllers/UserController.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import userService from '../services/UserService';
import { AppError } from '../utils/AppError';

class UserController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
```

**O que é `next(error)`?**  
Quando acontece um erro, ao invés de tratar no controller, passamos para o próximo middleware. Vamos criar um **Error Handler global**.

### 8.6 Middleware de tratamento de erros

Crie `src/middlewares/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    // Erro operacional (esperado)
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  // Erro inesperado (bug)
  console.error('[ERROR]', error);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
```

Registre no `src/app.ts` — **DEPOIS de todas as rotas**:

```typescript
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Error handler DEVE ser o último middleware
app.use(errorHandler);

export default app;
```

### 8.7 Atualize as rotas

Atualize `src/routes/userRoutes.ts`:

```typescript
import { Router } from 'express';
import userController from '../controllers/UserController';

const router = Router();

router.get('/',     userController.index);    // GET    /api/users
router.get('/:id',  userController.show);     // GET    /api/users/:id
router.post('/',    userController.store);    // POST   /api/users
router.put('/:id',  userController.update);   // PUT    /api/users/:id
router.delete('/:id', userController.destroy); // DELETE /api/users/:id

export default router;
```

### 8.8 CRUD de Leads (siga o mesmo padrão)

Crie os mesmos 3 arquivos para Leads, seguindo EXATAMENTE a mesma estrutura:

1. `src/repositories/LeadRepository.ts` — Queries ao banco
2. `src/services/LeadService.ts` — Regras de negócio
3. `src/controllers/LeadController.ts` — Handlers HTTP
4. `src/routes/leadRoutes.ts` — Definição de rotas

**Regras de negócio específicas do Lead (para o Service):**
- Lead DEVE ter um client associado (RF01 do desafio)
- Lead DEVE ter uma loja e um atendente (RF01)
- Cada lead pode ter NO MÁXIMO uma negociação ativa (RF03)

Registre as rotas em `src/routes/index.ts`:

```typescript
import { Router } from 'express';
import userRoutes from './userRoutes';
import leadRoutes from './leadRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/users', userRoutes);
router.use('/leads', leadRoutes);

export default router;
```

### 8.9 Commit

```bash
git add .
git commit -m "feat: implementar CRUD completo de users e leads com Prisma"
git push origin feature/crud-users-leads
```

---

## 9. TASK 6 — DOCKERFILE DO FRONTEND

> **Deadline:** 8 de abril  
> **Branch:** `feature/docker-config`  
> **Objetivo:** Container Docker para o frontend React

### 9.1 O Dockerfile

Crie `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

> **Nota:** Esse Dockerfile é para DESENVOLVIMENTO. Em produção, você faria multi-stage com `npm run build` + nginx. Para o ABP, modo dev está ok.

> **O que é `--host 0.0.0.0`?** Por padrão, Vite (que o React usa) escuta apenas em `localhost`, que dentro do container significa "só eu". Com `0.0.0.0`, ele aceita conexões de fora do container — necessário pro Docker.

### 9.2 Crie o .dockerignore

Crie `frontend/.dockerignore`:

```
node_modules
dist
.env
.git
```

### 9.3 Commit

```bash
git add .
git commit -m "feat: criar Dockerfile para frontend React"
git push origin feature/docker-config
```

---

## 10. TASK 7 — AUTENTICAÇÃO JWT

> **Deadline:** 10 de abril  
> **Branch:** `feature/auth-jwt`  
> **Objetivo:** Login funcional que gera token JWT (RF01)

### 10.1 Instale as dependências

```bash
cd backend
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 10.2 Crie o AuthService

Crie `src/services/AuthService.ts`:

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userRepository from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';
import { TokenPayload, Role } from '../types';

class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    // Pega do .env — NUNCA hardcode a secret (RNF02)
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-dev-only';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';
  }

  async login(email: string, password: string): Promise<{ token: string; user: object }> {
    // 1. Busca o usuário pelo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Mensagem genérica por segurança — não revela se é email ou senha errada
      throw new AppError('Credenciais inválidas', 401);
    }

    // 2. Compara a senha com o hash salvo no banco
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // 3. Gera o token JWT
    const payload: TokenPayload = {
      userId: user.id,
      role: user.role as Role,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    // 4. Retorna o token e dados do usuário (SEM a senha!)
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}

export default new AuthService();
```

**Detalhe importante:** `const { password: _, ...userWithoutPassword } = user;`  
Isso é **destructuring** — extrai `password` para a variável `_` (descartada) e o resto vai pra `userWithoutPassword`. Nunca retorne a senha, mesmo com hash.

### 10.3 Crie o AuthController

Crie `src/controllers/AuthController.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email e senha são obrigatórios' });
        return;
      }

      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
```

### 10.4 Crie a rota de auth

Crie `src/routes/authRoutes.ts`:

```typescript
import { Router } from 'express';
import authController from '../controllers/AuthController';

const router = Router();

router.post('/login', authController.login);

export default router;
```

Registre em `src/routes/index.ts`:

```typescript
import authRoutes from './authRoutes';
// ... demais imports

router.use('/auth', authRoutes);
```

### 10.5 Crie o middleware de autenticação

Crie `src/middlewares/authMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 1. Pega o header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  // 2. Extrai o token (formato: "Bearer <token>")
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  const token = parts[1];

  try {
    // 3. Verifica e decodifica o token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-dev-only'
    ) as TokenPayload;

    // 4. Anexa os dados do usuário ao request
    req.user = decoded;

    // 5. Continua para o próximo middleware/controller
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
```

**Como usar nas rotas:**

```typescript
import { authMiddleware } from '../middlewares/authMiddleware';

// Rotas protegidas: adicione authMiddleware ANTES do controller
router.get('/users', authMiddleware, userController.index);

// Rota pública: NÃO adicione authMiddleware
router.post('/auth/login', authController.login);
```

### 10.6 Teste com curl

```bash
# 1. Crie um usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@test.com", "password": "123456", "role": "ADMIN"}'

# 2. Faça login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "123456"}'
# Retorna: { "token": "eyJhbGciOi...", "user": {...} }

# 3. Acesse rota protegida com o token
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer COLE_O_TOKEN_AQUI"
```

### 10.7 Commit

```bash
git add .
git commit -m "feat: implementar autenticação JWT com login e middleware"
git push origin feature/auth-jwt
```

---

## 11. TASK 8 — MIDDLEWARE RBAC

> **Deadline:** 12 de abril  
> **Branch:** `feature/rbac-middleware`  
> **Objetivo:** Controlar acesso por papel (RF02)

### 11.1 Crie o middleware de roles

Crie `src/middlewares/roleMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

// Factory function que retorna um middleware
// Isso é o padrão FACTORY METHOD (GoF!)
export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // authMiddleware já rodou antes e colocou req.user
    if (!req.user) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Você não tem permissão para acessar este recurso',
      });
      return;
    }

    next();
  };
}
```

**O que é Factory Method aqui?**  
`roleMiddleware` é uma função que **cria e retorna outra função** (o middleware). Cada chamada pode criar um middleware diferente dependendo dos roles passados. Isso é o padrão Factory — produz objetos (funções são objetos em JS) sem expor a lógica de criação.

### 11.2 Como aplicar nas rotas

Atualize `src/routes/userRoutes.ts`:

```typescript
import { Router } from 'express';
import userController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { Role } from '../types';

const router = Router();

// Todas as rotas de user exigem autenticação
router.use(authMiddleware);

// GET /api/users — Admin pode listar todos
router.get('/',
  roleMiddleware(Role.ADMIN),
  userController.index
);

// GET /api/users/:id — Admin pode ver qualquer um
router.get('/:id',
  roleMiddleware(Role.ADMIN),
  userController.show
);

// POST /api/users — Só admin cria usuários
router.post('/',
  roleMiddleware(Role.ADMIN),
  userController.store
);

// PUT /api/users/:id — Admin edita qualquer um
// (lógica de "usuário edita a si mesmo" vai no service)
router.put('/:id',
  roleMiddleware(Role.ADMIN, Role.ATENDENTE, Role.GERENTE, Role.GERENTE_GERAL),
  userController.update
);

// DELETE /api/users/:id — Só admin deleta
router.delete('/:id',
  roleMiddleware(Role.ADMIN),
  userController.destroy
);

export default router;
```

**Fluxo de uma requisição protegida:**

```
POST /api/users (com token de Atendente)
    ↓
authMiddleware  → Token válido? Sim → req.user = { userId: "abc", role: "ATENDENTE" }
    ↓
roleMiddleware(ADMIN)  → role é ADMIN? Não → 403 Forbidden
    ✖ Requisição bloqueada
```

```
POST /api/users (com token de Admin)
    ↓
authMiddleware  → Token válido? Sim → req.user = { userId: "xyz", role: "ADMIN" }
    ↓
roleMiddleware(ADMIN)  → role é ADMIN? Sim → next()
    ↓
userController.store  → Cria o usuário → 201 Created
```

### 11.3 Regras RBAC específicas por role (para implementar no Service)

O middleware valida "quem pode acessar a rota". Mas regras mais complexas ficam no **Service**:

**No LeadService, por exemplo:**

```typescript
// Exemplo conceitual - implemente na lógica do seu findAll
async findAllByUser(currentUser: TokenPayload): Promise<Lead[]> {
  switch (currentUser.role) {
    case Role.ATENDENTE:
      // Só vê os próprios leads
      return leadRepository.findByUserId(currentUser.userId);

    case Role.GERENTE:
      // Vê leads de toda a equipe
      const user = await userRepository.findById(currentUser.userId);
      return leadRepository.findByTeamId(user!.teamId!);

    case Role.GERENTE_GERAL:
    case Role.ADMIN:
      // Vê todos
      return leadRepository.findAll();

    default:
      throw new AppError('Role inválido', 403);
  }
}
```

### 11.4 Commit

```bash
git add .
git commit -m "feat: implementar middleware RBAC com controle por papel"
git push origin feature/rbac-middleware
```

---

## 12. TASK 9 — DOCKER COMPOSE COMPLETO

> **Deadline:** 12 de abril  
> **Branch:** `feature/docker-config` (continua)  
> **Objetivo:** Sistema inteiro rodando com um único comando (RNF07)

### 12.1 Crie o Docker Compose

Crie `docker-compose.yml` na **RAIZ do repositório** (não dentro de backend/ ou frontend/):

```yaml
version: '3.8'

services:
  # ==================
  # BANCO DE DADOS
  # ==================
  postgres:
    image: postgres:16-alpine
    container_name: abp_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: abp_leads
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ==================
  # BACKEND
  # ==================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: abp_backend
    environment:
      PORT: 3000
      NODE_ENV: development
      JWT_SECRET: sua-secret-aqui-mudar-em-prod
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/abp_leads
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src  # Hot reload em dev

  # ==================
  # FRONTEND
  # ==================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: abp_frontend
    environment:
      VITE_API_URL: http://localhost:3000/api
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Explicação de CADA campo importante:**

| Campo | Função |
|-------|--------|
| `image: postgres:16-alpine` | Usa a imagem oficial do PostgreSQL, versão 16, variante Alpine (menor) |
| `volumes: postgres_data:/var/lib/...` | Persiste dados do banco mesmo se o container for destruído |
| `healthcheck` | Verifica se o postgres está pronto antes do backend tentar conectar |
| `depends_on: condition: service_healthy` | Backend SÓ inicia quando postgres está saudável |
| `DATABASE_URL: ...@postgres:5432/...` | O hostname `postgres` é o nome do serviço! Docker resolve internamente |
| `volumes: ./backend/src:/app/src` | Mapeia o código local pro container — mudanças refletem sem rebuild |

### 12.2 Comandos Docker Compose

```bash
# Sobe tudo (build + start)
docker compose up --build

# Sobe em background (detached)
docker compose up --build -d

# Ver logs
docker compose logs -f backend    # logs só do backend
docker compose logs -f             # logs de tudo

# Parar tudo
docker compose down

# Parar e DESTRUIR volumes (reseta banco!)
docker compose down -v

# Rebuild só um serviço
docker compose build backend
docker compose up backend

# Rodar comando dentro do container
docker compose exec backend sh
docker compose exec postgres psql -U postgres -d abp_leads
```

### 12.3 Executar migrations dentro do Docker

Depois que os containers estiverem rodando:

```bash
docker compose exec backend npx prisma migrate deploy
```

### 12.4 Seed (dados iniciais)

Crie `backend/prisma/seed.ts`:

```typescript
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cria um admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@abp.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@abp.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Adicione no `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Execute:

```bash
docker compose exec backend npx prisma db seed
```

### 12.5 Commit e merge

```bash
git add .
git commit -m "feat: configurar Docker Compose com postgres, backend e frontend"
git checkout develop
git pull origin develop
git merge feature/docker-config
git push origin develop
```

---

## 13. PADRÕES DE PROJETO (GoF)

O documento exige uso **explícito e justificado** de padrões GoF (RNF10). Aqui estão os que já usamos e outros que cabem bem:

### Padrões já aplicados

| Padrão | Onde | Justificativa |
|--------|------|---------------|
| **Singleton** | `database.ts`, Services, Repositories | Uma única instância do PrismaClient e de cada Service/Repository. Evita múltiplas conexões e garante estado consistente |
| **Factory Method** | `roleMiddleware()` | Função que cria middlewares diferentes baseado nos parâmetros. Encapsula a lógica de criação |

### Padrões recomendados para implementar

| Padrão | Onde usar | O que faz |
|--------|-----------|-----------|
| **Strategy** | Filtros do Dashboard (RF06) | Diferentes estratégias de filtro (semanal, mensal, anual, customizado). Cada uma implementa a mesma interface mas filtra de forma diferente |
| **Observer** | AuditLog (RF07) | Quando um lead muda de status, "notifica" o sistema de log para registrar. Desacopla a ação do log |
| **Repository** | Já estamos usando | Abstrai o acesso a dados. O Service não sabe se é Prisma, SQL puro, ou API externa |

### Como documentar para a apresentação

Na documentação (RP06), crie uma seção assim:

```
## Padrões de Projeto (GoF) Utilizados

### 1. Singleton
- **Onde:** PrismaClient (database.ts), Services e Repositories
- **Motivação:** Garantir instância única do client de banco de dados
  para evitar múltiplas conexões e memory leaks.

### 2. Factory Method
- **Onde:** roleMiddleware (middlewares/roleMiddleware.ts)
- **Motivação:** Criar middlewares de autorização dinamicamente
  baseado nos papéis permitidos, sem expor a lógica de criação.

### 3. Repository
- **Onde:** UserRepository, LeadRepository, etc.
- **Motivação:** Abstrair a camada de persistência, permitindo
  trocar o ORM sem afetar as regras de negócio.
```

---

## 14. CHECKLIST FINAL DA SPRINT 1

Use esta checklist para verificar se está tudo ok antes da entrega:

### Requisitos atendidos

- [ ] **RF01** — Login com email/senha, JWT com id + role + expiração
- [ ] **RF02** — RBAC implementado no BACKEND (não só frontend!)
- [ ] **RF03** — CRUD de negociações (pelo menos a base)
- [ ] **RNF01** — Frontend e backend separados, API REST, modular
- [ ] **RNF02** — bcrypt, JWT com expiração, .env, middleware de auth
- [ ] **RNF05** — Chaves estrangeiras (Prisma cuida), try/catch
- [ ] **RNF07** — Docker Compose com 3 containers
- [ ] **RNF09** — Git com branches e commits descritivos
- [ ] **RNF10** — Pelo menos 2 padrões GoF documentados
- [ ] **RNF12** — 4 camadas: controller, service, repository, entity
- [ ] **RNF13** — SRP em todas as classes
- [ ] **RP01** — React+TS, Node+TS, PostgreSQL
- [ ] **RP02** — Tudo roda via Docker
- [ ] **RP03** — DDL visível nas migrations do Prisma

### Arquivos/Pastas que devem existir

```
abp-lead-management/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/database.ts
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── middlewares/
│       ├── routes/
│       ├── types/
│       └── utils/
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
└── README.md
```

### Comandos para testar tudo

```bash
# 1. Sobe tudo
docker compose up --build -d

# 2. Roda migrations
docker compose exec backend npx prisma migrate deploy

# 3. Roda seed
docker compose exec backend npx prisma db seed

# 4. Testa health
curl http://localhost:3000/api/health

# 5. Cria usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# 6. Faz login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abp.com","password":"admin123"}'

# 7. Acessa rota protegida
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

---

## DICAS FINAIS

### Documentação que vale a pena ler

- **Express:** https://expressjs.com/pt-br/guide/routing.html
- **Prisma:** https://www.prisma.io/docs/getting-started
- **JWT:** https://jwt.io/introduction
- **Docker Compose:** https://docs.docker.com/compose/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/

### Erros comuns e como resolver

| Erro | Causa | Solução |
|------|-------|---------|
| `Cannot find module` | Import errado ou pacote não instalado | Verifique o caminho, rode `npm install` |
| `req.body is undefined` | Faltou `express.json()` | Adicione `app.use(express.json())` ANTES das rotas |
| `ECONNREFUSED postgres` | Backend tentou conectar antes do banco subir | Use `depends_on` com `condition: service_healthy` |
| `P1001: Can't reach database` | URL do banco errada no Docker | Dentro do Docker, use o nome do serviço (`postgres`) como host, não `localhost` |
| `JsonWebTokenError` | Token malformado ou secret errada | Verifique se está enviando `Bearer <token>` e se a secret é a mesma |
| `Property 'user' does not exist on type 'Request'` | Faltou o `declare global` | Adicione em `src/types/index.ts` |

---

> **Lembre-se:** Esse guia é seu MAPA. Execute task por task, teste cada uma antes de ir pra próxima. Se travar em algo, releia a seção de conceitos fundamentais. Cada conceito foi explicado pensando em te dar autonomia para debugar sozinho.
>
> Bom código! 🚀
