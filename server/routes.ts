import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Note: Authentication is handled by Supabase Auth on the frontend
  // Backend routes can use Supabase client or RPC functions if needed

  return httpServer;
}
