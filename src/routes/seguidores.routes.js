import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router();

// -----------------------------------------------------------------------------
// SEGUIR UM USUÁRIO — POST /api/seguidores/:id
// (:id é o ID do usuário que eu quero seguir)
// -----------------------------------------------------------------------------
router.post("/:id", async (req, res) => {
    const seguido_id = Number(req.params.id);
    const seguidor_id = req.user?.id; // Eu (logado)

    if (!Number.isInteger(seguido_id) || seguido_id <= 0) {
        return res.status(400).json({ erro: "ID de usuário inválido" });
    }

    if (seguidor_id === seguido_id) {
        return res.status(400).json({ erro: "Você não pode seguir a si mesmo" });
    }

    try {
        const { rowCount } = await pool.query(
            `INSERT INTO "Seguidores" ("seguidor_id", "seguido_id")
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [seguidor_id, seguido_id]
        );

        if (rowCount === 0) {
            return res.status(409).json({ erro: "Você já segue este usuário" });
        }

        res.status(201).json({ mensagem: "Seguindo com sucesso" });
    } catch (e) {
        if (e?.code === "23503") {
            return res.status(404).json({ erro: "Usuário a ser seguido não existe" });
        }
        res.status(500).json({ erro: "Erro interno" });
    }
});

// -----------------------------------------------------------------------------
// DEIXAR DE SEGUIR — DELETE /api/seguidores/:id
// -----------------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
    const seguido_id = Number(req.params.id);
    const seguidor_id = req.user?.id;

    if (!Number.isInteger(seguido_id) || seguido_id <= 0) {
        return res.status(400).json({ erro: "ID de usuário inválido" });
    }

    try {
        const { rowCount } = await pool.query(
            `DELETE FROM "Seguidores" 
             WHERE "seguidor_id" = $1 AND "seguido_id" = $2`,
            [seguidor_id, seguido_id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ erro: "Você não segue este usuário" });
        }

        res.status(204).end();
    } catch {
        res.status(500).json({ erro: "Erro interno" });
    }
});

// -----------------------------------------------------------------------------
// VER QUEM O USUÁRIO SEGUE — GET /api/seguidores/:id/seguindo
// (Opcional: permite ver a lista de quem um usuário segue)
// -----------------------------------------------------------------------------
router.get("/:id/seguindo", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const { rows } = await pool.query(
            `SELECT u.id, u.nome, u.usuario, u.url_perfil_foto
             FROM "Seguidores" s
             JOIN "Usuarios" u ON s.seguido_id = u.id
             WHERE s.seguidor_id = $1`,
            [id]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ erro: "Erro interno" });
    }
});

// VER QUEM SEGUE O USUÁRIO (SEGUIDORES)
router.get("/:id/seguidores", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const { rows } = await pool.query(
            `SELECT u.id, u.nome, u.usuario, u.url_perfil_foto
             FROM "Seguidores" s
             JOIN "Usuarios" u ON s.seguidor_id = u.id
             WHERE s.seguido_id = $1`,
            [id]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ erro: "Erro interno" });
    }
});

export default router;