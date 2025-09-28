\echo

\encoding UTF8

SET client_encoding = 'UTF8';

\set ON_ERROR_STOP ON

DROP DATABASE IF EXISTS redesocial_api_db;

CREATE DATABASE redesocial_api_db;

\connect redesocial_api_db

CREATE TABLE IF NOT EXISTS Usuarios (
  id                SERIAL       PRIMARY KEY,
  nome              VARCHAR(255) NOT NULL,
  usuario           VARCHAR(255) NOT NULL UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  senha_hash        VARCHAR(255) NOT NULL,
  papel             SMALLINT     NOT NULL CHECK (papel IN (0,1)),
  urlPerfilFoto     VARCHAR(255),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS Posts (
  id                SERIAL       PRIMARY KEY,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE CASCADE,
  tipo              SMALLINT     NOT NULL CHECK (tipo IN (0,1,2)),
  conteudo          VARCHAR(255) NOT NULL,
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
  post_id           INTEGER      NOT NULL UNIQUE REFERENCES Posts(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Like_comentarios (
  id                SERIAL       PRIMARY KEY,
  comentario_id     INTEGER      NOT NULL UNIQUE REFERENCES Comentarios(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Seguidores (
  id                SERIAL      PRIMARY KEY,
  Seguidor_id       INTEGER     NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  Usuario_id        INTEGER     NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Seguindo (
  id                SERIAL      PRIMARY KEY,
  Seguindo_id       INTEGER     NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  Usuario_id        INTEGER     NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP   NOT NULL DEFAULT now()
);

INSERT INTO Usuarios (nome, usuario, email, senha_hash, papel) VALUES
('Usuário', 'user', 'user@user.com.br', '123', 0),
('Admin', 'adm',   'admin@admin.com.br', '123', 1);

INSERT INTO Posts (Usuario_id, tipo, conteudo) VALUES
(1, 0, 'Meu primeiro post'),
(2, 1, 'Olha essa imagem');

INSERT INTO Comentarios (post_id, usuario_id, conteudo) VALUES
(1, 2, 'Meuito legal'),
(2, 1, 'Ótimo');

INSERT INTO Like_posts (post_id, usuario_id) VALUES
(1, 2),
(2, 1);

INSERT INTO Like_comentarios (comentario_id, usuario_id) VALUES
(1, 2),
(2, 1);

INSERT INTO Seguidores (Seguidor_id, Usuario_id) VALUES
(1, 2),
(2, 1);

INSERT INTO Seguindo (Seguindo_id, Usuario_id) VALUES
(1, 2),
(2, 1);