import multer from "multer";

export const uploadMaterialMiddleware = multer({
  storage: multer.memoryStorage(), // 🔥 CLAVE
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
