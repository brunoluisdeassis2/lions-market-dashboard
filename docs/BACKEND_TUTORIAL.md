# Tutorial Completo — Backend do Lions Market

Guia passo a passo para construir, do zero, a API Node.js/Express + MongoDB que o frontend deste repositório já consome. Ao final, todas as telas (login, cadastro, dashboard, produtos, pedidos, usuários, perfil) funcionam com dados reais.

## 1. Visão geral da arquitetura

O desafio é dividido em dois projetos independentes:

- Frontend (este repositório): React + Axios + Context API. Não contém regra de negócio.
- Backend (você vai criar): Node.js + Express + MongoDB (Mongoose) + JWT.

Regra de ouro: toda decisão importante é do backend. O frontend nunca envia o total do pedido, nunca decide quem é admin e nunca abate estoque. Ele só exibe o que a API devolve.

Fluxo de uma requisição:

    Tela React -> src/services/*.js -> Axios (src/services/api.js)
      -> HTTP + Authorization: Bearer <token>
      -> Express (rota -> middleware auth -> controller -> service -> Mongoose)
      -> MongoDB

## 2. Contrato de API (o que o frontend espera)

Base URL padrão: http://localhost:3000/api (configurável no frontend via VITE_API_URL).

Autenticação: header `Authorization: Bearer <token>` em todas as rotas privadas.

### 2.1 Autenticação

| Método | Rota | Acesso | Corpo | Resposta |
|---|---|---|---|---|
| POST | /auth/register | público | { name, email, password } | { token, user } |
| POST | /auth/login | público | { email, password } | { token, user } |
| GET | /auth/me | autenticado | — | user |
| PATCH | /users/me | autenticado | { name, email, password? } | user |

Objeto `user` (sempre SEM o campo password):

    {
      "_id": "665f...",
      "name": "Maria Souza",
      "email": "maria@email.com",
      "role": "user",        // "user" | "admin"
      "active": true,
      "createdAt": "2026-01-10T12:00:00.000Z"
    }

Importante: `POST /auth/register` é público e deve SEMPRE criar `role: "user"`. Se o corpo trouxer `role: "admin"`, ignore. Isso é uma falha de segurança clássica avaliada em desafios técnicos.

### 2.2 Produtos

| Método | Rota | Acesso | Observação |
|---|---|---|---|
| GET | /products | autenticado | lista paginada com filtros |
| GET | /products/:id | autenticado | detalhe |
| POST | /products | admin | criação |
| PUT | /products/:id | admin | atualização completa |
| PATCH | /products/:id | admin | atualização parcial (ativar/desativar) |
| DELETE | /products/:id | admin | exclusão |

Query params enviados pelo frontend em GET /products:

- `search` — texto livre (nome/descrição), case-insensitive
- `category` — categoria exata
- `availability` — "available" | "unavailable" | "inactive"
- `sort` — "name" | "price" | "-price" | "-createdAt"
- `page` — número da página (começa em 1)
- `limit` — itens por página

Regra de disponibilidade usada pelo frontend: disponível = `active !== false && stock > 0`.

Objeto `product`:

    {
      "_id": "665f...",
      "name": "Teclado mecânico",
      "description": "Switch azul, ABNT2",
      "category": "Periféricos",
      "price": 349.9,
      "stock": 12,
      "active": true,
      "createdAt": "2026-01-10T12:00:00.000Z"
    }

### 2.3 Pedidos

| Método | Rota | Acesso | Corpo |
|---|---|---|---|
| GET | /orders | autenticado | query: status, page, limit |
| GET | /orders/:id | dono ou admin | — |
| POST | /orders | autenticado | { items: [{ productId, quantity }] } |
| PATCH | /orders/:id/status | admin | { status } |
| PATCH | /orders/:id/cancel | dono ou admin | — |

Status válidos: `PENDENTE`, `PAGO`, `CANCELADO`, `FINALIZADO`.

Transições permitidas (valide no backend, o frontend só esconde botões):

- PENDENTE -> PAGO, CANCELADO
- PAGO -> FINALIZADO, CANCELADO
- CANCELADO e FINALIZADO são estados finais

Objeto `order`:

    {
      "_id": "665f...",
      "user": { "_id": "...", "name": "Maria", "email": "maria@email.com" },
      "items": [
        { "product": "665f...", "name": "Teclado mecânico", "unitPrice": 349.9, "quantity": 2, "subtotal": 699.8 }
      ],
      "itemsCount": 1,
      "total": 699.8,
      "status": "PENDENTE",
      "createdAt": "2026-01-10T12:00:00.000Z"
    }

Regras obrigatórias de pedido:

1. O preço unitário é copiado do produto no momento da compra (preço histórico). Se o produto mudar de preço depois, o pedido antigo continua igual.
2. O total é calculado pelo backend somando `unitPrice * quantity`.
3. Produto inativo ou com estoque insuficiente => 400 com mensagem clara.
4. Ao criar o pedido, o estoque é decrementado. Ao cancelar, o estoque é devolvido.
5. Usuário comum só vê e cancela os próprios pedidos; admin vê todos.

### 2.4 Usuários (admin)

| Método | Rota | Acesso | Corpo |
|---|---|---|---|
| GET | /users | admin | query: search, page, limit |
| PATCH | /users/:id | admin | { role } ou { active } |
| DELETE | /users/:id | admin | — |

Proteções: um admin não pode rebaixar, desativar ou excluir a si mesmo.

### 2.5 Dashboard

`GET /dashboard/summary` (admin) deve devolver exatamente estes campos:

    {
      "totalUsers": 12,
      "totalProducts": 34,
      "totalOrders": 87,
      "pendingOrders": 5,
      "outOfStockProducts": 3
    }

Os números precisam vir de contagens reais no MongoDB (`countDocuments`), não de valores fixos.

### 2.6 Formato de listagem paginada

O frontend aceita array simples ou objeto paginado. Padronize sempre assim:

    {
      "data": [ ... ],
      "page": 1,
      "limit": 10,
      "total": 34,
      "totalPages": 4
    }

### 2.7 Formato de erro

O tradutor de erros do frontend (`src/utils/errors.js`) procura `message` ou `error` no corpo. Padronize:

    { "message": "Estoque insuficiente para o produto Teclado mecânico." }

Códigos: 400 validação, 401 não autenticado, 403 sem permissão, 404 não encontrado, 409 conflito (e-mail já cadastrado), 500 erro interno.

## 3. Preparando o ambiente

Requisitos: Node.js 18+, MongoDB local ou MongoDB Atlas (gratuito), Insomnia/Postman, Git.

    mkdir lions-market-api && cd lions-market-api
    npm init -y
    npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator
    npm install --save-dev nodemon

No `package.json` adicione:

    "type": "module",
    "scripts": {
      "dev": "nodemon src/server.js",
      "start": "node src/server.js",
      "seed": "node src/seed.js"
    }

Arquivo `.env` (não versionar) e `.env.example` (versionar):

    PORT=3000
    MONGO_URI=mongodb://127.0.0.1:27017/lions_market
    JWT_SECRET=troque-por-uma-chave-longa-e-aleatoria
    JWT_EXPIRES_IN=1d
    CORS_ORIGIN=http://localhost:8080

Estrutura de pastas sugerida:

    src/
      config/db.js
      models/User.js  Product.js  Order.js
      middlewares/auth.js  isAdmin.js  errorHandler.js
      controllers/authController.js  productController.js
        orderController.js  userController.js  dashboardController.js
      routes/auth.routes.js  product.routes.js  order.routes.js
        user.routes.js  dashboard.routes.js  index.js
      utils/pagination.js  AppError.js
      app.js  server.js  seed.js

## 4. Passo a passo da implementação

### Passo 1 — Servidor e conexão

`src/config/db.js`:

    import mongoose from "mongoose";

    export async function connectDatabase() {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB conectado");
    }

`src/app.js`:

    import express from "express";
    import cors from "cors";
    import routes from "./routes/index.js";
    import { errorHandler } from "./middlewares/errorHandler.js";

    const app = express();
    app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
    app.use(express.json());
    app.use("/api", routes);           // todas as rotas ficam sob /api
    app.use(errorHandler);             // sempre por último
    export default app;

`src/server.js`:

    import "dotenv/config";
    import app from "./app.js";
    import { connectDatabase } from "./config/db.js";

    const port = process.env.PORT || 3000;
    connectDatabase()
      .then(() => app.listen(port, () => console.log(`API em http://localhost:${port}`)))
      .catch((e) => { console.error(e); process.exit(1); });

Teste: `npm run dev` e acesse http://localhost:3000/api/health (crie uma rota simples que devolve `{ status: "ok" }`).

### Passo 2 — Modelos (Mongoose)

`User`:

    const userSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true, select: false }, // nunca retorna por padrão
      role: { type: String, enum: ["user", "admin"], default: "user" },
      active: { type: Boolean, default: true },
    }, { timestamps: true });

    // Hash automático antes de salvar
    userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password, 10);
      next();
    });

    userSchema.methods.comparePassword = function (plain) {
      return bcrypt.compare(plain, this.password);
    };

`Product`:

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      category: { type: String, required: true, trim: true },
      price: { type: Number, required: true, min: 0 },
      stock: { type: Number, required: true, min: 0, default: 0 },
      active: { type: Boolean, default: true },
    }, { timestamps: true });

`Order`:

    const orderItemSchema = new mongoose.Schema({
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },      // snapshot do nome
      unitPrice: { type: Number, required: true }, // snapshot do preço
      quantity: { type: Number, required: true, min: 1 },
      subtotal: { type: Number, required: true },
    }, { _id: false });

    const orderSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      items: { type: [orderItemSchema], required: true },
      total: { type: Number, required: true },
      status: { type: String, enum: ["PENDENTE","PAGO","CANCELADO","FINALIZADO"], default: "PENDENTE" },
    }, { timestamps: true });

### Passo 3 — Autenticação com JWT

Geração do token no login/registro:

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
    res.json({ token, user: sanitize(user) });

Middleware `auth`:

    export async function auth(req, res, next) {
      const header = req.headers.authorization || "";
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token)
        return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user || user.active === false)
          return res.status(401).json({ message: "Usuário inválido ou inativo." });
        req.user = user;
        next();
      } catch {
        return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
      }
    }

Middleware `isAdmin`:

    export function isAdmin(req, res, next) {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Você não tem permissão para esta ação." });
      next();
    }

Login: busque o usuário com `.select("+password")`, compare com bcrypt e responda 401 genérico ("E-mail ou senha inválidos") — nunca revele qual campo errou. Bloqueie login de usuário `active: false`.

### Passo 4 — Produtos com filtros, ordenação e paginação

    export async function list(req, res) {
      const { search, category, availability, sort = "name", page = 1, limit = 10 } = req.query;
      const filter = {};

      if (search) filter.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      if (category) filter.category = category;
      if (availability === "available")   { filter.active = true;  filter.stock = { $gt: 0 }; }
      if (availability === "unavailable") { filter.active = true;  filter.stock = { $lte: 0 }; }
      if (availability === "inactive")    { filter.active = false; }

      const pageNum  = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));

      const [data, total] = await Promise.all([
        Product.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum),
        Product.countDocuments(filter),
      ]);

      res.json({ data, page: pageNum, limit: limitNum, total,
                 totalPages: Math.max(1, Math.ceil(total / limitNum)) });
    }

Validações de escrita (POST/PUT): nome obrigatório, categoria obrigatória, `price >= 0`, `stock >= 0` inteiro. Devolva 400 com `message` explicando o problema.

Sobre DELETE: em sistemas reais prefira desativar (`active: false`) para não quebrar pedidos antigos. Implemente o DELETE porque o frontend oferece, mas bloqueie a exclusão de produto que já apareça em algum pedido (409) ou faça exclusão lógica.

### Passo 5 — Pedidos (o ponto mais avaliado)

Criação (`POST /orders`), em pseudo-código comentado:

    // 1. Valide o corpo: items precisa ser array não vazio,
    //    cada item com productId válido e quantity inteiro >= 1.
    // 2. Agrupe itens repetidos do mesmo produto somando quantidades.
    // 3. Busque todos os produtos de uma vez: Product.find({ _id: { $in: ids } }).
    // 4. Para cada item verifique:
    //      - produto existe            -> senão 404
    //      - produto.active === true   -> senão 400 "Produto indisponível"
    //      - produto.stock >= quantity -> senão 400 "Estoque insuficiente para X"
    // 5. Monte os itens com snapshot: name, unitPrice = product.price,
    //    quantity e subtotal = unitPrice * quantity.
    // 6. total = soma dos subtotais (arredonde para 2 casas).
    // 7. Decremente o estoque de cada produto.
    // 8. Crie o pedido com status "PENDENTE" e user = req.user._id.
    // 9. Responda 201 com o pedido populado.

Para decrementar com segurança contra concorrência, use uma atualização condicional:

    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity }, active: true },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!updated) throw new AppError(400, `Estoque insuficiente para ${item.name}.`);

Se algum item falhar no meio, devolva o estoque já debitado (compensação) ou use transações do MongoDB (`session`) quando estiver usando replica set/Atlas.

Listagem (`GET /orders`): se `req.user.role !== "admin"`, force `filter.user = req.user._id`. Aplique `status`, `page`, `limit` e devolva o mesmo envelope paginado. Use `.populate("user", "name email")` e inclua `itemsCount: order.items.length`.

Detalhe (`GET /orders/:id`): 404 se não existir; 403 se não for admin nem dono.

Alterar status (`PATCH /orders/:id/status`, admin):

    const TRANSICOES = {
      PENDENTE: ["PAGO", "CANCELADO"],
      PAGO: ["FINALIZADO", "CANCELADO"],
      CANCELADO: [],
      FINALIZADO: [],
    };
    if (!TRANSICOES[order.status].includes(status))
      throw new AppError(400, `Não é possível mudar de ${order.status} para ${status}.`);

Se a mudança for para CANCELADO, devolva o estoque (`$inc: { stock: +quantity }`).

Cancelar (`PATCH /orders/:id/cancel`): permitido ao dono ou admin, apenas se o status for PENDENTE ou PAGO. Devolve estoque e grava `status: "CANCELADO"`. Cancelar duas vezes deve dar 400 — nunca devolver estoque em dobro.

### Passo 6 — Usuários e perfil

- `GET /users` (admin): filtro `search` por nome/e-mail com regex, envelope paginado, nunca retorne `password`.
- `PATCH /users/:id` (admin): aceita apenas `role` e `active`. Bloqueie `req.params.id === req.user.id` com 400 ("Você não pode alterar o próprio perfil de acesso").
- `DELETE /users/:id` (admin): bloqueie autoexclusão; considere impedir exclusão de quem tem pedidos.
- `PATCH /users/me` (autenticado): aceita `name`, `email` e `password` opcional. Verifique e-mail duplicado (409). Nunca aceite `role` ou `active` aqui — é escalada de privilégio.

### Passo 7 — Dashboard

    const [totalUsers, totalProducts, totalOrders, pendingOrders, outOfStockProducts] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "PENDENTE" }),
        Product.countDocuments({ stock: { $lte: 0 } }),
      ]);
    res.json({ totalUsers, totalProducts, totalOrders, pendingOrders, outOfStockProducts });

### Passo 8 — Tratamento central de erros

Crie `AppError` (status + message) e um `errorHandler` que:

- trata `AppError` devolvendo `{ message }` com o status correto;
- trata `ValidationError` do Mongoose como 400;
- trata `CastError` (ObjectId inválido) como 400 "Identificador inválido";
- trata erro de índice único (código 11000) como 409 "E-mail já cadastrado";
- em qualquer outro caso, loga o erro real no servidor e devolve 500 com mensagem genérica.

Nunca vaze stack trace para o cliente.

### Passo 9 — Seed (dados iniciais)

Crie `src/seed.js` que apaga e recria: um admin (`admin@lions.com` / `Admin@123`), um usuário comum (`user@lions.com` / `User@123`) e uns 10 produtos em categorias diferentes, alguns com `stock: 0` e um `active: false` para você testar os estados vazios/indisponíveis do frontend. Rode com `npm run seed`.

Este é exatamente o login que faltava para você explorar as telas.

## 5. Conectando o frontend

1. Suba o backend: `npm run dev` (porta 3000).
2. No projeto frontend, crie `.env` na raiz:

        VITE_API_URL=http://localhost:3000/api

3. Reinicie o servidor de desenvolvimento do frontend (variáveis Vite só são lidas na inicialização).
4. No backend, garanta que `CORS_ORIGIN` inclui a origem do frontend (ex.: http://localhost:8080).
5. Acesse /login e entre com `admin@lions.com` / `Admin@123`.

Checklist de integração:

- Login devolve `{ token, user }` e o frontend salva no localStorage.
- Recarregar a página mantém a sessão (o frontend chama `GET /auth/me`).
- Dashboard aparece só para admin; usuário comum é redirecionado.
- Produtos: busca, filtro, ordenação e paginação alteram a requisição HTTP.
- Pedido criado abate estoque; cancelamento devolve.

## 6. Erros comuns e como resolver

- CORS bloqueado: falta `cors()` ou a origem correta em `CORS_ORIGIN`.
- 401 em toda rota: o token não está sendo lido como `Bearer <token>` ou o `JWT_SECRET` mudou.
- Senha nunca confere: você fez hash duas vezes (no controller e no `pre("save")`). Deixe apenas no model.
- Password vazando na resposta: falta `select: false` ou você está retornando o documento cru.
- Paginação errada: `page` chegando como string; converta com `Number()`.
- Total do pedido divergente: você confiou em valor vindo do cliente. Recalcule sempre.
- Estoque negativo: faltou a atualização condicional `stock: { $gte: quantity }`.

## 7. Roteiro de testes manuais (Insomnia/Postman)

1. POST /api/auth/register — cria usuário comum e retorna token.
2. POST /api/auth/register com `role: "admin"` — deve continuar criando `user`.
3. POST /api/auth/login com senha errada — 401.
4. GET /api/products sem token — 401.
5. POST /api/products com token de usuário comum — 403.
6. POST /api/orders com quantidade maior que o estoque — 400 com mensagem clara.
7. POST /api/orders válido — 201, estoque diminui.
8. PATCH /api/orders/:id/cancel — estoque volta; repetir dá 400.
9. PATCH /api/orders/:id/status de FINALIZADO para PENDENTE — 400.
10. GET /api/dashboard/summary como usuário comum — 403.
11. PATCH /api/users/me enviando `role: "admin"` — o campo deve ser ignorado.

## 8. Entrega do desafio

Dois repositórios (ou um monorepo com `/frontend` e `/backend`). No README do backend inclua: como rodar, `.env.example`, credenciais do seed, lista de endpoints e as decisões de arquitetura (por que o total é calculado no servidor, por que roles ficam fora do registro público, como o estoque é protegido).

Comente o código em português explicando blocos e decisões, no mesmo padrão do frontend — isso faz parte da avaliação.
