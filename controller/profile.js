import { query } from "../database/db.js";
import { body, validationResult } from "express-validator";

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  const sql =
    "SELECT nama, email, telepon, nik, divisi, perusahaan FROM User WHERE id_user = ?";
  try {
    const [user] = await query(sql, [userId]);
    if (!user) {
      return res.status(404).json({ error: "Profil pengguna tidak ditemukan" });
    }

    // Mengirim data profil pengguna bersama dengan userId
    res.json({ userId, ...user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = [
  // Validation and Sanitization
  body("nama")
    .isString()
    .withMessage("Nama must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nama is required"),
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const userId = req.userId;
      const emailExistsQuery =
        "SELECT COUNT(*) as count FROM User WHERE email = ? AND id_user != ?";
      const result = await query(emailExistsQuery, [email, userId]);
      if (result[0].count > 0) {
        throw new Error("Email already in use by another user");
      }
    }),
  body("telepon")
    .isString()
    .withMessage("Telepon must be a valid phone number")
    .trim(),
  body("nik")
    .isString()
    .withMessage("NIK must be a string")
    .trim()
    .notEmpty()
    .withMessage("NIK is required"),
  body("divisi")
    .isString()
    .withMessage("Divisi must be a string")
    .trim()
    .notEmpty()
    .withMessage("Divisi is required"),
  body("perusahaan")
    .isString()
    .withMessage("Perusahaan must be a string")
    .trim()
    .notEmpty()
    .withMessage("Perusahaan is required"),

  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId; // Ambil ID pengguna dari token autentikasi atau sesi
    const { nama, email, telepon, nik, divisi, perusahaan } = req.body;

    const sql =
      "UPDATE User SET nama = ?, email = ?, telepon = ?, nik = ?, divisi = ?, perusahaan = ? WHERE id_user = ?";
    try {
      await query(sql, [nama, email, telepon, nik, divisi, perusahaan, userId]);
      res.json({ message: "Profil berhasil diperbarui" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];
