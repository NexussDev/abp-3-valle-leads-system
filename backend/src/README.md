#Código Fonte Backend

##Descrição
Contém toda a implementação da API.

##Estrutura
- config/
- domain/
- application/
- infrastructure/
- presentation/
- shared/

##Responsabilidades
- Configuração de banco de dados
- Configuração de JWT
- Variáveis de ambiente


##Exemplos
- database.ts
- auth.ts
- env.ts

##Boas práticas
- Nunca versionar dados sensíveis
- Usar `.env`
- Separar responsabilidades
- Evitar dependências entre camadas erradas