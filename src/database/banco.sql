SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS "Usuarios" (
  id                SERIAL       PRIMARY KEY,
  nome              VARCHAR(255) NOT NULL,
  usuario           VARCHAR(255) NOT NULL UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  bio               VARCHAR(255),
  senha_hash        VARCHAR(255) NOT NULL,
  papel             SMALLINT     NOT NULL CHECK (papel IN (0,1)),
  url_perfil_foto   VARCHAR(255),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Posts" (
  id                SERIAL       PRIMARY KEY,
  "Usuario_id"      INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  tipo              SMALLINT     NOT NULL CHECK (tipo IN (0,1,2)),
  conteudo          VARCHAR(255) NOT NULL,
  url_arquivo       VARCHAR(255),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Comentarios" (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE,
  "Usuario_id"      INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  conteudo          VARCHAR(255) NOT NULL,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Like_posts" (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE,
  "Usuario_id"      INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (post_id, "Usuario_id")
);

CREATE TABLE IF NOT EXISTS "Like_comentarios" (
  id                SERIAL       PRIMARY KEY,
  comentario_id     INTEGER      NOT NULL REFERENCES "Comentarios"(id) ON DELETE CASCADE,
  "Usuario_id"      INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (comentario_id, "Usuario_id")
);

CREATE TABLE IF NOT EXISTS "Seguidores" (
  id                SERIAL       PRIMARY KEY,
  seguidor_id       INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  seguido_id        INTEGER      NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (seguidor_id, seguido_id),
  CHECK (seguidor_id <> seguido_id)
);

CREATE TABLE IF NOT EXISTS "Denuncias" (
  id                SERIAL      PRIMARY KEY,
  denunciante_id    INTEGER     NOT NULL REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  usuario_id_denunciado INTEGER REFERENCES "Usuarios"(id) ON DELETE CASCADE,
  post_id           INTEGER     REFERENCES "Posts"(id)    ON DELETE CASCADE,
  comentario_id     INTEGER     REFERENCES "Comentarios"(id) ON DELETE CASCADE,
  motivo            TEXT        NOT NULL,
  data_criacao      TIMESTAMP   NOT NULL DEFAULT now(),
  CONSTRAINT alvo_valido CHECK (
    (usuario_id_denunciado IS NOT NULL AND post_id IS NULL AND comentario_id IS NULL) OR
    (usuario_id_denunciado IS NULL AND post_id IS NOT NULL AND comentario_id IS NULL) OR
    (usuario_id_denunciado IS NULL AND post_id IS NULL AND comentario_id IS NOT NULL)
  )
);

INSERT INTO "Usuarios" (nome, usuario, email, senha_hash, papel, url_perfil_foto, bio) VALUES
('Usuário Padrão', 'user', 'user@user.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0,'https://picsum.photos/200?1', 'Apenas um usuário comum.'),
('Administrador', 'adm',   'admin@admin.com.br', '$2b$12$betIdHxSj73FmjmGGN6z.Oj9yzKXzA7/Bv/rPXjVcFyTS/c9VOXza', 1, 'https://picsum.photos/200?2', 'Gerente do sistema wYZe.'),
('Maria Silva', 'maria', 'maria@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?3', 'Designer e fotógrafa amadora.'),
('João Pedro', 'joao', 'joao@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?4', 'Desenvolvedor Fullstack.'),
('Ana Clara', 'ana', 'ana@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?5', 'Amante de livros e café.'),
('Carlos Souza', 'carlos', 'carlos@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?6', 'Viajante do mundo.'),
('Beatriz Lima', 'bia', 'bia@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?7', 'Estudante de arquitetura.'),
('Lucas Ferreira', 'lucasf', 'lucasf@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?8', 'Apaixonado por tecnologia e música.'),
('Julia Mendes', 'juliamm', 'julia@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?9', 'Amante de natureza e trilhas.'),
('Ricardo Alves', 'ricardo', 'ricardo@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?10', 'Designer UX/UI.'),
('Fernanda Rocha', 'fernanda', 'ferrocha@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?11', 'Nutricionista e criadora de conteúdo.'),
('Paulo Henrique', 'paulo', 'paulo@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?12', 'Gamedev e streamer nas horas vagas.'),
('Sara Oliveira', 'saraol', 'sara@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?13', 'Professora e apaixonada por livros.'),
('Thiago Ramos', 'thiramos', 'thiago@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 0, 'https://picsum.photos/200?14', 'Futuro cientista de dados.');

INSERT INTO "Posts" ("Usuario_id", tipo, conteudo, url_arquivo) VALUES
(1, 0, 'Meu primeiro post', NULL),
(2, 1, 'Olha essa imagem', NULL),
(3, 0, 'Primeiro dia no novo emprego!', NULL),
(4, 1, 'Compartilhando uma foto do pôr do sol 🌅', NULL),
(5, 2, 'Vídeo engraçado do meu cachorro 🐶', NULL),
(1, 0, 'Hoje li um livro incrível sobre programação', NULL),
(2, 1, 'Olha essa arte digital que acabei de fazer 🎨', NULL),
(8, 0, 'Hoje comecei um novo projeto em Node.js!', NULL),
(9, 1, 'Foto da trilha de hoje 🌄', 'https://picsum.photos/500?1'),
(10, 0, 'Novo protótipo de UI finalizado!', NULL),
(11, 2, 'Vídeo rápido sobre alimentação saudável 🍎', 'https://videos.com/saude1'),
(12, 0, 'Zerei um jogo novo ontem! 🔥', NULL),
(13, 1, 'Minha estante de livros nova 📚', 'https://picsum.photos/500?2'),
(14, 0, 'Treinando modelos de Machine Learning hoje...', NULL),
(8, 1, 'Olhem essa paisagem incrível!', 'https://picsum.photos/500?3'),
(12, 2, 'Clipes das lives de ontem 😎', 'https://videos.com/liveclips'),
(9, 0, 'Hoje aprendi algo novo sobre fotografia!', NULL);

INSERT INTO "Comentarios" (post_id, "Usuario_id", conteudo) VALUES
(1, 2, 'Meuito legal'),
(2, 1, 'Ótimo'),
(3, 1, 'Muito fofo esse cachorro!'),
(3, 2, 'Hahaha, adorei 😂'),
(4, 3, 'Qual o nome do livro?'),
(5, 4, 'Ficou top demais, parabéns!'),
(2, 5, 'Esse pôr do sol é na praia?'),
(8, 9, 'Boa sorte no projeto!'),
(9, 8, 'Que lugar lindo!'),
(10, 11, 'Ficou muito bom!'),
(11, 13, 'Conteúdo excelente, parabéns!'),
(12, 14, 'Qual jogo?'),
(13, 10, 'Sua estante está incrível!'),
(14, 8, 'Quais modelos você está treinando?'),
(9, 12, 'Quero visitar esse lugar também!'),
(10, 14, 'Qual ferramenta usou no protótipo?'),
(11, 9, 'Vou testar essa receita!');

INSERT INTO "Like_posts" (post_id, "Usuario_id") VALUES
(1, 2), (2, 1), (3, 2), (3, 5), (4, 1), (4, 3), (5, 4), (5, 2), (8, 10), (8, 11),
(9, 12), (9, 14), (9, 8),
(10, 13), (10, 9),
(11, 8), (11, 12), (11, 14),
(12, 9),
(13, 8), (13, 12),
(14, 10), (14, 11), (14, 13);

INSERT INTO "Like_comentarios" (comentario_id, "Usuario_id") VALUES
(1, 2), (2, 1), (3, 2), (4, 5), (5, 1), (8, 12),
(9, 11),
(10, 14),
(11, 9),
(12, 10),
(13, 13),
(14, 12),
(15, 8),
(16, 14),
(17, 11);

INSERT INTO "Seguidores" (seguidor_id, seguido_id) VALUES
(1, 2), (2, 1), (3, 1), (4, 2), (5, 3), (2, 5), (8, 1), (8, 2), (8, 10),
(9, 3), (9, 8),
(10, 4), (10, 13),
(11, 5),
(12, 14), (12, 9),
(13, 8), (13, 6),
(14, 1), (14, 12), (14, 9);

INSERT INTO "Denuncias" (denunciante_id, usuario_id_denunciado, motivo) VALUES
(8, 12, 'Comportamento inadequado no chat.'),
(9, 3, 'Publicação ofensiva.'),
(10, 5, 'Spam recorrente.'),
(11, 2, 'Comentário desrespeitoso.'),
(13, 14, 'Atividade suspeita detectada.');

INSERT INTO "Denuncias" (denunciante_id, post_id, motivo) VALUES
(12, 9, 'Conteúdo enganoso.'),
(14, 10, 'Imagem imprópria.');

INSERT INTO "Denuncias" (denunciante_id, comentario_id, motivo) VALUES
(9, 14, 'Comentário tóxico.'),
(8, 16, 'Resposta agressiva.');