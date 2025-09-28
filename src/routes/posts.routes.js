import { Router } from "express";
import { pool } from "../database/db.js";
const router = Router(); // cria o "mini-app" de rotas
// -----------------------------------------------------------------------------
// LISTAR — GET /api/posts
// -----------------------------------------------------------------------------
// Objetivo: retornar TODOS os posts.
// Obs.: Ordenamos por id DESC para mostrar os mais recentes primeiro.
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM Posts ORDER BY id DESC"
    );
    res.json(rows); 
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// MOSTRAR — GET /api/posts/:id
// -----------------------------------------------------------------------------
// Objetivo: retornar UM post específico pelo id.
router.get("/:id", async (req, res) => {
  // req.params.id é string → converter p/ número
  const id = Number(req.params.id);
  // Validar: precisa ser inteiro e > 0
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM Posts WHERE id = $1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); // 200 OK (um objeto)
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// CRIAR — POST /api/posts
// -----------------------------------------------------------------------------
// Objetivo: inserir um novo post.
// Espera JSON: { Usuarios_id, tipo, conteudo }
// Regras básicas:
// - Usuarios_id: inteiro > 0 (FK para Usuarios.id).
// - tipo: inteiro (0 para texto, 1 para imagem e 3 para vídeo).
// - conteudo: texto não nulo.
router.post("/", async (req, res) => {
  // Se req.body vier undefined (cliente não mandou JSON), "?? {}" usa objeto vazio
  const { Usuario_id, tipo, conteudo} = req.body ?? {};
  // Convertendo tipos e validando entradas:
  const uid = Number(Usuario_id);
  const temUidValido = Number.isInteger(uid) && uid > 0;
  const temConteudoValido = typeof conteudo === "string" && conteudo.trim() !== "";
  const t = Number(tipo);
  const temTipoValido = Number.isInteger(t) && (t == 0 || t == 1 || t == 2);
  if (!temUidValido || !temConteudoValido || !temTipoValido) {
    return res.status(400).json({
      erro:
        "Campos obrigatórios: Usuario_id (inteiro>0), tipo (inteiro - 0,1 ou 2 ) e conteudo (texto não nulo)",
    });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (Usuario_id, tipo, conteudo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [uid, t, conteudo.trim()]
    );
    // 201 Created + retornamos o chamado criado (inclui id gerado)
    res.status(201).json(rows[0]);
  } catch (e) {
    // Se a FK (Usuario_id) não existir, o Postgres lança erro 23503
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// SUBSTITUIR — PUT /api/posts/:id
// -----------------------------------------------------------------------------
// Objetivo: substituir TODOS os campos do post (representação completa).
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { Usuario_id, tipo, conteudo } = req.body ?? {};
  // Valida id
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  // Valida campos
  const uid = Number(Usuario_id);
  const temUidValido = Number.isInteger(uid) && uid > 0;
  const temConteudoValido = typeof conteudo === "string" && conteudo.trim() !== "";
  const temTipoValido = Number.isInteger(tipo) && (tipo == 0 || tipo == 1 || tipo == 2);
  if (!temUidValido || !temConteudoValido || !temTipoValido) {
    return res.status(400).json({
      erro:
        "Para PUT, envie todos os campos: Usuario_id (inteiro>0), tipo (interio - 0,1 ou 2) texto (string)",
    });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE posts
         SET Usuario_id = $1,
             tipo        = $2,
             conteudo    = $3,
             data_atualizacao = now()
       WHERE id = $4
       RETURNING *`,
      [uid, tipo, conteudo.trim(), id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); // 200 OK - post substituído
  } catch (e) {
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// ATUALIZAR — PATCH /api/posts/:id
// -----------------------------------------------------------------------------
// Objetivo: atualizar APENAS os campos enviados (parcial).
// Regras de validação:
// - Se enviar Usuarios_id, precisa ser inteiro > 0.
// - Se enviar texto, precisa ser string não vazia.
// - Se enviar estado, precisa ser 'a' ou 'f'.
// - Se não enviar nada, respondemos 400 (não há o que atualizar).
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { Usuario_id, tipo, conteudo } = req.body ?? {};
  // Valida id
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  // Se nenhum campo foi enviado, não faz sentido atualizar
  if (
    Usuario_id === undefined &&
    tipo === undefined &&
    conteudo === undefined 
  ) {
    return res.status(400).json({ erro: "envie ao menos um campo para atualizar" });
  }
  // Validar cada campo somente se ele foi enviado:
  let uid = null;
  if (Usuario_id !== undefined) {
    uid = Number(Usuario_id);
    if (!Number.isInteger(uid) || uid <= 0) {
      return res.status(400).json({ erro: "Usuario_id deve ser inteiro > 0" });
    }
  }
  let novoTipo = null;
  if (tipo !== undefined) {
    if (Number.isInteger(tipo) && (tipo == 0 || tipo == 1 || tipo == 2)) {
      return res.status(400).json({ erro: "tipo deve ser 0, 1 ou 2" });
    }
    novoTipo = tipo;
  }
  let novoConteudo = null;
  if (conteudo !== undefined) {
    if (typeof conteudo !== "string" || conteudo.trim() === "") {
      return res.status(400).json({ erro: "texto deve ser string não vazia" });
    }
    novoConteudo = conteudo.trim();
  }
  
  try {
    const { rows } = await pool.query(
      `UPDATE posts
         SET Usuario_id       = COALESCE($1, Usuario_id),
             tipo             = COALESCE($2, tipo)
             conteudo         = COALESCE($3, conteudo),
             data_atualizacao = now()
       WHERE id = $4
       RETURNING *`,
      [uid, novoTipo, novoConteudo, id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); // 200 OK - chamado atualizado parcialmente
  } catch (e) {
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// DELETAR — DELETE /api/posts/:id
// -----------------------------------------------------------------------------
// Objetivo: remover um post existente. Retorna 204 No Content se der certo.
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const r = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING id",
      [id]
    );
    if (!r.rowCount) return res.status(404).json({ erro: "não encontrado" });
    res.status(204).end(); // 204 = sucesso, sem corpo de resposta
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;
// -----------------------------------------------------------------------------
// COMO "MONTAR" ESTE ROUTER NO APP PRINCIPAL (exemplo):
// -----------------------------------------------------------------------------
// import express from "express";
// import chamadosRouter from "./routes/chamados.routes.js";
//
// const app = express();
// app.use(express.json());
// app.use("/api/chamados", chamadosRouter); // prefixo para todas as rotas acima
//
// app.listen(3000, () => console.log("Servidor rodando..."));
// -----------------------------------------------------------------------------
