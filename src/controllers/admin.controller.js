import { pool } from "../db/connectDB.js";
import bcrypt from "bcryptjs";

export const getAdminStats = async (req, res) => {
  try {
    const [[users]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios"
    );

    const [[materials]] = await pool.query(
      "SELECT COUNT(*) AS total FROM materiales_academicos"
    );

    const [[moderators]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE id_rol = 2"
    );

    res.json({
      totalUsuarios: users.total,
      totalMateriales: materials.total,
      moderadores: moderators.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getModerators = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombres, apellidos, correo FROM usuarios WHERE id_rol = 2"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createModerator = async (req, res) => {
  const { nombres, apellidos, correo, password } = req.body;

  if (!nombres || !apellidos || !correo || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const [exists] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "El correo ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO usuarios (nombres, apellidos, correo, contraseña, id_rol) VALUES (?,?,?,?,?)`,
      [nombres, apellidos, correo, hashedPassword, 2]
    );

    res.status(201).json({
      message: "Moderador creado exitosamente",
      moderador: {
        nombres,
        apellidos,
        correo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

