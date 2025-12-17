import { Router } from "express";
import {
  getAdminStats,
  getModerators,
  createModerator,
} from "../controllers/admin.controller.js";
import { authRequires } from "../middleware/validateToken.js";
import { isAdmin } from "../middleware/roles.js";

export const AdminRoute = Router();

AdminRoute.get("/stats", authRequires, isAdmin, getAdminStats);
AdminRoute.get("/moderators", authRequires, isAdmin, getModerators);
AdminRoute.post("/create-moderator", authRequires, isAdmin, createModerator);
