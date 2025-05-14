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

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByTipo(tipo: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Donation methods
  getDonations(): Promise<Donation[]>;
  getDonationsByDonante(donanteId: number): Promise<Donation[]>;
  getDonationsByEstadoEntrega(estado: string): Promise<Donation[]>;
  getDonationsBySolicitante(solicitanteId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonation(id: number): Promise<Donation | undefined>;
  updateDonationEstado(id: number, estado: string, solicitanteId?: number): Promise<Donation | undefined>;
  
  // Solicitud methods
  getSolicitudes(): Promise<Solicitud[]>;
  getSolicitudesByDonation(donationId: number): Promise<Solicitud[]>;
  getSolicitudesBySolicitante(solicitanteId: number): Promise<Solicitud[]>;
  createSolicitud(solicitud: InsertSolicitud): Promise<Solicitud>;
  updateSolicitudEstado(id: number, estado: string): Promise<Solicitud | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donationItems: Map<number, Donation>;
  private solicitudItems: Map<number, Solicitud>;
  userId: number;
  donationId: number;
  solicitudId: number;

  constructor() {
    this.users = new Map();
    this.donationItems = new Map();
    this.solicitudItems = new Map();
    this.userId = 1;
    this.donationId = 1;
    this.solicitudId = 1;
    
    // Crear usuarios de prueba
    this.createUser({
      username: "donante1",
      password: "password123",
      nombre: "Juan Donante",
      email: "juan@example.com",
      telefono: "123456789",
      tipo: "donante"
    });
    
    this.createUser({
      username: "solicitante1",
      password: "password123",
      nombre: "María Solicitante",
      email: "maria@example.com",
      telefono: "987654321",
      tipo: "solicitante"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUsersByTipo(tipo: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.tipo === tipo,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date().toISOString();
    // Asegurar que todos los campos estén presentes
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      telefono: insertUser.telefono || null,
      tipo: insertUser.tipo || "donante"
    };
    this.users.set(id, user);
    return user;
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donationItems.values());
  }
  
  async getDonationsByDonante(donanteId: number): Promise<Donation[]> {
    return Array.from(this.donationItems.values()).filter(
      (donation) => donation.donante_id === donanteId,
    );
  }
  
  async getDonationsByEstadoEntrega(estado: string): Promise<Donation[]> {
    return Array.from(this.donationItems.values()).filter(
      (donation) => donation.estado_entrega === estado,
    );
  }
  
  async getDonationsBySolicitante(solicitanteId: number): Promise<Donation[]> {
    return Array.from(this.donationItems.values()).filter(
      (donation) => donation.solicitante_id === solicitanteId,
    );
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.donationId++;
    const now = new Date().toISOString();
    const donation: Donation = { 
      ...insertDonation, 
      id, 
      createdAt: now,
      estado_entrega: insertDonation.estado_entrega || "disponible",
      donante_id: insertDonation.donante_id || null,
      solicitante_id: null,
      fecha_reserva: null,
      fecha_entrega: null
    };
    this.donationItems.set(id, donation);
    return donation;
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donationItems.get(id);
  }
  
  async updateDonationEstado(id: number, estado: string, solicitanteId?: number): Promise<Donation | undefined> {
    const donation = await this.getDonation(id);
    if (!donation) return undefined;
    
    const now = new Date().toISOString();
    const updatedDonation: Donation = {
      ...donation,
      estado_entrega: estado
    };
    
    if (estado === "reservado" && solicitanteId) {
      updatedDonation.solicitante_id = solicitanteId;
      updatedDonation.fecha_reserva = now;
    }
    
    if (estado === "entregado") {
      updatedDonation.fecha_entrega = now;
    }
    
    this.donationItems.set(id, updatedDonation);
    return updatedDonation;
  }
  
  // Solicitud methods
  async getSolicitudes(): Promise<Solicitud[]> {
    return Array.from(this.solicitudItems.values());
  }
  
  async getSolicitudesByDonation(donationId: number): Promise<Solicitud[]> {
    return Array.from(this.solicitudItems.values()).filter(
      (solicitud) => solicitud.donation_id === donationId,
    );
  }
  
  async getSolicitudesBySolicitante(solicitanteId: number): Promise<Solicitud[]> {
    return Array.from(this.solicitudItems.values()).filter(
      (solicitud) => solicitud.solicitante_id === solicitanteId,
    );
  }
  
  async createSolicitud(insertSolicitud: InsertSolicitud): Promise<Solicitud> {
    const id = this.solicitudId++;
    const now = new Date().toISOString();
    const solicitud: Solicitud = {
      ...insertSolicitud,
      id,
      fecha_solicitud: now,
      fecha_respuesta: null,
      estado: insertSolicitud.estado || "pendiente",
      mensaje: insertSolicitud.mensaje || null
    };
    this.solicitudItems.set(id, solicitud);
    return solicitud;
  }
  
  async updateSolicitudEstado(id: number, estado: string): Promise<Solicitud | undefined> {
    const solicitud = this.solicitudItems.get(id);
    if (!solicitud) return undefined;
    
    const now = new Date().toISOString();
    const updatedSolicitud: Solicitud = {
      ...solicitud,
      estado,
      fecha_respuesta: now
    };
    
    this.solicitudItems.set(id, updatedSolicitud);
    return updatedSolicitud;
  }
}

// Importamos el almacenamiento en base de datos
import { DatabaseStorage } from "./DatabaseStorage";

// Usamos DatabaseStorage en lugar de MemStorage
export const storage = new DatabaseStorage();
