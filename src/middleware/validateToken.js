import dotenv from "dotenv";
import { verifyAccessToken } from "../lib/jwt.js";
dotenv.config();

export const authRequires = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = await verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
