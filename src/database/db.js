import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const HOST = process.env.PGHOST || process.env.DB_HOST || "localhost";
const PORT = process.env.PGPORT || process.env.DB_PORT || "5432"; // pode ser string
const DATABASE = process.env.PGDATABASE || process.env.DB_DATABASE || "redesocial_api_db";
const USER = process.env.PGUSER || process.env.DB_USER || "postgres";
const PASSWORD = process.env.PGPASSWORD || process.env.DB_PASSWORD || "postgres";
const pool = new Pool({
  host: HOST,         // endereço do servidor Postgres (ex.: "localhost")
  port: PORT,         // porta do Postgres (padrão "5432")
  database: DATABASE, // nome do banco (ex.: "chamados_api_db")
  user: USER,         // usuário do banco (ex.: "postgres")
  password: PASSWORD, // senha do usuário
  // ssl: { rejectUnauthorized: false }, // alguns provedores exigem SSL; ajuste conforme necessário
});
export { pool };