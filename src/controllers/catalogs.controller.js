import { pool } from "../db/connectDB.js";

export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categorias");

    if (rows.length > 0) {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error("Error obteniendo categorías", error);
    res.status(500).json({ error: "Error obteniendo categorías" });
  }
};

export const getTypes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tipos_material");

    if (rows.length > 0) {
      res.status(200).json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo tipos" });
  }
};

export const getLanguajes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM idioma");

    if (rows.length > 0) {
      res.status(200).json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo idiomas" });
  }
};

export const getLevelAcademic = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM nivel_academico");
    if (rows.length > 0) {
      res.status(200).json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo niveles academicos" });
  }
};
