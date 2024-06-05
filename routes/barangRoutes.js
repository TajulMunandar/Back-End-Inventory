import express from "express";
import {
  createBarang,
  getBarangs,
  getBarangById,
  updateBarang,
  deleteBarang as delete_,
} from "../controller/barang.js";
import authenticateToken from "../controller/middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createBarang); // Create Barang
router.get("/", authenticateToken, getBarangs); // Read all Barang
router.get("/:id", authenticateToken, getBarangById); // Read Barang by ID
router.put("/:id", authenticateToken, updateBarang); // Update Barang
router.delete("/:id", authenticateToken, delete_); // Delete Barang

export default router;
