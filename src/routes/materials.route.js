import { Router } from "express";
import {
  uploadMaterial,
  getMaterials,
  getMyMaterials,
  toggleFavorite,
  getFavorites,
  downloadMaterial,
  viewMaterial,
} from "../controllers/material.controller.js";
import { authRequires } from "../middleware/validateToken.js";
import { uploadMaterialMiddleware } from "../middleware/uploadFile.js";

export const MaterialRoute = Router();

MaterialRoute.post(
  "/upload",
  uploadMaterialMiddleware.single("archivo"),
  authRequires,
  uploadMaterial
);

MaterialRoute.get("/material", getMaterials);
MaterialRoute.get("/my-material", authRequires, getMyMaterials);
MaterialRoute.post("/favorite/:id_material", authRequires, toggleFavorite);
MaterialRoute.get("/favorites", authRequires, getFavorites);
MaterialRoute.get("/download/:id_material", authRequires, downloadMaterial);
MaterialRoute.get("/view/:id_material", viewMaterial);
