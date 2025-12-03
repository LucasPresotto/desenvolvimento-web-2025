// src/routes/usuarios.routes.js
// ------------------------------------------------------------------------------------------
// Rotas de autenticação e registro de usuários usando JWT.
// - Access token (curto) vai no corpo da resposta e é usado pelo front no header Authorization.
// - Refresh token (longo) é guardado em cookie HttpOnly para rotação silenciosa de sessão.
// - Nenhum estado de sessão no servidor: validação por assinatura (stateless).
// Requer no .env: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES.
// ------------------------------------------------------------------------------------------

import { Router } from "express";         // Router do Express para definir as rotas deste módulo
import jwt from "jsonwebtoken";           // Biblioteca para assinar/verificar JSON Web Tokens (JWT)
import bcrypt from "bcryptjs";            // Biblioteca para hashing e verificação de senha
import dotenv from "dotenv";              // Carrega variáveis do .env em process.env
import { pool } from "../database/db.js"; // Pool do Postgres para consultas ao banco
import upload from "../config/multer.config.js";
import { authMiddleware } from "../middlewares/auth.js";
import { unlink } from 'node:fs/promises';

dotenv.config();                          // Inicializa dotenv (deixa segredos acessíveis via process.env)
const router = Router();                  // Cria um roteador isolado para montar em /api/usuarios (por exemplo)

const {
    JWT_ACCESS_SECRET,                      // Segredo para verificar/assinar o access token
    JWT_REFRESH_SECRET,                     // Segredo para verificar/assinar o refresh token
    JWT_ACCESS_EXPIRES = "15m",             // Tempo de vida do access token (ex.: "15m", "1h")
    JWT_REFRESH_EXPIRES = "7d",             // Tempo de vida do refresh token (ex.: "7d")
} = process.env;

const isProduction = process.env.NODE_ENV === "production";

const REFRESH_COOKIE = "refresh_token";           // Nome fixo do cookie HttpOnly que guarda o refresh
// 7 dias em ms (simples e suficiente; não depende de novas envs)
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;  // Max-Age do cookie para alinhamento aproximado

function signAccessToken(u) {
    // Assina um access token com dados mínimos para autorização no back (id/papel/nome)
    return jwt.sign({ sub: u.id, papel: u.papel, nome: u.nome, usuario: u.usuario, url_perfil_foto: u.url_perfil_foto }, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES,
    });
}
function signRefreshToken(u) {
    // Assina um refresh token identificando o usuário (sub) e marcando tipo "refresh"
    return jwt.sign({ sub: u.id, tipo: "refresh" }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES,
    });
}

function cookieOpts(req) {
    // Opções do cookie do refresh: HttpOnly (não acessível via JS do navegador),
    // SameSite=Lax (mitiga CSRF na maioria dos fluxos same-site), secure=false para desenvolvimento,
    // path limitado ao prefixo onde o router for montado (ex.: "/api/usuarios"),
    // e Max-Age para expiração no cliente.
    return {
        httpOnly: true,
        sameSite: "Lax",
        secure: isProduction,            // simples: HTTP em dev; quando for subir HTTPS, troque para true
        // Path define o prefixo de URL no qual o navegador anexa o cookie. 
        // Em Express, req.baseUrl é o caminho onde esse router foi montado; 
        // usar path: req.baseUrl faz o cookie só ir para as rotas desse módulo. 
        // Exemplo: se o router está em /api/usuarios, o cookie é enviado para 
        // /api/usuarios/login e /api/usuarios/refresh, mas não para /api/chamados/.... 
        // O || "/" é um fallback (caso não haja prefixo), tornando o cookie válido no site todo.
        path: req.baseUrl || "/",
        maxAge: REFRESH_MAX_AGE,
    };
}
function setRefreshCookie(res, req, token) {
    // Grava o refresh token em cookie HttpOnly com as opções acima
    res.cookie(REFRESH_COOKIE, token, cookieOpts(req));
}
function clearRefreshCookie(res, req) {
    // Remove o cookie de refresh (logout ou refresh inválido)
    res.clearCookie(REFRESH_COOKIE, cookieOpts(req));
}

router.post("/login", async (req, res) => {
    // Autentica por email/senha:
    // 1) busca usuário pelo email;
    // 2) compara senha com hash;
    // 3) emite access + refresh; o refresh vai no cookie HttpOnly.
    const { email, senha } = req.body ?? {};
    if (!email || !senha) return res.status(400).json({ erro: "email e senha são obrigatórios" });

    try {
        const r = await pool.query(
            `SELECT "id","nome","usuario","email","senha_hash","papel","url_perfil_foto" FROM "Usuarios" WHERE "email" = $1`,
            [email]
        );
        if (!r.rowCount) return res.status(401).json({ erro: "credenciais inválidas" });

        const user = r.rows[0];
        const ok = await bcrypt.compare(senha, user.senha_hash); // compara senha em texto com hash armazenado
        if (!ok) return res.status(401).json({ erro: "credenciais inválidas" });

        const access_token = signAccessToken(user);    // token curto para Authorization: Bearer
        const refresh_token = signRefreshToken(user);  // token longo para rotacionar sessão
        setRefreshCookie(res, req, refresh_token);  // grava refresh em cookie HttpOnly

        return res.json({
            token_type: "Bearer",
            access_token,
            expires_in: JWT_ACCESS_EXPIRES,
            user: { id: user.id, nome: user.nome, usuario: user.usuario, email: user.email, papel: user.papel, url_perfil_foto: user.url_perfil_foto },
        });
    } catch {
        return res.status(500).json({ erro: "erro interno" });
    }
});

router.post("/refresh", async (req, res) => {
    const refresh = req.cookies?.[REFRESH_COOKIE];
    if (!refresh) return res.status(401).json({ erro: "refresh ausente" });

    try {
        const payload = jwt.verify(refresh, JWT_REFRESH_SECRET);
        if (payload.tipo !== "refresh") return res.status(400).json({ erro: "refresh inválido" });

        const r = await pool.query(
            `SELECT "id","nome","usuario","email","papel","url_perfil_foto" FROM "Usuarios" WHERE "id" = $1`,
            [payload.sub]
        );
        if (!r.rowCount) return res.status(401).json({ erro: "usuário não existe mais" });

        const user = r.rows[0];
        const new_access = signAccessToken(user);      // novo access token curto

        return res.json({
            token_type: "Bearer",
            access_token: new_access,
            expires_in: JWT_ACCESS_EXPIRES,
        });
    } catch {
        // Se o refresh estiver inválido/expirado, apaga cookie para não “travar” o cliente
        clearRefreshCookie(res, req);
        return res.status(401).json({ erro: "refresh inválido ou expirado" });
    }
});

router.post("/register", upload.single("foto_perfil"), async (req, res) => {
    const { nome, usuario, email, senha} = req.body ?? {};
    const url_perfil_foto = req.file 
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` 
        : null;
    console.log("SEGREDO:", process.env.JWT_ACCESS_SECRET);
    if (!nome || !usuario || !email || !senha) {
        return res.status(400).json({ erro: "nome, usuario, email e senha são obrigatórios" });
    }
    if (String(senha).length < 6) {
        return res.status(400).json({ erro: "senha deve ter pelo menos 6 caracteres" });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, 12); 
        const papel = 0;

        const r = await pool.query(
            `INSERT INTO "Usuarios" ("nome","usuario","email","senha_hash","papel","url_perfil_foto")
             VALUES ($1,$2,$3,$4,$5,$6)
             RETURNING "id","nome","usuario","email","papel","url_perfil_foto"`,
            [String(nome).trim(), String(usuario).trim(), String(email).trim().toLowerCase(), senha_hash, papel, url_perfil_foto]
        );
        const user = r.rows[0];

        const access_token = signAccessToken(user);
        const refresh_token = signRefreshToken(user);
        setRefreshCookie(res, req, refresh_token);

        return res.status(201).json({
            token_type: "Bearer",
            access_token,
            expires_in: JWT_ACCESS_EXPIRES,
            user: { id: user.id, nome: user.nome, usuario: user.usuario, email: user.email, papel: user.papel },
        });
    } catch (err) {
        console.error("ERRO NO REGISTER:", err);
        if (err?.code === "23505") { // UNIQUE violation
             if (err.constraint.includes("email")) {
                return res.status(409).json({ erro: "email já cadastrado" });
            }
            if (err.constraint.includes("usuario")) {
                return res.status(409).json({ erro: "nome de usuário já cadastrado" });
            }
        }
        return res.status(500).json({ erro: "erro interno" });
    }
});

router.post("/logout", async (req, res) => {
    clearRefreshCookie(res, req);
    return res.status(204).end();
});

// Rota para upload da foto de perfil (protegida)
router.post("/foto", authMiddleware, upload.single("foto_perfil"), async (req, res) => {
    const uid = req.user?.id;
    if (!req.file) {
        return res.status(400).json({ erro: "Nenhum arquivo enviado no campo 'foto_perfil'" });
    }
    const url_perfil_foto = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    try {
        // (Opcional: buscar e deletar a foto de perfil antiga do disco)
        const { rows } = await pool.query(
            `UPDATE "Usuarios"
             SET "url_perfil_foto" = $1, "data_atualizacao" = now()
             WHERE "id" = $2
             RETURNING "id", "nome", "usuario", "email", "papel", "url_perfil_foto"`,
            [url_perfil_foto, uid]
        );
        if (!rows[0]) {
            if (req.file?.path) await unlink(req.file.path);
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.json(rows[0]);
    } catch (e) {
        if (req.file?.path) await unlink(req.file.path);
        res.status(500).json({ erro: e.message || "erro interno" });
    }
});

// PATCH /api/usuarios/me - Atualizar dados do próprio perfil (Nome e Bio)
router.patch("/me", authMiddleware, async (req, res) => {
    const { nome, bio } = req.body;
    const uid = req.user.id;

    try {
        const { rows } = await pool.query(
            `UPDATE "Usuarios"
             SET nome = COALESCE($1, nome),
                 bio = COALESCE($2, bio),
                 data_atualizacao = now()
             WHERE id = $3
             RETURNING id, nome, usuario, email, bio, url_perfil_foto`,
            [nome, bio, uid]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao atualizar perfil" });
    }
});

// GET /api/usuarios/search?q=termo
router.get("/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const { rows } = await pool.query(
            `SELECT id, nome, usuario, url_perfil_foto 
             FROM "Usuarios" 
             WHERE nome ILIKE $1 OR usuario ILIKE $1 
             LIMIT 10`,
            [`%${q}%`]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ erro: "Erro na busca" });
    }
});

// GET /api/usuarios/perfil/:id (Dados públicos + contadores)
router.get("/perfil/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ erro: "ID inválido" });

    try {
        const { rows } = await pool.query(
            `SELECT 
                u.id, u.nome, u.usuario, u.bio, u.url_perfil_foto, u.data_criacao,
                (SELECT COUNT(*)::int FROM "Seguidores" WHERE seguido_id = u.id) as "total_seguidores",
                (SELECT COUNT(*)::int FROM "Seguidores" WHERE seguidor_id = u.id) as "total_seguindo"
             FROM "Usuarios" u
             WHERE u.id = $1`,
            [id]
        );
        if (!rows[0]) return res.status(404).json({ erro: "Usuário não encontrado" });
        res.json(rows[0]);
    } catch {
        res.status(500).json({ erro: "Erro ao buscar perfil" });
    }
});

router.delete("/me", authMiddleware, async (req, res) => {
    const uid = req.user.id;
    try {
        const { rowCount } = await pool.query(
            `DELETE FROM "Usuarios" WHERE id = $1`,
            [uid]
        );
        
        if (rowCount === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
        
        // Remove o cookie de refresh
        res.clearCookie("refresh_token", { path: "/api/usuarios" });
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao excluir conta" });
    }
});

router.delete("/admin/:id", authMiddleware, async (req, res) => {
    const idAlvo = Number(req.params.id);
    const papel = req.user.papel; // 1 = Admin

    if (papel !== 1) {
        return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
    }

    try {
        const { rowCount } = await pool.query(
            `DELETE FROM "Usuarios" WHERE id = $1`,
            [idAlvo]
        );

        if (rowCount === 0) return res.status(404).json({ erro: "Usuário não encontrado" });
        
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro interno ao excluir usuário" });
    }
});

router.get("/sugestoes", authMiddleware, async (req, res) => {
    const uid = req.user.id;
    try {
        const { rows } = await pool.query(
            `SELECT u.id, u.nome, u.usuario, u.url_perfil_foto
             FROM "Usuarios" u
             WHERE u.id != $1 
             AND u.papel != 1 
             AND NOT EXISTS (
                SELECT 1 FROM "Seguidores" s 
                WHERE s.seguidor_id = $1 AND s.seguido_id = u.id
             )
             ORDER BY RANDOM()
             LIMIT 5`,
            [uid]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ erro: "Erro ao buscar sugestões" });
    }
});

export default router;             