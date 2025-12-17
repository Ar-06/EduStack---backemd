import cors from "cors";

const ACCEPTED_ORIGIN = [
  "http://localhost:5173",
  "https://edu-stack-frontend-silk.vercel.app",
];

export const corsMiddleware = ({ acceptedOrigin = ACCEPTED_ORIGIN } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || acceptedOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
};
