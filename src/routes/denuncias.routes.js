import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router();

router.post("/", async (req, res) => {
    const { post_id, comentario_id, usuario_id, motivo } = req.body;
    const denunciante_id = req.user.id;

    if (!motivo) return res.status(400).json({ erro: "Motivo é obrigatório" });

    try {
        await pool.query(
            `INSERT INTO "Denuncias" (denunciante_id, post_id, comentario_id, usuario_id_denunciado, motivo)
             VALUES ($1, $2, $3, $4, $5)`,
            [denunciante_id, post_id || null, comentario_id || null, usuario_id || null, motivo]
        );
        res.status(201).json({ mensagem: "Denúncia enviada com sucesso." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao criar denúncia." });
    }
});

router.get("/", async (req, res) => {
    if (req.user.papel !== 1) return res.status(403).json({ erro: "Sem permissão." });

    try {
        const { rows } = await pool.query(`
            SELECT 
                d.id, d.motivo, d.data_criacao,
                u_denunciante.nome as denunciante_nome,
                -- Info se for POST
                p.conteudo as post_conteudo,
                p.url_arquivo as post_midia,
                p.id as target_post_id,
                -- Info se for COMENTÁRIO
                c.conteudo as comentario_conteudo,
                c.id as target_comentario_id,
                -- Info se for USUÁRIO
                u_alvo.nome as usuario_alvo_nome,
                u_alvo.usuario as usuario_alvo_user,
                u_alvo.id as target_usuario_id
            FROM "Denuncias" d
            JOIN "Usuarios" u_denunciante ON d.denunciante_id = u_denunciante.id
            LEFT JOIN "Posts" p ON d.post_id = p.id
            LEFT JOIN "Comentarios" c ON d.comentario_id = c.id
            LEFT JOIN "Usuarios" u_alvo ON d.usuario_id_denunciado = u_alvo.id
            ORDER BY d.data_criacao DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao buscar denúncias." });
    }
});

router.delete("/:id", async (req, res) => {
    if (req.user.papel !== 1) return res.status(403).json({ erro: "Sem permissão." });
    const id = Number(req.params.id);

    try {
        await pool.query(`DELETE FROM "Denuncias" WHERE id = $1`, [id]);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ erro: "Erro ao excluir denúncia." });
    }
});

export default router;