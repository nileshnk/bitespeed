import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5554,
  database: "bitespeed",
  user: "postgres",
  password: "postgrespassword",
});

export const query = (text: string, params: any) => pool.query(text, params);
