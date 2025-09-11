# wYZe

## 1) Problema
Muitos estudantes e pequenos grupos precisam compartilhar ideias, reflexões e discussões em um espaço simples e organizado.
Objetivo inicial: fornecer um espaço simples e seguro para escrever posts e trocar comentários, sem distrações externas.

## 2) Atores e Decisores (quem usa / quem decide)
Visitantes (leem posts públicos)
Usuários cadastrados (escrevem posts e comentários)
Administrador (mantém moderação dos conteúdos)

## 3) Casos de uso (de forma simples)
Todos: Registrar, logar/deslogar no sistema; Manter dados cadastrais.

Usuário logado:

Manter (inserir, mostrar, editar, remover) seus próprios posts.

Manter (inserir, mostrar, editar, remover) seus comentários.

Administrador:

Manter (listar, mostrar, editar, remover) todos os posts.

Manter (listar, mostrar, editar, remover) todos os comentários.

Visitante: Visualizar posts e comentários (somente leitura).

## 4) Limites e suposições
Limites: entrega final até o fim da disciplina (ex.: 2025-11-30); rodar no navegador; não usar serviços pagos.

Suposições: internet disponível em laboratório; GitHub acessível; banco de dados remoto acessível; 10 min disponíveis para teste rápido.

Plano B: sem internet → rodar local com SQLite e salvar dados em arquivo; sem tempo do professor → testar com 3 colegas.

## 5) Hipóteses + validação
Valor: Se os usuários puderem criar posts e trocar comentários em um espaço dedicado, terão mais organização e clareza nas discussões do que em redes sociais.

Validação: teste com 5 usuários; sucesso se ≥4 conseguirem criar post, comentar e editar sem ajuda.

Viabilidade: Com app web (React + Express + banco em nuvem), criar e listar posts e comentários deve responder em menos de 1 segundo em 9 de cada 10 ações.

Validação: medir no protótipo com 30 ações; meta: pelo menos 27/30 em até 1s.

## 6) Fluxo principal e primeira fatia
Fluxo principal

Usuário cria conta e faz login.

Usuário acessa página de posts.

Usuário cria um post.

Outros usuários comentam no post.

Usuário pode editar ou remover seus posts/comentários.

Administrador pode moderar conteúdos.

Primeira fatia vertical
Inclui: login simples, criar post, listar posts, criar comentário.
Critérios de aceite:

Post criado → aparece na lista com título, autor e data.

Comentário criado → aparece vinculado ao post.

Logout → usuário não consegue mais criar/editar posts ou comentários.

## 7) Esboços de algumas telas (wireframes)
Login/Registro

Lista de posts (título, autor, data, nº de comentários)

Detalhes do post (conteúdo + comentários listados)

Criar post (formulário simples)

Criar comentário (campo embaixo do post)

Painel do admin (listar/remover posts e comentários)

## 8) Tecnologias

### 8.1 Navegador
**Navegador:** HTML/CSS/JS/Bootstrap  
**Armazenamento local:**   
**Hospedagem:** Github Pages

### 8.2 Front-end (servidor de aplicação, se existir)
**Front-end:** React  
**Hospedagem:** Github Pages

### 8.3 Back-end (API/servidor, se existir)
**Back-end (API):** JavaScript com Express 
**Banco de dados:** MySQL ou Postgres
**Deploy do back-end:** Estudar onde irei fazer.

## 9) Plano de Dados (Dia 0) — somente itens 1–3
<!-- Defina só o essencial para criar o banco depois. -->

### 9.1 Entidades
Usuário — pessoa que usa o sistema (autor de posts/comentários).

Post — texto criado por um usuário.

Comentário — resposta vinculada a um post.

### 9.2 Campos por entidade

### Usuario
| Campo           | Tipo                          | Obrigatório | Exemplo            |
|-----------------|-------------------------------|-------------|--------------------|
| id              | número                        | sim         | 1                  |
| nome            | texto                         | sim         | "Ana Souza"        |
| email           | texto                         | sim (único) | "ana@exemplo.com"  |
| senha_hash      | texto                         | sim         | "$2a$10$..."       |
| papel           | número (0=usuario, 1=admin)   | sim         | 0                  |
| dataCriacao     | data/hora                     | sim         | 2025-08-20 14:30   |
| dataAtualizacao | data/hora                     | sim         | 2025-08-20 15:10   |

### Categoria
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 3                       |
| nome            | texto              | sim         | "Tecnologia"            |
| descricao       | texto              | sim         | "Categoria..."          |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |

### Post
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| Usuario_id      | número (fk)        | sim         | 1                       |
| categoria_id    | número (fk)        | não         | 3                       |
| titulo          | texto              | sim         | "Dicas para React"      |
| conteudo        | texto              | sim         | "React é..."            |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |
| dataAtualizacao | data/hora          | sim         | 2025-08-20 14:50        |

### Comentario
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| Usuario_id      | número (fk)        | sim         | 1                       |
| post_id         | numero (fk)        | sim         | 5                       |
| conteudo        | texto              | sim         | "Ótimo, obrigado!"      |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |
| dataAtualizacao | data/hora          | sim         | 2025-08-20 14:50        |

### Like_posts
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| Usuario_id      | número (fk)        | sim         | 1                       |
| post_id         | numero (fk)        | sim         | 5                       |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |

### Like_comentarios
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| Usuario_id      | número (fk)        | sim         | 1                       |
| comentario_id   | numero (fk)        | sim         | 5                       |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |

### 9.3 Relações entre entidades
- Um Usuário tem muitos Posts (1→N).

- Um Post pertence a um Usuário (N→1).

- Um Post tem muitos Comentários (1→N).

- Um Comentário pertence a um Usuário e a um Post (N→1).

- Um Post pertence a 0 ou muitas Categoria (N→1).

- Um Post pode ter muitas Curtidas (N→1).

- Um Comentário pode ter muitas Curtidas (N→1).

- Um Usuário pode curtir vários posts e comentários (N→1).

### 9.4 Modelagem do banco de dados no POSTGRES

```sql
CREATE TABLE Usuarios (
  id                SERIAL       PRIMARY KEY,
  nome              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  senha_hash        VARCHAR(255) NOT NULL,
  papel             SMALLINT     NOT NULL CHECK (papel IN (0,1)),
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE Categorias (
  id                SERIAL       PRIMARY KEY,
  nome              VARCHAR(255) NOT NULL UNIQUE,
  descricao         VARCHAR(255) NOT NULL,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE Posts (
  id                SERIAL       PRIMARY KEY,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE CASCADE,
  categoria_id      INTEGER      REFERENCES Categoria(id) ON DELETE SET NULL,
  titulo            VARCHAR(255) NOT NULL,
  conteudo          VARCHAR(255) NOT NULL,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE Comentarios (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL REFERENCES Usuarios(id) ON DELETE SET NULL,
  conteudo          VARCHAR(255) NOT NULL,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  data_atualizacao  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE Like_posts (
  id                SERIAL       PRIMARY KEY,
  post_id           INTEGER      NOT NULL UNIQUE REFERENCES Posts(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE Like_comentarios (
  id                SERIAL       PRIMARY KEY,
  comentario_id     INTEGER      NOT NULL UNIQUE REFERENCES Comentarios(id) ON DELETE CASCADE,
  Usuario_id        INTEGER      NOT NULL UNIQUE REFERENCES Usuarios(id) ON DELETE CASCADE,
  data_criacao      TIMESTAMP    NOT NULL DEFAULT now()
);

INSERT INTO Usuarios (nome, email, senha_hash, papel) VALUES
('Usuário', 'user@user.com.br', '123', 0),
('Admin',   'admin@admin.com.br', '123', 1);

INSERT INTO Categorias (nome, descricao) VALUES
('Tecnologia', 'Categoria sobre...'),
('Entreterimento', 'descricao');

INSERT INTO Posts (Usuario_id, categoria_id, titulo, conteudo) VALUES
(1, 2, 'Primeiro Post', 'Meu primeiro post'),
(2, 1, 'Imagem', 'Olha essa imagem');

INSERT INTO Comentarios (post_id, usuario_id, conteudo) VALUES
(1, 2, 'Meuito legal'),
(2, 1, 'Ótimo');

INSERT INTO Like_posts (post_id, usuario_id) VALUES
(1, 2),
(2, 1);

INSERT INTO Like_comentarios (comentario_id, usuario_id) VALUES
(1, 2),
(2, 1);
```
