export const isModerator = (req, res, next) => {
  if (req.user.rol !== 2) {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.rol !== 1) {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
};
