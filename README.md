# Lions Market — Frontend

Frontend de um sistema administrativo simples para gestão de **usuários, produtos, estoque e pedidos**.
O projeto consome uma API REST separada (`lions-market-api`, construída com Node.js + Express + MongoDB + Mongoose + JWT + bcrypt).

Este repositório contém **somente o frontend**. Nenhuma regra crítica de negócio é executada aqui: o frontend apenas
apresenta dados e solicita operações à API.

## Tecnologias

- React 19 (JavaScript, sem TypeScript nas telas)
- Vite
- Axios (camada única de comunicação com a API)
- Context API (autenticação e sessão)
- TanStack Router (roteamento por arquivos em `src/routes`)
- CSS puro (`src/styles.css`), com visual sóbrio de sistema interno

> Observação sobre o roteador: o template deste projeto usa **TanStack Router**, e não `react-router-dom`.
> Os conceitos são equivalentes (rotas, parâmetros de URL, `Link`, navegação programática e rotas protegidas)
> e todo o roteamento fica isolado em arquivos finos dentro de `src/routes`.

## Como instalar

```bash
npm install
```

## Configuração do .env

Copie o arquivo de exemplo e ajuste a URL da API:

```bash
cp .env.example .env
```

```
VITE_API_URL=http://localhost:3000/api
```

A URL nunca é escrita diretamente nos componentes: ela é lida uma única vez em `src/services/api.js`.
Nenhum segredo real deve ser colocado no código.

## Como executar

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
```

## Estrutura do projeto

```
src/
├── components/     # componentes reutilizáveis (Button, Input, Modal, Table, Loading, ...)
├── contexts/       # AuthContext (Context API)
├── layouts/        # AppLayout (sidebar + cabeçalho + conteúdo)
├── pages/          # telas (Login, Cadastro, Dashboard, Produtos, Pedidos, Perfil, Usuários)
├── routes/         # arquivos de rota (finos, apontam para as páginas)
├── services/       # chamadas à API separadas por recurso
├── utils/          # formatação, validações, tradução de erros, storage, status de pedido
└── styles.css      # estilos do sistema
```

## Autenticação

- Login em `POST /auth/login`, que retorna `{ token, user }`.
- O token JWT é guardado no navegador (`localStorage`) apenas para manter a sessão entre recarregamentos.
- `src/contexts/AuthContext.jsx` guarda o usuário, executa login/cadastro/logout e verifica a sessão ao abrir a aplicação
  (chamando `GET /auth/me` para confirmar se o token continua válido).
- `src/services/api.js` possui um **interceptor de requisição** que adiciona automaticamente
  `Authorization: Bearer <token>` e um **interceptor de resposta** que limpa a sessão em caso de `401`.
- Logout apenas descarta o token: o JWT é sem estado.

## Perfis e autorização

Existem dois perfis: `admin` e `user`.

| Ação                              | Administrador | Usuário comum |
| --------------------------------- | ------------- | ------------- |
| Consultar produtos                | Sim           | Sim           |
| Cadastrar/editar/desativar produto| Sim           | Não           |
| Criar pedido                      | —             | Sim           |
| Ver pedidos                       | Todos         | Apenas os seus|
| Cancelar pedido                   | Sim           | Sim (quando permitido) |
| Alterar status do pedido          | Sim           | Não           |
| Gerenciar usuários (`/usuarios`)  | Sim           | Não           |

A autorização é aplicada em três camadas: itens do menu, `ProtectedRoute` (com a opção `somenteAdmin`) e,
principalmente, **o backend**, que valida o token e o perfil em cada requisição.

## Principais páginas

| Rota            | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| `/login`        | Autenticação. Admin vai para `/dashboard`, usuário para `/produtos`. |
| `/cadastro`     | Cadastro público (sempre cria usuário comum).                    |
| `/dashboard`    | Indicadores administrativos vindos da API.                       |
| `/produtos`     | Tabela com busca, filtros, ordenação e paginação.                |
| `/produtos/:id` | Detalhes do produto e criação de pedido.                         |
| `/pedidos`      | Lista de pedidos, detalhes, cancelamento e alteração de status.  |
| `/perfil`       | Edição do próprio nome, e-mail e senha.                          |
| `/usuarios`     | Gestão de usuários (somente administrador).                      |

Todas as páginas que consultam a API possuem os quatro estados: **carregando**, **erro**, **vazio** e **sucesso**.
Os erros do Axios são traduzidos para mensagens amigáveis em `src/utils/errors.js`, mantendo o detalhe técnico apenas no console de desenvolvimento.

## Integração com a API

Endpoints consumidos:

```
POST   /auth/login
POST   /auth/register
GET    /auth/me
PATCH  /users/me

GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
PATCH  /products/:id          (ativar/desativar)
DELETE /products/:id

GET    /orders
GET    /orders/:id
POST   /orders                (envia apenas items: [{ productId, quantity }])
PATCH  /orders/:id/status
PATCH  /orders/:id/cancel

GET    /users
PATCH  /users/:id
DELETE /users/:id

GET    /dashboard/summary
```

Regras que **pertencem ao backend** e não ao frontend:

- consultar o preço do produto e calcular o total do pedido;
- validar e diminuir o estoque na criação do pedido;
- devolver o estoque no cancelamento;
- validar transições de status;
- decidir quais pedidos cada usuário pode ver;
- definir e alterar perfis de acesso.

O frontend envia apenas produto e quantidade ao criar um pedido — nunca o valor total.
