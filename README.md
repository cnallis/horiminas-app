# Instruções para Execução do Projeto HoriMinas

Este documento contém as instruções para configurar e executar a aplicação web HoriMinas, um sistema de gestão para motoristas e seus rendimentos.

## Requisitos

- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Estrutura do Projeto

```
horiminas-app/
├── backend/           # Código do servidor Node.js
│   ├── src/           # Código fonte do backend
│   ├── .env           # Variáveis de ambiente
│   └── package.json   # Dependências do backend
└── frontend/          # Código da interface do usuário
    ├── css/           # Estilos CSS
    ├── js/            # Scripts JavaScript
    ├── pages/         # Páginas HTML
    └── index.html     # Página inicial (login)
```

## Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE horiminas;
```

2. Execute o script SQL para criar as tabelas:

```bash
psql -U seu_usuario -d horiminas -f backend/src/config/database.sql
```

Ou copie e cole o conteúdo do arquivo `backend/src/config/database.sql` em uma ferramenta de administração PostgreSQL como pgAdmin.

## Configuração do Backend

1. Navegue até a pasta do backend:

```bash
cd horiminas-app/backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Edite o arquivo `.env` com as informações do seu banco de dados
   - Altere a chave JWT_SECRET para uma string aleatória em ambiente de produção

```
PORT=3000
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_NAME=horiminas
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432
JWT_SECRET=chave_secreta_para_jwt
```

4. Inicie o servidor:

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`.

## Configuração do Frontend

O frontend é composto por arquivos estáticos HTML, CSS e JavaScript. Não é necessário instalar dependências adicionais.

Para acessar a aplicação:

1. Certifique-se de que o backend está em execução
2. Abra o arquivo `frontend/index.html` em um navegador web
   - Em ambiente de desenvolvimento, você pode usar uma extensão como "Live Server" no VS Code
   - Em produção, hospede os arquivos em um servidor web como Nginx ou Apache

## Usuários Padrão

A aplicação vem com um usuário administrador padrão:

- **Documento**: admin
- **Senha**: admin123

Recomendamos alterar a senha após o primeiro login.

## Funcionalidades

### Administrador

- Login com documento e senha
- Visualização de dashboard com estatísticas
- Cadastro, edição e exclusão de motoristas
- Upload de planilhas Excel com dados de rendimentos
- Visualização de todos os rendimentos com filtros por mês/ano

### Motorista

- Login com CPF/CNPJ e senha
- Visualização de dashboard com estatísticas pessoais
- Visualização apenas dos próprios rendimentos
- Filtros por mês/ano
- Edição de perfil e alteração de senha

## Formato da Planilha Excel

A planilha para upload deve conter as seguintes colunas:

- **documento**: CPF ou CNPJ do motorista
- **mes**: Mês do rendimento (1-12)
- **ano**: Ano do rendimento
- **total_entregas**: Número de entregas realizadas
- **toneladas**: Total de toneladas transportadas
- **valor_bruto**: Valor bruto do rendimento
- **descontos**: Valor dos descontos

O valor líquido será calculado automaticamente (valor_bruto - descontos).

## Solução de Problemas

- **Erro de conexão com o banco de dados**: Verifique as configurações no arquivo `.env`
- **Erro ao fazer login**: Certifique-se de que o backend está em execução
- **Erro ao fazer upload de planilha**: Verifique se o formato da planilha está correto

Para mais informações, consulte os logs do servidor no terminal onde o backend está sendo executado.
# horiminas-app
