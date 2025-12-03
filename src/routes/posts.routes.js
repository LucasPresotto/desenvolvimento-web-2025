import { Router } from "express";
import { pool } from "../database/db.js";
import upload from "../config/multer.config.js"; 
import { unlink } from 'node:fs/promises'; 
import { authMiddleware } from "../middlewares/auth.js";
import path from "path";
const router = Router(); 

const uploadDir = path.resolve("uploads");

async function removerArquivoPorUrl(urlArquivo) {
    if (!urlArquivo) return;
    try {
        const nomeArquivo = urlArquivo.split('/').pop(); 
        const caminhoArquivo = path.join(uploadDir, nomeArquivo);
        await unlink(caminhoArquivo);
        console.log(`Arquivo removido: ${caminhoArquivo}`);
    } catch (err) {
        console.warn(`Erro ao remover arquivo (pode já não existir): ${err.message}`);
    }
}

router.get("/", async (_req, res) => {
  const uid = _req.user?.id || 0; 
  const { user_id, only_media, liked_by, feed_type, page = 1, limit = 10 } = _req.query;

  const limitNum = Number(limit);
  const offsetNum = (Number(page) - 1) * limitNum;

  let filtroWhere = [];
  let params = [];
  let paramCount = 1;

  if (user_id) {
    filtroWhere.push(`p."Usuario_id" = $${paramCount++}`);
    params.push(user_id);
  }
  else if (feed_type === 'following') {
    filtroWhere.push(`(
        EXISTS (SELECT 1 FROM "Seguidores" s WHERE s.seguido_id = p."Usuario_id" AND s.seguidor_id = $${paramCount})
        OR p."Usuario_id" = $${paramCount}
    )`);
    params.push(uid);
    paramCount++;
  }

  if (only_media === 'true') {
    filtroWhere.push(`(p.tipo = 1 OR p.tipo = 2)`);
  }

  if (liked_by) {
    filtroWhere.push(`EXISTS (SELECT 1 FROM "Like_posts" lp WHERE lp.post_id = p.id AND lp."Usuario_id" = $${paramCount++})`);
    params.push(liked_by);
  }

  let whereClause = filtroWhere.length > 0 ? 'WHERE ' + filtroWhere.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT 
        p.*, 
        u.nome as "autor_nome", 
        u.usuario as "autor_usuario", 
        u.url_perfil_foto as "autor_foto",
        (SELECT COUNT(*)::int FROM "Like_posts" WHERE post_id = p.id) as "total_likes",
        (SELECT COUNT(*)::int FROM "Comentarios" WHERE post_id = p.id) as "total_comentarios",
        EXISTS (SELECT 1 FROM "Like_posts" WHERE post_id = p.id AND "Usuario_id" = $${paramCount}) as "curtido_por_mim"
       FROM "Posts" p
       JOIN "Usuarios" u ON p."Usuario_id" = u.id
       ${whereClause}
       ORDER BY p.id DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, uid, limitNum, offsetNum]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "erro interno" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.user?.id || 0;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT 
        p.*, 
        u.nome as "autor_nome", 
        u.usuario as "autor_usuario", 
        u.url_perfil_foto as "autor_foto",
        (SELECT COUNT(*)::int FROM "Like_posts" WHERE post_id = p.id) as "total_likes",
        (SELECT COUNT(*)::int FROM "Comentarios" WHERE post_id = p.id) as "total_comentarios",
        EXISTS (SELECT 1 FROM "Like_posts" WHERE post_id = p.id AND "Usuario_id" = $2) as "curtido_por_mim"
       FROM "Posts" p
       JOIN "Usuarios" u ON p."Usuario_id" = u.id
       WHERE p.id = $1`,
      [id, uid]
    );
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });
    res.json(rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "erro interno" });
  }
});

router.get("/:id/comentarios", async (req, res) => {
    const id = Number(req.params.id);
    const uid = req.user?.id || 0;
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id de post inválido" });
    }
    try {
        const { rows } = await pool.query(
          `SELECT 
            c.*, 
            u.nome as "autor_nome", 
            u.usuario as "autor_usuario", 
            u.url_perfil_foto as "autor_foto",
            (SELECT COUNT(*)::int FROM "Like_comentarios" WHERE comentario_id = c.id) as "total_likes",
            EXISTS (SELECT 1 FROM "Like_comentarios" WHERE comentario_id = c.id AND "Usuario_id" = $2) as "curtido_por_mim"
           FROM "Comentarios" c
           JOIN "Usuarios" u ON c."Usuario_id" = u.id
           WHERE c.post_id = $1
           ORDER BY c.data_criacao ASC`,
          [id, uid]
        );
        res.json(rows);
    } catch (err){
      console.error(err);
      res.status(500).json({ erro: "erro interno" });
    }
});

router.post("/", upload.single("arquivo"), async (req, res) => {
  const { tipo, conteudo} = req.body ?? {};
  const uid = req.user?.id;
  const url_arquivo = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
  const t = Number(tipo);
  const temTipoValido = Number.isInteger(t) && (t >= 0 && t <= 2);
  const temConteudoValido = (t === 0) ? (typeof conteudo === "string" && conteudo.trim() !== "") : true;

  if (!temTipoValido || !temConteudoValido) {
    if (req.file?.path) await unlink(req.file.path); 
      return res.status(400).json({ erro: "Campos 'tipo' ou 'conteudo' inválidos" });
  }
    
  if ((t === 1 || t === 2) && !url_arquivo) {
       return res.status(400).json({ erro: `Tipo ${t} requer um upload de arquivo no campo 'arquivo'` });
  }
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
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { tipo, conteudo } = req.body ?? {};
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
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
    res.json(rows[0]); 
  } catch (e) {
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { tipo, conteudo } = req.body ?? {};
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  if (
    tipo === undefined &&
    conteudo === undefined 
  ) {
    return res.status(400).json({ erro: "envie ao menos um campo para atualizar" });
  }
  
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
    res.json(rows[0]); 
  } catch (e) {
    if (e?.code === "23503") {
      return res
        .status(400)
        .json({ erro: "Usuario_id não existe (violação de chave estrangeira)" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id inválido" });
  }
  try {
    const { rows } = await pool.query(
        `SELECT * FROM "Posts" WHERE id = $1`, 
        [id]
    );
    const post = rows[0];

    if (!post) return res.status(404).json({ erro: "Post não encontrado" });

    if (post.Usuario_id !== uid && !isAdmin) {
        return res.status(404).json({ erro: "Post não encontrado ou sem permissão" });
    }

    await pool.query(`DELETE FROM "Posts" WHERE id = $1`, [id]);

    if (post.url_arquivo) {
        await removerArquivoPorUrl(post.url_arquivo);
    }
    res.status(204).end(); 
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;
