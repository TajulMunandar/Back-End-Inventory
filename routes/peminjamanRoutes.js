import express from "express";
import {
  createPeminjaman,
  getPeminjaman,
  getPeminjamanById,
  getPeminjamanByUser,
  updatePeminjaman,
  approvePeminjaman,
  approveReturnPeminjaman,
} from "../controller/peminjaman.js";
import authenticateToken from "../controller/middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createPeminjaman); // Create Peminjaman
router.get("/", authenticateToken, getPeminjaman); // Read all Peminjaman
router.get("/user", authenticateToken, getPeminjamanByUser); // Read Peminjaman by ID
router.get("/:id", authenticateToken, getPeminjamanById); // Read Peminjaman by ID
router.put("/:id", authenticateToken, updatePeminjaman); // Update Peminjaman
router.put("/:id/approve", authenticateToken, approvePeminjaman); // Approve Peminjaman
router.put("/:id/return", authenticateToken, approveReturnPeminjaman); // Return Peminjaman

export default router;
