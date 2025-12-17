import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err || !token) return reject(err);
      resolve(token);
    });
  });
}

export function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err || !decoded) return reject(err);
      resolve(decoded);
    });
  });
}
