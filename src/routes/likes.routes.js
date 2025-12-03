import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router();

router.post("/posts/:id", async (req, res) => {
    const post_id = Number(req.params.id);
    const usuario_id = req.user?.id; // ID do usuário logado

    if (!Number.isInteger(post_id) || post_id <= 0) {
        return res.status(400).json({ erro: "ID do post inválido" });
    }

    try {
        const { rowCount } = await pool.query(
            `INSERT INTO "Like_posts" ("post_id", "Usuario_id")
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`, 
            [post_id, usuario_id]
        );

        if (rowCount === 0) {
            return res.status(409).json({ erro: "Você já curtiu este post" });
        }

        res.status(201).json({ mensagem: "Post curtido com sucesso" });
    } catch (e) {
        if (e?.code === "23503") {
            return res.status(404).json({ erro: "Post não encontrado" });
        }
        res.status(500).json({ erro: "Erro interno" });
    }
});

router.delete("/posts/:id", async (req, res) => {
    const post_id = Number(req.params.id);
    const usuario_id = req.user?.id;

    if (!Number.isInteger(post_id) || post_id <= 0) {
        return res.status(400).json({ erro: "ID do post inválido" });
    }

    try {
        const { rowCount } = await pool.query(
            `DELETE FROM "Like_posts" 
             WHERE "post_id" = $1 AND "Usuario_id" = $2`,
            [post_id, usuario_id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ erro: "Like não encontrado ou já removido" });
        }

        res.status(204).end();
    } catch {
        res.status(500).json({ erro: "Erro interno" });
    }
});

router.post("/comentarios/:id", async (req, res) => {
    const comentario_id = Number(req.params.id);
    const usuario_id = req.user?.id;

    if (!Number.isInteger(comentario_id) || comentario_id <= 0) {
        return res.status(400).json({ erro: "ID do comentário inválido" });
    }

    try {
        const { rowCount } = await pool.query(
            `INSERT INTO "Like_comentarios" ("comentario_id", "Usuario_id")
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [comentario_id, usuario_id]
        );

        if (rowCount === 0) {
            return res.status(409).json({ erro: "Você já curtiu este comentário" });
        }

        res.status(201).json({ mensagem: "Comentário curtido com sucesso" });
    } catch (e) {
        if (e?.code === "23503") {
            return res.status(404).json({ erro: "Comentário não encontrado" });
        }
        res.status(500).json({ erro: "Erro interno" });
    }
});

router.delete("/comentarios/:id", async (req, res) => {
    const comentario_id = Number(req.params.id);
    const usuario_id = req.user?.id;

    try {
        const { rowCount } = await pool.query(
            `DELETE FROM "Like_comentarios" 
             WHERE "comentario_id" = $1 AND "Usuario_id" = $2`,
            [comentario_id, usuario_id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ erro: "Like não encontrado ou já removido" });
        }

        res.status(204).end();
    } catch {
        res.status(500).json({ erro: "Erro interno" });
    }
});

export default router;