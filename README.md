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

Outros usuários curtem e comentam no post.

Usuários podem seguir outros usuários.

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
**Banco de dados:** Postgres
**Deploy do back-end:** Estudar onde irei fazer.

## 9) Plano de Dados (Dia 0) — somente itens 1–3

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
| usuario         | texto                         | sim         | "ana_souza"        |
| email           | texto                         | sim (único) | "ana@exemplo.com"  |
| senha_hash      | texto                         | sim         | "$2a$10$..."       |
| papel           | número (0=usuario, 1=admin)   | sim         | 0                  |
| url_perfil_foto | texto                         | nao         | "fgdsfsafag"
| dataCriacao     | data/hora                     | sim         | 2025-08-20 14:30   |
| dataAtualizacao | data/hora                     | sim         | 2025-08-20 15:10   |

### Post
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| Usuario_id      | número (fk)        | sim         | 1                       |
| tipo            | número             | sim         | "0"                     |
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

### Seguidores
| Campo           | Tipo               | Obrigatório | Exemplo                 |
|-----------------|--------------------|-------------|-------------------------|
| id              | número             | sim         | 2                       |
| idSeguindo      | número (fk)        | sim         | 1                       |
| idSeguidor      | numero (fk)        | sim         | 5                       |
| dataCriacao     | data/hora          | sim         | 2025-08-20 14:35        |


### 9.3 Relações entre entidades
- Um Usuário tem muitos Posts (1→N).

- Um Post pertence a um Usuário (N→1).

- Um Post tem muitos Comentários (1→N).

- Um Comentário pertence a um Usuário e a um Post (N→1).

- Um Post pode ter muitas Curtidas (N→1).

- Um Comentário pode ter muitas Curtidas (N→1).

- Um Usuário pode curtir vários posts e comentários (N→1).

- Um Usuário pode seguir vários Usuários.

- Um Usuário pode ser seguido por vários Usuários.

### 9.4 Modelagem do banco de dados no POSTGRES

```sql
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

INSERT INTO Usuarios (nome, usuario, email, senha_hash, papel) VALUES
('Usuário', 'user', 'user@user.com.br', '123', 0),
('Admin', 'adm',   'admin@admin.com.br', '123', 1),
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

INSERT INTO Comentarios (post_id, usuario_id, conteudo) VALUES
(1, 2, 'Meuito legal'),
(2, 1, 'Ótimo'),
(3, 1, 'Muito fofo esse cachorro!'),
(3, 2, 'Hahaha, adorei 😂'),
(4, 3, 'Qual o nome do livro?'),
(5, 4, 'Ficou top demais, parabéns!'),
(2, 5, 'Esse pôr do sol é na praia?');

INSERT INTO Like_posts (post_id, usuario_id) VALUES
(1, 2),
(2, 1),
(3, 2),
(3, 5),
(4, 1),
(4, 3),
(5, 4),
(5, 2);

INSERT INTO Like_comentarios (comentario_id, usuario_id) VALUES
(1, 2),
(2, 1),
(3, 2),
(4, 5),
(5, 1);

INSERT INTO Seguidores (Seguidor_id, Usuario_id) VALUES
(1, 2),
(2, 1),
(3, 1),
(4, 2), 
(5, 3), 
(2, 5);
```
## 🔧 Como rodar localmente (passo a passo)

### 1) Pré-requisitos
- **Node.js** instalado (versão LTS recomendada sendo versão 18 ou superior)  
- **PostgreSQL** rodando localmente (versão 14 ou superior)
- **Express.js** instalado

### 2) Criar arquivo `.env` na raiz do projeto e ajustar as variáveis
```env
#PORTA DO SERVIDOR DO EXPRESS
PORT=3000

# CONFIGURAÇÃO POSTGRES
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha
DB_DATABASE=redesocial_api_db
PG_DATABASE_ADMIN=postgres
DB_DATABASE_ADMIN_PASSWORD=senha

# CAMINHO PARA O SQL DO BANCO EM POSTGRES
PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
```

### 3) Instalar dependências 
```bash
npm install
```

### 4) Criar o banco de dados
- Ajuste o caminho para o arquivo psql no .env.  
- Ajuste usuário/senha/porta conforme o seu Postgres.
- Execute o seguinte script para criar e popular o banco de dados e depois para iniciar

```bash
npm run reset-database
npm run dev   # ou: node server.js / npm start (conforme seu package.json)
```

### 5) Porta Padrão
O servidor será executado por padrão na porta 3000. Você pode acessá-lo em http://localhost:3000.

### 6) Variáveis de Ambiente
O arquivo .env é necessário para configurar a conexão com o banco de dados e a porta do servidor.

| Variável        | Descrição          | Exemplo                 |
|-----------------|--------------------|-------------------------|
| PORT              | A porta em que o servidor Express irá rodar. | 3000 |
| DB_HOST      | O endereço do servidor do banco de dados.	 | localhost         |
| DB_PORT         | A porta do servidor do banco de dados.	 | 5432          |
| DB_USER        | O nome de usuário para conectar ao banco.	 | postgres          |
| DB_PASSWORD     | A senha para o usuário do banco de dados. (Deve ser alterada no .env)	 | senha          |
| DB_DATABASE | O nome do banco de dados da aplicação. | redesocial_api_db         |
| DB_DATABASE_ADMIN_PASSWORD | A senha do superusuário do Postgres, usada pelo script de reset. (Deve ser alterada no .env) | senha      |
| PSQL_PATH | (Opcional) Caminho completo para o executável psql.exe no Windows, caso não esteja no PATH do sistema.	 | C:\...\psql.exe     |

### 7) Endpoints da API
Abaixo está a tabela com os endpoints disponíveis para o recurso de Posts.

| Método   | Rota             | Descrição               | Respostas (JSON)  |
|----------|------------------|-------------------------|-------------------|  
| GET      | /api/posts	      | Lista todos os posts.   |200 OK: [{ "id": 1, "usuario_id": 1, ... }] 500 Internal Server Error: { "erro": "erro interno" } |
| GET      | /api/posts/:id	  | Mostra um post específico pelo ID. | 200 OK: { "id": 1, "usuario_id": 1, ... } 404 Not Found: { "erro": "não encontrado" } |
| POST     | /api/posts	      | Cria um novo post. | 201 Created: { "id": 8, ... } 400 Bad Request: { "erro": "Campos obrigatórios..." } |
| PUT      | /api/posts/:id   | Substitui completamente um post existente. | 200 OK: { "id": 1, ... } (com dados atualizados) 404 Not Found: { "erro": "não encontrado" } |
| PATCH    | /api/posts/:id   | Atualiza parcialmente um post existente. | 200 OK: { "id": 1, ... } (com dados atualizados) 400 Bad Request: { "erro": "envie ao menos um campo..." } |
| DELETE   | /api/posts/:id   | Deleta um post pelo ID. | 204 No Content (sem corpo de resposta) 404 Not Found: { "erro": "não encontrado" } |