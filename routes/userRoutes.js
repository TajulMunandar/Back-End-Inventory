import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
} from "../controller/user.js";
import authenticateToken from "../controller/middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createUser); // Create User
router.get("/", authenticateToken, getUsers); // Read all Users
router.get("/:id", authenticateToken, getUserById); // Read User by ID
router.put("/:id", authenticateToken, updateUser); // Update User
router.put("/:id/password", authenticateToken, updatePassword); // Update User Password
router.delete("/:id", authenticateToken, deleteUser); // Delete User

export default router;
