import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve('uploads');
// Garante que o diretório de uploads exista
fs.mkdirSync(uploadDir, { recursive: true });

// Validação de tipo de arquivo (MIME type)
const fileFilter = (req, file, cb) => {
    // req.body.tipo deve ser enviado ANTES do arquivo no FormData
    const tipoPost = req.body.tipo; 
    
    // Validação para FOTO DE PERFIL (se for essa a rota)
    if (req.originalUrl.includes('/api/usuarios/foto')) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Aceita imagem
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
        }
        return;
    }

    // Validação para POSTS
    if (tipoPost == 1) { // Imagem
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. O tipo 1 aceita apenas imagens.'), false);
        }
    } else if (tipoPost == 2) { // Vídeo
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. O tipo 2 aceita apenas vídeos.'), false);
        }
    } else {
        cb(new Error('Tipo de post inválido para upload de arquivo.'), false);
    }
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

// Configuração completa do Multer com validação
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Limite de 50MB (ajuste conforme necessário)
    }
});

export default upload;