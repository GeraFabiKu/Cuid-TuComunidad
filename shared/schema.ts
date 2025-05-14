import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono"),
  tipo: text("tipo").notNull().default("donante"), // "donante" o "solicitante"
  createdAt: text("created_at").notNull().default("current_timestamp"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nombre: true,
  email: true,
  telefono: true,
  tipo: true,
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  descripcion: text("descripcion").notNull(),
  estado: text("estado").notNull(),
  zona: text("zona").notNull(),
  ciudad: text("ciudad").notNull(),
  latitud: doublePrecision("latitud").notNull(),
  longitud: doublePrecision("longitud").notNull(),
  donante_id: integer("donante_id"), // ID del usuario que dona
  solicitante_id: integer("solicitante_id"), // ID del usuario que solicita (opcional)
  estado_entrega: text("estado_entrega").default("disponible"), // disponible, reservado, entregado
  fecha_reserva: text("fecha_reserva"),
  fecha_entrega: text("fecha_entrega"),
  createdAt: text("created_at").notNull().default("current_timestamp"),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  fecha_reserva: true,
  fecha_entrega: true,
});

export const insertDonationValidator = insertDonationSchema.extend({
  latitud: z.string().transform((val) => parseFloat(val)),
  longitud: z.string().transform((val) => parseFloat(val)),
});

// Schema para solicitudes de donaciones
export const solicitudes = pgTable("solicitudes", {
  id: serial("id").primaryKey(),
  solicitante_id: integer("solicitante_id").notNull(),
  donation_id: integer("donation_id").notNull(),
  estado: text("estado").notNull().default("pendiente"), // pendiente, aceptado, rechazado
  mensaje: text("mensaje"),
  fecha_solicitud: text("fecha_solicitud").notNull().default("current_timestamp"),
  fecha_respuesta: text("fecha_respuesta"),
});

export const insertSolicitudSchema = createInsertSchema(solicitudes).omit({
  id: true,
  fecha_solicitud: true,
  fecha_respuesta: true,
});

// Tipos de datos
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type DonationFormData = z.infer<typeof insertDonationValidator>;
export type Solicitud = typeof solicitudes.$inferSelect;
export type InsertSolicitud = z.infer<typeof insertSolicitudSchema>;
