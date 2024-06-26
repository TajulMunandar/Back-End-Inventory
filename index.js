import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import barangRoutes from "./routes/barangRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import peminjamanRoutes from "./routes/peminjamanRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connection } from "./database/db.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookie"],
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use("/register", registerRoutes);
app.use("/profile", profileRoutes);
app.use("/users", userRoutes);
app.use("/barang", barangRoutes);
app.use("/dashboard", dashboardRoutes);
app.use(authRoutes);
app.use("/peminjaman", peminjamanRoutes);

app.use(express.json());
app.listen(process.env.PORT, async () => {
  await connection();
  console.log(`https:localhost:${process.env.PORT}`);
});
