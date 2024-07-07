import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5554,
  database: process.env.DB_NAME || "bitespeed",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgrespassword",
});

export const query = (text: string, params: any) => pool.query(text, params);
