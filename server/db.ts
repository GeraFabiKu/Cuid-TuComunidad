import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Verificamos que existe la URL de conexión a la base de datos
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Creamos el pool de conexiones
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Creamos el cliente de Drizzle con nuestro esquema
export const db = drizzle(pool, { schema });