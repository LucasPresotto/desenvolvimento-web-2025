// server.js — app principal com prefixo /api
// -----------------------------------------------------------------------------
// O QUE ESTE ARQUIVO FAZ?
// 1) Carrega variáveis de ambiente (.env) para process.env
// 2) Cria um servidor HTTP com Express
// 3) Expõe uma rota raiz (GET /) que lista os endpoints disponíveis
// 4) Monta um agrupamento de rotas (Router) de CHAMADOS sob o prefixo /api/chamados
//
// TERMOS IMPORTANTES (para iniciantes):
// - Servidor HTTP: programa que recebe pedidos (requests) e envia respostas (responses).
// - Rota (endpoint): combinação de URL + método HTTP (GET, POST, PUT, PATCH, DELETE).
// - Middleware: função que roda “no meio do caminho” entre o pedido e a resposta
//   (ex.: express.json() transforma JSON do corpo em objeto JS).
// - Router: “mini-aplicativo” com rotas específicas; ajuda a organizar o código
//   separando responsabilidades (ex.: tudo de chamados fica em chamados.routes.js).
//
// SOBRE VARIÁVEIS DE AMBIENTE:
// - Em projetos reais, você NÃO coloca senhas/URLs/portas “hardcoded” no código.
// - Em vez disso, cria um arquivo .env (não versionado) e usa dotenv para carregar
//   essas chaves em process.env (ex.: process.env.PORT).
// -----------------------------------------------------------------------------
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/auth.js";
import postsRouter from "./routes/posts.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import comentariosRouter from "./routes/comentarios.routes.js";
import likesRouter from "./routes/likes.routes.js";
import seguidoresRouter from "./routes/seguidores.routes.js";
dotenv.config();
// ↑ Lê o arquivo .env (se existir) e popula process.env com as chaves definidas.
//   Importante: chame dotenv.config() antes de acessar qualquer process.env.
const app = express();
// Confiança no proxy (necessário para deploy em serviços como Render/Heroku)
app.set("trust proxy", 1);

// Habilita CORS com credenciais (permite cookies entre domínios)
app.use(cors({ origin: true, credentials: true }));

// Habilita o Express a ler JSON do corpo das requisições
app.use(express.json());

// Habilita o Express a ler cookies (necessário para o refresh token)
app.use(cookieParser());
// -----------------------------------------------------------------------------
// ROTA DE BOAS-VINDAS (GET /)
// - Retorna um “guia rápido” em JSON com os endpoints disponíveis da API.
// - Útil para abrir no navegador e ter uma visão geral do que existe.
// -----------------------------------------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    // USUARIOS (Público)
    REGISTER: "POST /api/usuarios/register BODY: { nome, usuario, email, senha }",
    LOGIN:    "POST /api/usuarios/login    BODY: { email, senha }",
    LOGOUT:   "POST /api/usuarios/logout   (requer cookie)",
    REFRESH:  "POST /api/usuarios/refresh  (requer cookie)",
    
    // POSTS (Protegido)
    LISTAR_POSTS:    "GET /api/posts",
    MOSTRAR_POST:    "GET /api/posts/:id",
    CRIAR_POST:      "POST /api/posts       BODY: { tipo: number, conteudo: 'string' }",
    SUBSTITUIR_POST: "PUT /api/posts/:id    BODY: { tipo: number, conteudo: 'string' }",
    ATUALIZAR_POST:  "PATCH /api/posts/:id  BODY: { tipo?: number, conteudo?: 'string' }",
    DELETAR_POST:    "DELETE /api/posts/:id",
    
    // COMENTARIOS (Protegido, exceto GET)
    LISTAR_COMENTARIOS: "GET /api/posts/:id/comentarios",
    CRIAR_COMENTARIO:   "POST /api/comentarios      BODY: { post_id: number, conteudo: 'string' }",
    ATUALIZAR_COMENTARIO: "PUT /api/comentarios/:id   BODY: { conteudo: 'string' }",
    DELETAR_COMENTARIO: "DELETE /api/comentarios/:id",

    // EXTRAS
    LIKE_POST:        "POST /api/likes/posts/:id",
    UNLIKE_POST:      "DELETE /api/likes/posts/:id",
    SEGUIR:           "POST /api/seguidores/:id",
    UNFOLLOW:         "DELETE /api/seguidores/:id"
  });
});
// Rotas públicas de autenticação
app.use("/api/usuarios", usuariosRouter);

// Rotas protegidas (exigem 'Authorization: Bearer <token>')
app.use("/api/posts", authMiddleware, postsRouter);
app.use("/api/comentarios", authMiddleware, comentariosRouter);
app.use("/api/likes", authMiddleware, likesRouter);
app.use("/api/seguidores", authMiddleware, seguidoresRouter);
// -----------------------------------------------------------------------------
// INICIANDO O SERVIDOR
// - process.env.PORT permite definir a porta via ambiente (ex.: PORT=8080).
// - Caso não exista, usamos 3000 como padrão.
// - app.listen inicia o servidor e imprime no console a URL local para teste.
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
// Abra esse endereço no navegador para ver a rota GET / (a lista de endpoints).
