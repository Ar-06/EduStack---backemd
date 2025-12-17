import { Router } from "express";
import {
  getMaterialByStatus,
  approveMaterial,
  rejectMaterial,
  getMaterialById,
} from "../controllers/moderator.controller.js";
import { authRequires } from "../middleware/validateToken.js";
import { isModerator } from "../middleware/roles.js";

export const ModeratorRoute = Router();

ModeratorRoute.get(
  "/material/:estado",
  authRequires,
  isModerator,
  getMaterialByStatus
);
ModeratorRoute.post(
  "/material/:id_material/approve",
  authRequires,
  isModerator,
  approveMaterial
);
ModeratorRoute.post(
  "/material/:id_material/reject",
  authRequires,
  isModerator,
  rejectMaterial
);
ModeratorRoute.get(
  "/view/:id_material",
  authRequires,
  isModerator,
  getMaterialById
);
