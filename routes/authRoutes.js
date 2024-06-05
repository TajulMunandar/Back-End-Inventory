import express from "express";
import {
  validateLogin,
  actionLogin,
  actionLogout,
} from "../controller/auth.js";

const router = express.Router();

// Route untuk validasi data login
router.post("/login", validateLogin, actionLogin);

// Route untuk logout
router.get("/logout", actionLogout);

export default router;
