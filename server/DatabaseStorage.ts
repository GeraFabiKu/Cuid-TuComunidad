import { 
  donations, 
  users, 
  solicitudes, 
  type User, 
  type InsertUser, 
  type Donation, 
  type InsertDonation,
  type Solicitud,
  type InsertSolicitud 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUsersByTipo(tipo: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tipo, tipo));
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations).orderBy(desc(donations.id));
  }
  
  async getDonationsByDonante(donanteId: number): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.donante_id, donanteId))
      .orderBy(desc(donations.id));
  }
  
  async getDonationsByEstadoEntrega(estado: string): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.estado_entrega, estado))
      .orderBy(desc(donations.id));
  }
  
  async getDonationsBySolicitante(solicitanteId: number): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.solicitante_id, solicitanteId))
      .orderBy(desc(donations.id));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const [donation] = await db
      .insert(donations)
      .values(insertDonation)
      .returning();
    return donation;
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }
  
  async updateDonationEstado(id: number, estado: string, solicitanteId?: number): Promise<Donation | undefined> {
    const updateData: Partial<Donation> = {
      estado_entrega: estado
    };
    
    if (estado === "reservado" && solicitanteId) {
      updateData.solicitante_id = solicitanteId;
      updateData.fecha_reserva = new Date().toISOString();
    }
    
    if (estado === "entregado") {
      updateData.fecha_entrega = new Date().toISOString();
    }
    
    const [updatedDonation] = await db
      .update(donations)
      .set(updateData)
      .where(eq(donations.id, id))
      .returning();
      
    return updatedDonation;
  }
  
  // Solicitud methods
  async getSolicitudes(): Promise<Solicitud[]> {
    return await db.select().from(solicitudes).orderBy(desc(solicitudes.id));
  }
  
  async getSolicitudesByDonation(donationId: number): Promise<Solicitud[]> {
    return await db
      .select()
      .from(solicitudes)
      .where(eq(solicitudes.donation_id, donationId))
      .orderBy(desc(solicitudes.id));
  }
  
  async getSolicitudesBySolicitante(solicitanteId: number): Promise<Solicitud[]> {
    return await db
      .select()
      .from(solicitudes)
      .where(eq(solicitudes.solicitante_id, solicitanteId))
      .orderBy(desc(solicitudes.id));
  }
  
  async createSolicitud(insertSolicitud: InsertSolicitud): Promise<Solicitud> {
    const [solicitud] = await db
      .insert(solicitudes)
      .values(insertSolicitud)
      .returning();
    return solicitud;
  }
  
  async updateSolicitudEstado(id: number, estado: string): Promise<Solicitud | undefined> {
    const [solicitud] = await db
      .update(solicitudes)
      .set({
        estado,
        fecha_respuesta: new Date().toISOString()
      })
      .where(eq(solicitudes.id, id))
      .returning();
    return solicitud;
  }
}