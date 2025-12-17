import { pool } from "../db/connectDB.js";
import path from "path";
import fs from "fs-extra";

export const uploadMaterial = async (req, res) => {
  let connection;

  try {
    const {
      titulo,
      autor,
      descripcion,
      id_cat,
      id_tipo,
      editorial,
      anio,
      isbn_doi,
      paginas,
      id_idioma,
      id_nivel,
    } = req.body;

    const id_usuario = req.user.id;

    if (
      !titulo ||
      !autor ||
      !descripcion ||
      !id_cat ||
      !id_tipo ||
      !paginas ||
      !id_idioma ||
      !id_nivel ||
      !req.file
    ) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const filePath = req.file.path; // 👈 multer

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO materiales_academicos
      (
        ruta_archivo,
        titulo,
        descripcion,
        isbn_doi,
        n_paginas,
        rating,
        n_descargas,
        id_usuario,
        id_nivel,
        id_tipo,
        id_idioma,
        id_cat,
        id_estado,
        editorial,
        año_publicacion
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        filePath,
        titulo,
        descripcion,
        isbn_doi || null,
        paginas,
        0,
        0,
        id_usuario,
        id_nivel,
        id_tipo,
        id_idioma,
        id_cat,
        1, // En revisión
        editorial || null,
        anio,
      ]
    );

    const materialId = result.insertId;

    // ✍️ autores
    const authorsArray = autor
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    for (const name of authorsArray) {
      const [[row]] = await connection.query(
        "SELECT id_autor FROM autores WHERE nombre_completo = ?",
        [name]
      );

      let autorId = row?.id_autor;

      if (!autorId) {
        const [r] = await connection.query(
          "INSERT INTO autores (nombre_completo) VALUES (?)",
          [name]
        );
        autorId = r.insertId;
      }

      await connection.query(
        "INSERT INTO material_autores (id_material, id_autor) VALUES (?,?)",
        [materialId, autorId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Material enviado a revisión",
      id_material: materialId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error al subir material" });
  } finally {
    if (connection) await connection.release();
  }
};

export const getMaterials = async (req, res) => {
  const { categoria, tipo, idioma, nivel } = req.query;

  let filters = [];
  let values = [];

  if (categoria) {
    filters.push("m.id_cat = ?");
    values.push(categoria);
  }

  if (tipo) {
    filters.push("m.id_tipo = ?");
    values.push(tipo);
  }

  if (idioma) {
    filters.push("m.id_idioma = ?");
    values.push(idioma);
  }

  if (nivel) {
    filters.push("m.id_nivel = ?");
    values.push(nivel);
  }

  const whereClause = filters.length ? " AND " + filters.join(" AND ") : "";

  try {
    const [rows] = await pool.query(
      `
      SELECT
        m.id_material,
        m.titulo,
        m.descripcion,
        m.n_paginas,
        m.rating,
        m.n_descargas,
        m.editorial,
        m.año_publicacion,
        m.id_estado,

        c.nombre AS categoria,
        t.nombre AS tipo,

        GROUP_CONCAT(a.nombre_completo SEPARATOR ', ') AS autores

      FROM materiales_academicos m
      LEFT JOIN material_autores ma ON ma.id_material = m.id_material
      LEFT JOIN autores a ON a.id_autor = ma.id_autor
      LEFT JOIN categorias c ON c.id_cat = m.id_cat
      LEFT JOIN tipos_material t ON t.id_tipo = m.id_tipo

      WHERE m.id_estado = 2
      ${whereClause}

      GROUP BY m.id_material
      ORDER BY m.id_material DESC
      `,
      values
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyMaterials = async (req, res) => {
  const id_usuario = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        m.id_material,
        m.titulo,
        m.descripcion,
        m.n_paginas,
        m.rating,
        m.n_descargas,
        m.editorial,
        m.año_publicacion,
        m.id_estado,

        c.nombre AS categoria,
        t.nombre AS tipo,

        GROUP_CONCAT(a.nombre_completo SEPARATOR ', ') AS autores

      FROM materiales_academicos m
      LEFT JOIN categorias c ON c.id_cat = m.id_cat
      LEFT JOIN tipos_material t ON t.id_tipo = m.id_tipo
      LEFT JOIN material_autores ma ON ma.id_material = m.id_material
      LEFT JOIN autores a ON a.id_autor = ma.id_autor

      WHERE m.id_usuario = ?
      GROUP BY m.id_material
      ORDER BY m.id_material DESC
      `,
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  const id_usuario = req.user.id;
  const { id_material } = req.params;

  try {
    const [exists] = await pool.query(
      "SELECT * FROM favoritos WHERE id_usuario = ? AND id_material = ?",
      [id_usuario, id_material]
    );

    if (exists.length > 0) {
      await pool.query(
        "DELETE FROM favoritos WHERE id_usuario = ? AND id_material = ?",
        [id_usuario, id_material]
      );

      await pool.query(
        "UPDATE materiales_academicos SET rating = rating - 1 WHERE id_material = ?",
        [id_material]
      );

      return res.json({ message: "Quitado de favoritos" });
    }

    await pool.query(
      "INSERT INTO favoritos (id_usuario, id_material) VALUES (?,?)",
      [id_usuario, id_material]
    );

    await pool.query(
      "UPDATE materiales_academicos SET rating = rating + 1 WHERE id_material = ?",
      [id_material]
    );

    res.json({ message: "Agregado a favoritos" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  const id_usuario = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        m.id_material,
        m.titulo,
        m.descripcion,
        m.n_paginas,
        m.rating,
        m.n_descargas,

        c.nombre AS categoria,
        t.nombre AS tipo,

        GROUP_CONCAT(a.nombre_completo SEPARATOR ', ') AS autores

      FROM favoritos f
      INNER JOIN materiales_academicos m ON m.id_material = f.id_material
      LEFT JOIN material_autores ma ON ma.id_material = m.id_material
      LEFT JOIN autores a ON a.id_autor = ma.id_autor
      LEFT JOIN categorias c ON c.id_cat = m.id_cat
      LEFT JOIN tipos_material t ON t.id_tipo = m.id_tipo

      WHERE f.id_usuario = ?
      GROUP BY m.id_material
      ORDER BY m.rating DESC
      `,
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadMaterial = async (req, res) => {
  const { id_material } = req.params;

  try {
    const [[material]] = await pool.query(
      "SELECT ruta_archivo FROM materiales_academicos WHERE id_material = ?",
      [id_material]
    );

    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    const filePath = path.resolve(material.ruta_archivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo no existe" });
    }

    await pool.query(
      "UPDATE materiales_academicos SET n_descargas = n_descargas + 1 WHERE id_material = ?",
      [id_material]
    );

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: "Error al descargar material" });
  }
};

export const viewMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;

    const [[material]] = await pool.query(
      "SELECT ruta_archivo FROM materiales_academicos WHERE id_material = ?",
      [id_material]
    );

    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    const filePath = path.resolve(material.ruta_archivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo no existe" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error al visualizar material" });
  }
};
