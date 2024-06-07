import { body, param, validationResult } from "express-validator";
import { query } from "../database/db.js";
import bcrypt from "bcryptjs";

export const createUser = [
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
    .custom(async (email) => {
      const emailExistsQuery =
        "SELECT COUNT(*) as count FROM User WHERE email = ?";
      const result = await query(emailExistsQuery, [email]);
      if (result[0].count > 0) {
        throw new Error("Email already in use");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
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
  body("is_admin").isBoolean().withMessage("Is_admin must be a boolean"),
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

    const {
      nama,
      email,
      password,
      telepon,
      nik,
      divisi,
      is_admin,
      perusahaan,
    } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql =
        "INSERT INTO User (nama, email, password, telepon, nik, divisi, is_admin, perusahaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      await query(sql, [
        nama,
        email,
        hashedPassword,
        telepon,
        nik,
        divisi,
        is_admin,
        perusahaan,
      ]);
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const getUsers = async (req, res) => {
  const sql =
    "SELECT id_user, nama, email, telepon, nik, divisi, is_admin, perusahaan FROM User";
  try {
    const users = await query(sql);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const sql =
    "SELECT id_user, nama, email, telepon, nik, divisi, is_admin, perusahaan FROM User WHERE id_user = ?";
  try {
    const user = await query(sql, [id]);
    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = [
  // Validation and Sanitization
  param("id").isInt().withMessage("User ID must be an integer"),
  body("nama")
    .optional()
    .isString()
    .withMessage("Nama must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nama cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const id = req.params.id;
      const emailExistsQuery =
        "SELECT COUNT(*) as count FROM User WHERE email = ? AND id_user != ?";
      const result = await query(emailExistsQuery, [email, id]);
      if (result[0].count > 0) {
        throw new Error("Email already in use by another user");
      }
    }),
  body("telepon")
    .optional()
    .isString()
    .withMessage("Telepon must be a valid phone number")
    .trim(),
  body("nik")
    .optional()
    .isString()
    .withMessage("NIK must be a string")
    .trim()
    .notEmpty()
    .withMessage("NIK cannot be empty"),
  body("divisi")
    .optional()
    .isString()
    .withMessage("Divisi must be a string")
    .trim()
    .notEmpty()
    .withMessage("Divisi cannot be empty"),
  body("is_admin")
    .optional()
    .isBoolean()
    .withMessage("Is_admin must be a boolean"),
  body("perusahaan")
    .optional()
    .isString()
    .withMessage("Perusahaan must be a string")
    .trim()
    .notEmpty()
    .withMessage("Perusahaan cannot be empty"),

  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nama, email, telepon, nik, divisi, is_admin, perusahaan } =
      req.body;
    const sql =
      "UPDATE User SET nama = ?, email = ?, telepon = ?, nik = ?, divisi = ?, is_admin = ?, perusahaan = ? WHERE id_user = ?";

    try {
      await query(sql, [
        nama,
        email,
        telepon,
        nik,
        divisi,
        is_admin,
        perusahaan,
        id,
      ]);
      res.json({ message: "User updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const updatePassword = [
  // Validation and Sanitization
  param("id_user").isInt().withMessage("User ID must be an integer"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "UPDATE User SET password = ? WHERE id_user = ?";
      await query(sql, [hashedPassword, id]);
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM User WHERE id_user = ?";
  try {
    await query(sql, [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
