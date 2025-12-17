import { Router } from "express";
import {
  getCategories,
  getTypes,
  getLanguajes,
  getLevelAcademic,
} from "../controllers/catalogs.controller.js";

export const CatalogsRouter = Router();

CatalogsRouter.get("/categories", getCategories);
CatalogsRouter.get("/types", getTypes);
CatalogsRouter.get("/languages", getLanguajes);
CatalogsRouter.get("/level", getLevelAcademic);
