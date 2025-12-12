import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Limite global: vale para toda a API (proteção geral)
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,     // janela de 5 minutos
  limit: 300,                  // máx 300 requisições por IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { erro: "Muitas requisições. Tente novamente em alguns minutos." },
});

// Limite restrito para autenticação (Login/Registro)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // janela de 15 minutos
  limit: 10,                   // máx 10 tentativas por IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login/registro. Aguarde 15 minutos." },
});

export const userLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 min
  limit: 60,                  // 60 req/min
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user?.uid) return `uid:${req.user.uid}`;
    return ipKeyGenerator(req.ip); // <-- normaliza IPv4/IPv6 corretamente
  },
  message: { erro: "Você fez muitas requisições. Reduza o ritmo." },
});