SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS Usuarios (
  id                SERIAL       PRIMARY KEY,
  nome              VARCHAR(255) NOT NULL,
  usuario           VARCHAR(255) NOT NULL UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  senha_hash        VARCHAR(255) NOT NULL,
  papel             SMALLINT     NOT NULL CHECK (papel IN (0,1)),
  url_perfil_foto   VARCHAR(255),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS Posts (
  id                SERIAL       PRIMARY KEY,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE CASCADE,
  tipo              SMALLINT     NOT NULL CHECK (tipo IN (0,1,2)),
  conteudo          VARCHAR(255) NOT NULL,
  url_arquivo       VARCHAR(255),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Comentarios (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE SET NULL,
  conteudo          VARCHAR(255) NOT NULL,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Like_posts (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (post_id, Usuario_id)
);

CREATE TABLE IF NOT EXISTS Like_comentarios (
  id                SERIAL       PRIMARY KEY,
  comentario_id     INTEGER      NOT NULL REFERENCES Comentarios(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (comentario_id, Usuario_id)
);

CREATE TABLE IF NOT EXISTS Seguidores (
  id                SERIAL PRIMARY KEY,
  seguidor_id       INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguido_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (seguidor_id, seguido_id),
  CHECK (seguidor_id <> seguido_id)
);

INSERT INTO Usuarios (nome, usuario, email, senha_hash, papel, url_perfil_foto) VALUES
('Usuário', 'user', 'user@user.com.br', '123', 0,'https://picsum.photos/200?1'),
('Admin', 'adm',   'admin@admin.com.br', '123', 1, 'https://picsum.photos/200?1'),
('Maria Silva', 'maria', 'maria@email.com', '123', 0, 'https://picsum.photos/200?1'),
('João Pedro', 'joao', 'joao@email.com', '123', 0, 'https://picsum.photos/200?2'),
('Ana Clara', 'ana', 'ana@email.com', '123', 0, 'https://picsum.photos/200?3'),
('Carlos Souza', 'carlos', 'carlos@email.com', '123', 0, 'https://picsum.photos/200?4'),
('Beatriz Lima', 'bia', 'bia@email.com', '123', 0, 'https://picsum.photos/200?5');

INSERT INTO Posts (Usuario_id, tipo, conteudo) VALUES
(1, 0, 'Meu primeiro post'),
(2, 1, 'Olha essa imagem'),
(3, 0, 'Primeiro dia no novo emprego!'),
(4, 1, 'Compartilhando uma foto do pôr do sol 🌅'),
(5, 2, 'Vídeo engraçado do meu cachorro 🐶'),
(1, 0, 'Hoje li um livro incrível sobre programação'),
(2, 1, 'Olha essa arte digital que acabei de fazer 🎨');

INSERT INTO Comentarios (post_id, Usuario_id, conteudo) VALUES
(1, 2, 'Meuito legal'),
(2, 1, 'Ótimo'),
(3, 1, 'Muito fofo esse cachorro!'),
(3, 2, 'Hahaha, adorei 😂'),
(4, 3, 'Qual o nome do livro?'),
(5, 4, 'Ficou top demais, parabéns!'),
(2, 5, 'Esse pôr do sol é na praia?');

INSERT INTO Like_posts (post_id, Usuario_id) VALUES
(1, 2),
(2, 1),
(3, 2),
(3, 5),
(4, 1),
(4, 3),
(5, 4),
(5, 2);

INSERT INTO Like_comentarios (comentario_id, Usuario_id) VALUES
(1, 2),
(2, 1),
(3, 2),
(4, 5),
(5, 1);

INSERT INTO Seguidores (seguidor_id, seguido_id) VALUES
(1, 2),
(2, 1),
(3, 1),
(4, 2), 
(5, 3), 
(2, 5);