import { Router } from "express";
import { pool } from "../database/db.js";
import upload from "../config/multer.config.js"; // Importa a config do multer
import { unlink } from 'node:fs/promises'; // Para apagar arquivos em caso de erro
const router = Router(); // cria o "mini-app" de rotas
// -----------------------------------------------------------------------------
// LISTAR — GET /api/posts
// -----------------------------------------------------------------------------
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.nome as "autor_nome", u.usuario as "autor_usuario", u.url_perfil_foto as "autor_foto"
       FROM "Posts" p
       JOIN "Usuarios" u ON p."Usuario_id" = u.id
       ORDER BY p.id DESC`
    );
    res.json(rows); 
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});
// -----------------------------------------------------------------------------
// MOSTRAR — GET /api/posts/:id
// -----------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  // req.params.id é string → converter p/ número
  const id = Number(req.params.id);
  // Validar: precisa ser inteiro e > 0
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.nome as "autor_nome", u.usuario as "autor_usuario", u.url_perfil_foto as "autor_foto"
       FROM "Posts" p
       JOIN "Usuarios" u ON p."Usuario_id" = u.id
       WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); // 200 OK (um objeto)
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});

// -----------------------------------------------------------------------------
// LISTAR COMENTÁRIOS DE UM POST — GET /api/posts/:id/comentarios
// (Nova rota para o Recurso 2)
// -----------------------------------------------------------------------------
router.get("/:id/comentarios", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id de post inválido" });
    }
    try {
        const { rows } = await pool.query(
          `SELECT c.*, u.nome as "autor_nome", u.usuario as "autor_usuario", u.url_perfil_foto as "autor_foto"
           FROM "Comentarios" c
           JOIN "Usuarios" u ON c."Usuario_id" = u.id
           WHERE c.post_id = $1
           ORDER BY c.data_criacao ASC`,
          [id]
        );
        // Retorna lista vazia se não houver comentários, não um erro
        res.json(rows);
    } catch {
        res.status(500).json({ erro: "erro interno" });
    }
});

// -----------------------------------------------------------------------------
// CRIAR — POST /api/posts
// -----------------------------------------------------------------------------
router.post("/", upload.single("arquivo"), async (req, res) => {
  // Se req.body vier undefined (cliente não mandou JSON), "?? {}" usa objeto vazio
  const { tipo, conteudo} = req.body ?? {};
  // Convertendo tipos e validando entradas:
  const uid = req.user?.id;
  // Obtenha a URL do arquivo, se houver upload
  const url_arquivo = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
  const t = Number(tipo);
  const temTipoValido = Number.isInteger(t) && (t >= 0 && t <= 2);
  // Conteúdo é obrigatório apenas para tipo 0 (texto)
  const temConteudoValido = (t === 0) ? (typeof conteudo === "string" && conteudo.trim() !== "") : true;

  if (!temTipoValido || !temConteudoValido) {
    if (req.file?.path) await unlink(req.file.path); // Limpa o arquivo se a validação falhar
      return res.status(400).json({ erro: "Campos 'tipo' ou 'conteudo' inválidos" });
  }
    
  // Validação de arquivo:
  // Se for tipo 1 ou 2, o arquivo é obrigatório
  if ((t === 1 || t === 2) && !url_arquivo) {
       return res.status(400).json({ erro: `Tipo ${t} requer um upload de arquivo no campo 'arquivo'` });
  }
  // Se for tipo 0, o arquivo não é permitido
  if (t === 0 && url_arquivo) {
      if (req.file?.path) await unlink(req.file.path);
      return res.status(400).json({ erro: "Tipo 0 (texto) não permite upload de arquivo" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO "Posts" ("Usuario_id", "tipo", "conteudo", "url_arquivo")
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [uid, t, conteudo?.trim() ?? null, url_arquivo]
    );
    // 201 Created + retornamos o post criado (inclui id gerado)
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
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { tipo, conteudo } = req.body ?? {};
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  // Valida id
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  // Valida campos
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
      `UPDATE "Posts"
         SET "tipo"        = $1,
             "conteudo"    = $2,
             "data_atualizacao" = now()
       WHERE "id" = $3 AND
             ("Usuario_id" = $4 OR $5)
       RETURNING *`,
      [tipo, conteudo.trim(), id, uid, isAdmin]
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
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { tipo, conteudo } = req.body ?? {};
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  // Valida id
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  // Se nenhum campo foi enviado, não faz sentido atualizar
  if (
    tipo === undefined &&
    conteudo === undefined 
  ) {
    return res.status(400).json({ erro: "envie ao menos um campo para atualizar" });
  }
  // Validar cada campo somente se ele foi enviado:
  
  let novoTipo = null;
  if (tipo !== undefined) {
    const t = Number(tipo);
    if (Number.isInteger(tipo) && (tipo == 0 || tipo == 1 || tipo == 2)) {
      return res.status(400).json({ erro: "tipo deve ser 0, 1 ou 2" });
    }
    novoTipo = t;
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
      `UPDATE "Posts"
         SET "tipo"             = COALESCE($1, "tipo"),
             "conteudo"         = COALESCE($2, "conteudo"),
             "data_atualizacao" = now()
       WHERE "id" = $3 AND
             ("Usuario_id" = $4 OR $5)
       RETURNING *`,
      [novoTipo, novoConteudo, id, uid, isAdmin]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); // 200 OK - post atualizado parcialmente
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
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const r = await pool.query(
      `DELETE FROM "Posts" 
       WHERE "id" = $1 AND
             ("Usuario_id" = $2 OR $3)
       RETURNING "id"`,
      [id, uid, isAdmin]
    );
    if (!r.rowCount) return res.status(404).json({ erro: "não encontrado" });
    res.status(204).end(); // 204 = sucesso, sem corpo de resposta
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;
