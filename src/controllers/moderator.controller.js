import { pool } from "../db/connectDB.js";

export const getMaterialByStatus = async (req, res) => {
  const { estado } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT m.*, 
        GROUP_CONCAT(a.nombre_completo SEPARATOR ', ') AS autores
       FROM materiales_academicos m
       LEFT JOIN material_autores ma ON m.id_material = ma.id_material
       LEFT JOIN autores a ON ma.id_autor = a.id_autor
       WHERE m.id_estado = ?
       GROUP BY m.id_material
       ORDER BY m.id_material DESC`,
      [estado]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveMaterial = async (req, res) => {
  const { id_material } = req.params;

  try {
    await pool.query(
      "UPDATE materiales_academicos SET id_estado = 2 WHERE id_material = ?",
      [id_material]
    );
    res.json({ message: "Material aprobado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectMaterial = async (req, res) => {
  const { id_material } = req.params;

  try {
    await pool.query(
      "UPDATE materiales_academicos SET id_estado = 3 WHERE id_material = ?",
      [id_material]
    );
    res.json({ message: "Material rechazado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaterialById = async (req, res) => {
  const { id_material } = req.params;
  try {
    const [[material]] = await pool.query(
      "SELECT * FROM materiales_academicos WHERE id_material = ?",
      [id_material]
    );
    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
