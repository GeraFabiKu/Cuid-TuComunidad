import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDonationSchema, 
  insertDonationValidator, 
  insertUserSchema, 
  insertSolicitudSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==========================================
  // Donations Endpoints
  // ==========================================
  
  // Get all donations or filter by status
  app.get("/api/donations", async (req: Request, res: Response) => {
    try {
      const { estado, donante, solicitante } = req.query;
      
      let donations;
      if (estado && typeof estado === 'string') {
        donations = await storage.getDonationsByEstadoEntrega(estado);
      } else if (donante && typeof donante === 'string') {
        const donanteId = parseInt(donante);
        if (!isNaN(donanteId)) {
          donations = await storage.getDonationsByDonante(donanteId);
        } else {
          donations = await storage.getDonations();
        }
      } else if (solicitante && typeof solicitante === 'string') {
        const solicitanteId = parseInt(solicitante);
        if (!isNaN(solicitanteId)) {
          donations = await storage.getDonationsBySolicitante(solicitanteId);
        } else {
          donations = await storage.getDonations();
        }
      } else {
        donations = await storage.getDonations();
      }
      
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Get a specific donation by ID
  app.get("/api/donations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donation ID" });
      }
      
      const donation = await storage.getDonation(id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(donation);
    } catch (error) {
      console.error("Error fetching donation:", error);
      res.status(500).json({ message: "Failed to fetch donation" });
    }
  });

  // Create a new donation
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      // Validate the donation data
      const validatedData = insertDonationValidator.parse(req.body);
      
      // Create the donation
      const donation = await storage.createDonation({
        tipo: validatedData.tipo,
        descripcion: validatedData.descripcion,
        estado: validatedData.estado,
        zona: validatedData.zona,
        ciudad: validatedData.ciudad,
        latitud: validatedData.latitud,
        longitud: validatedData.longitud,
        donante_id: validatedData.donante_id || 1, // Default to test user
        estado_entrega: "disponible"
      });
      
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Failed to create donation" });
    }
  });
  
  // Update donation status
  app.put("/api/donations/:id/estado", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donation ID" });
      }
      
      const { estado, solicitanteId } = req.body;
      if (!estado) {
        return res.status(400).json({ message: "Estado is required" });
      }
      
      const donation = await storage.updateDonationEstado(id, estado, solicitanteId);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(donation);
    } catch (error) {
      console.error("Error updating donation status:", error);
      res.status(500).json({ message: "Failed to update donation status" });
    }
  });
  
  // ==========================================
  // Users Endpoints
  // ==========================================
  
  // Get all users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const { tipo } = req.query;
      
      let users;
      if (tipo && typeof tipo === 'string') {
        users = await storage.getUsersByTipo(tipo);
      } else {
        users = await storage.getAllUsers();
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get a specific user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Create a new user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // ==========================================
  // Solicitudes Endpoints
  // ==========================================
  
  // Get all solicitudes
  app.get("/api/solicitudes", async (req: Request, res: Response) => {
    try {
      const { donation, solicitante } = req.query;
      
      let solicitudes;
      if (donation && typeof donation === 'string') {
        const donationId = parseInt(donation);
        if (!isNaN(donationId)) {
          solicitudes = await storage.getSolicitudesByDonation(donationId);
        } else {
          solicitudes = await storage.getSolicitudes();
        }
      } else if (solicitante && typeof solicitante === 'string') {
        const solicitanteId = parseInt(solicitante);
        if (!isNaN(solicitanteId)) {
          solicitudes = await storage.getSolicitudesBySolicitante(solicitanteId);
        } else {
          solicitudes = await storage.getSolicitudes();
        }
      } else {
        solicitudes = await storage.getSolicitudes();
      }
      
      res.json(solicitudes);
    } catch (error) {
      console.error("Error fetching solicitudes:", error);
      res.status(500).json({ message: "Failed to fetch solicitudes" });
    }
  });
  
  // Create a new solicitud
  app.post("/api/solicitudes", async (req: Request, res: Response) => {
    try {
      // Validate solicitud data
      const solicitudData = insertSolicitudSchema.parse(req.body);
      
      // Verify that the donation exists and is available
      const donation = await storage.getDonation(solicitudData.donation_id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      if (donation.estado_entrega !== "disponible") {
        return res.status(400).json({ message: "Donation is not available" });
      }
      
      // Verify that the solicitante exists
      const solicitante = await storage.getUser(solicitudData.solicitante_id);
      if (!solicitante) {
        return res.status(404).json({ message: "Solicitante not found" });
      }
      
      // Create solicitud
      const solicitud = await storage.createSolicitud(solicitudData);
      
      res.status(201).json(solicitud);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating solicitud:", error);
      res.status(500).json({ message: "Failed to create solicitud" });
    }
  });
  
  // Update solicitud status
  app.put("/api/solicitudes/:id/estado", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid solicitud ID" });
      }
      
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ message: "Estado is required" });
      }
      
      const solicitud = await storage.updateSolicitudEstado(id, estado);
      if (!solicitud) {
        return res.status(404).json({ message: "Solicitud not found" });
      }
      
      // If the solicitud is accepted, update the donation status
      if (estado === "aceptado") {
        await storage.updateDonationEstado(
          solicitud.donation_id, 
          "reservado",
          solicitud.solicitante_id
        );
      }
      
      res.json(solicitud);
    } catch (error) {
      console.error("Error updating solicitud status:", error);
      res.status(500).json({ message: "Failed to update solicitud status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
