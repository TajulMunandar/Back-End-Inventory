import express from "express";
import { getTotal } from "../controller/dashboard.js";
import authenticateToken from "../controller/middleware/authenticateToken.js";

const router = express.Router();

router.get("/", authenticateToken, getTotal);

export default router;
