import express from "express";
import { getUserProfile, updateProfile } from "../controller/profile.js";
import authenticateToken from "../controller/middleware/authenticateToken.js";

const router = express.Router();

// Route untuk mendapatkan profil pengguna
router.get("/", authenticateToken, getUserProfile);

// Route untuk memperbarui profil pengguna
router.put("/", authenticateToken, updateProfile);

export default router;
