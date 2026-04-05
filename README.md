# 🚀 ABP 3° Semestre - 1000 Valle Multimarcas

Sistema completo de gerenciamento de leads desenvolvido com foco em **escalabilidade**, **organização** e **boas práticas**.

---

## 🧠 Sobre o Projeto

A **ABP do 3° Semestre - 1000 Valle Multimarcas** é uma aplicação fullstack projetada para gerenciar leads, usuários e negociações de forma eficiente.

O projeto foi estruturado utilizando o padrão **Clean Architecture**, garantindo:

* Separação clara de responsabilidades
* Facilidade de manutenção
* Escalabilidade
* Código organizado para trabalho em equipe

---

## 🏗️ Arquitetura

O sistema segue o modelo de camadas:

```
Presentation -> Application -> Domain
                    ↓
              Infrastructure
```

📌 **Regra de ouro:**

> Camadas internas nunca dependem das externas.

---

## 🛠️ Tecnologias Utilizadas

### Backend

* Node.js
* TypeScript
* Express

### Frontend

* React
* TypeScript

### Banco de Dados

* PostgreSQL

### Infraestrutura

* Docker
* Docker Compose

---

## 📂 Estrutura do Projeto

```
lead-management-system/
├── docs/        - Documentação
├── backend/     - API e regras de negócio
├── frontend/    - Interface do usuário
├── database/    - Scripts SQL
```

---

## ▶️ Como Executar o Projeto

⚠️ **Este projeto deve ser executado exclusivamente via Docker**

```bash
docker-compose up --build
```

Após subir:

* Frontend: http://localhost:3000
* Backend: http://localhost:3001

---

## 🗄️ Banco de Dados

O projeto utiliza scripts versionados:

* `ddl/` - criação de tabelas
* `dml/` - dados iniciais (seed)
* `indexes/` - otimizações

📌 Exemplo:

```
001-create-tables.sql
002-seed-data.sql
```

---

## 📌 Boas Práticas Adotadas

* Clean Architecture
* Princípios SOLID
* Separação de responsabilidades
* Tipagem forte com TypeScript
* Versionamento de banco de dados
* Containerização com Docker

---

## 🔄 Fluxo da Aplicação

```
Request -> Controller -> Service -> Repository -> Database
```

---

## 👥 Organização do Time

Para manter o padrão do projeto:

* Cada camada deve respeitar sua responsabilidade
* Não misturar regras de negócio com controllers
* Criar código apenas na pasta correta
* Sempre documentar alterações relevantes

---

## 📚 Documentação

Toda a documentação está disponível em:

```
/docs
```

Inclui:

* Arquitetura
* Endpoints
* Design Patterns
* Diagramas
* Retrospectivas

---

## 🚀 Status do Projeto

🟢 Em desenvolvimento
