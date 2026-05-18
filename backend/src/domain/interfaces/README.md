# Interfaces

##Descrição
Define contratos que devem ser implementados.

##Responsabilidades
- Definir contratos de repositories
- Garantir desacoplamento

##Exemplo
```ts
interface LeadRepository {
  findAll(): Promise<Lead[]>
}