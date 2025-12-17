import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyToken,
} from "../controllers/auth.controller.js";
import { authRequires } from "../middleware/validateToken.js";

export const AuthRoute = Router();

AuthRoute.post("/register", register);
AuthRoute.post("/login", login);
AuthRoute.post("/logout", authRequires, logout);
AuthRoute.get("/verifyToken", verifyToken);
