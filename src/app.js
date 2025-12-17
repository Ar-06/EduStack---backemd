import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { AuthRoute } from "./routes/auth.route.js";
import { MaterialRoute } from "./routes/materials.route.js";
import { ModeratorRoute } from "./routes/moderator.route.js";
import { AdminRoute } from "./routes/admin.route.js";
import { corsMiddleware } from "./middleware/cors.js";
import { CatalogsRouter } from "./routes/catalogs.route.js";

export const app = express();

app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(corsMiddleware());

app.use("/api/auth", AuthRoute);
app.use("/api/materials", MaterialRoute);
app.use("/api/moderator", ModeratorRoute);
app.use("/api/admin", AdminRoute);
app.use("/api/catalogs", CatalogsRouter);

app.get("/", (req, res) => {
  res.send("Edustack API");
});
