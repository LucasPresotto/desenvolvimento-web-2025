import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const fileFilter = (req, file, cb) => {
    const tipoPost = req.body.tipo; 
    
    if (req.originalUrl.includes('/api/usuarios/foto') || req.originalUrl.includes('/api/usuarios/register')) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); 
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
        }
        return;
    }

    if (tipoPost == 1) { 
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. O tipo 1 aceita apenas imagens.'), false);
        }
    } else if (tipoPost == 2) { 
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

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 
    }
});

export default upload;