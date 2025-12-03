import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router(); 
router.post("/", async (req, res) => {
  const { post_id, conteudo } = req.body ?? {};
  const uid = req.user?.id; 

  const pid = Number(post_id);
  const temPidValido = Number.isInteger(pid) && pid > 0;
  const temConteudoValido = typeof conteudo === "string" && conteudo.trim() !== "";

  if (!temPidValido || !temConteudoValido) {
    return res.status(400).json({
      erro: "Campos obrigatórios: post_id (inteiro>0) e conteudo (texto não nulo)",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO "Comentarios" ("post_id", "Usuario_id", "conteudo")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pid, uid, conteudo.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e?.code === "23503") { 
      return res.status(400).json({ erro: "post_id ou Usuario_id não existe" });
    }
    res.status(500).json({ erro: "erro interno" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { conteudo } = req.body ?? {};
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id de comentário inválido" });
  }
  if (typeof conteudo !== "string" || conteudo.trim() === "") {
    return res.status(400).json({ erro: "Para PUT, envie o campo: conteudo (string)" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE "Comentarios"
         SET "conteudo"    = $1,
             "data_atualizacao" = now()
       WHERE "id" = $2 AND
             ("Usuario_id" = $3 OR $4)
       RETURNING *`,
      [conteudo.trim(), id, uid, isAdmin]
    );
    if (!rows[0]) return res.status(404).json({ erro: "comentário não encontrado ou sem permissão" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ erro: "erro interno" });
  }
});

router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { conteudo } = req.body ?? {};
    const uid = req.user?.id;
    const isAdmin = req.user?.papel == 1;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "id de comentário inválido" });
    }
    if (conteudo === undefined) {
        return res.status(400).json({ erro: "envie ao menos o campo 'conteudo' para atualizar" });
    }
    if (typeof conteudo !== "string" || conteudo.trim() === "") {
        return res.status(400).json({ erro: "conteudo deve ser string não vazia" });
    }

    try {
        const { rows } = await pool.query(
          `UPDATE "Comentarios"
             SET "conteudo"         = COALESCE($1, "conteudo"),
                 "data_atualizacao" = now()
           WHERE "id" = $2 AND
                 ("Usuario_id" = $3 OR $4)
           RETURNING *`,
          [conteudo.trim(), id, uid, isAdmin]
        );
        if (!rows[0]) return res.status(404).json({ erro: "comentário não encontrado ou sem permissão" });
        res.json(rows[0]);
    } catch (e) {
        res.status(500).json({ erro: "erro interno" });
    }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.user?.id;
  const isAdmin = req.user?.papel == 1;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "id de comentário inválido" });
  }

  try {
    const r = await pool.query(
      `DELETE FROM "Comentarios" 
       WHERE "id" = $1 AND 
             ("Usuario_id" = $2 OR $3)
       RETURNING "id"`,
      [id, uid, isAdmin]
    );
    if (!r.rowCount) return res.status(404).json({ erro: "comentário não encontrado ou sem permissão" });
    res.status(204).end();
  } catch {
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;