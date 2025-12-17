import { pool } from "../db/connectDB.js";
import bcrypt from "bcryptjs";
import { createAccessToken, verifyAccessToken } from "../lib/jwt.js";
import e from "cors";

export const register = async (req, res) => {
  const { nombre, apellidos, email, password } = req.body;

  if (!nombre || !apellidos || !email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [email]
    );
    if (rows.length > 0) {
      return res.status(400).json({ message: "El correo ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuarios (nombres, apellidos, correo, contraseña, id_rol) VALUES (?,?,?,?,?)",
      [nombre, apellidos, email, hashedPassword, 3]
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    const matchPassword = await bcrypt.compare(password, user.contraseña);

    if (!matchPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = await createAccessToken({
      id: user.id_usuario,
      nombre: user.nombres,
      email: user.correo,
      rol: user.id_rol,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Usuario logueado exitosamente",
      usuario: {
        id: user.id_usuario,
        nombre: user.nombres,
        email: user.correo,
        rol: user.id_rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Usuario desconectado exitosamente" });
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = await verifyAccessToken(token);

    res.status(200).json({
      usuario: payload,
    });
  } catch (error) {
    res.status(401).json({ message: "Token invalido" });
  }
};
