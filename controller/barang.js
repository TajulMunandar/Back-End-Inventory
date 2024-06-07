import { query } from "../database/db.js";
import { body, param, validationResult } from "express-validator";

export const getBarangs = async (req, res) => {
  const sql = "SELECT * FROM barang";
  try {
    const barangs = await query(sql);

    // Memproses data untuk mengubah nilai status
    const processedBarangs = barangs.map((barang) => ({
      ...barang,
      status_formatted: barang.status === 0 ? "maintenance" : "ready",
    }));

    res.json(processedBarangs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBarangById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM barang WHERE id_barang = ?";
  try {
    const barang = await query(sql, [id]);
    if (barang.length === 0)
      return res.status(404).json({ message: "Barang not found" });

    const processedBarangs = barang.map((barang) => ({
      ...barang,
      status_formatted: barang.status === 0 ? "maintenance" : "ready",
    }));

    res.json(processedBarangs[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBarang = [
  // Validation and Sanitization
  body("nama_barang")
    .isString()
    .withMessage("Nama Barang must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nama Barang is required"),
  body("nomor_seri")
    .isString()
    .withMessage("Nomor Seri must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nomor Seri is required")
    .custom(async (nomor_seri, { req }) => {
      const { id } = req.params;
      const sql =
        "SELECT COUNT(*) AS count FROM barang WHERE nomor_seri = ? AND id_barang != ?";
      const results = await query(sql, [nomor_seri, id]);
      if (results[0].count > 0) {
        throw new Error("Nomor Seri already in use");
      }
    }),
  body("jumlah")
    .isInt({ min: 1 })
    .withMessage("Jumlah must be an integer greater than 0"),
  body("supplier")
    .isString()
    .withMessage("Supplier must be a string")
    .trim()
    .notEmpty()
    .withMessage("Supplier is required"),
  body("kepemilikan")
    .isString()
    .withMessage("Kepemilikan must be a string")
    .trim()
    .notEmpty()
    .withMessage("Kepemilikan is required"),
  body("status")
    .isInt({ max: 1 })
    .withMessage("Status must be a string")
    .trim()
    .notEmpty()
    .withMessage("Status is required"),
  body("tgl_pembelian")
    .isDate()
    .withMessage("Tanggal Pembelian must be a valid date"),

  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nama_barang,
      nomor_seri,
      jumlah,
      supplier,
      kepemilikan,
      status,
      tgl_pembelian,
    } = req.body;
    const sql =
      "INSERT INTO Barang (nama_barang, nomor_seri, jumlah, supplier, kepemilikan, status, tgl_pembelian) VALUES (?, ?, ?, ?, ?, ?, ?)";
    try {
      await query(sql, [
        nama_barang,
        nomor_seri,
        jumlah,
        supplier,
        kepemilikan,
        status,
        tgl_pembelian,
      ]);
      res.status(201).json({ message: "Barang created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const updateBarang = [
  // Validation and Sanitization
  param("id").isInt().withMessage("ID must be an integer"),
  body("nama_barang")
    .isString()
    .withMessage("Nama Barang must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nama Barang is required"),
  body("nomor_seri")
    .isString()
    .withMessage("Nomor Seri must be a string")
    .trim()
    .notEmpty()
    .withMessage("Nomor Seri is required")
    .custom(async (nomor_seri, { req }) => {
      const { id } = req.params;
      const sql =
        "SELECT COUNT(*) AS count FROM barang WHERE nomor_seri = ? AND id_barang != ?";
      const results = await query(sql, [nomor_seri, id]);
      if (results[0].count > 0) {
        throw new Error("Nomor Seri already in use");
      }
    }),
  body("jumlah")
    .isInt({ min: 1 })
    .withMessage("Jumlah must be an integer greater than 0"),
  body("supplier")
    .isString()
    .withMessage("Supplier must be a string")
    .trim()
    .notEmpty()
    .withMessage("Supplier is required"),
  body("kepemilikan")
    .isString()
    .withMessage("Kepemilikan must be a string")
    .trim()
    .notEmpty()
    .withMessage("Kepemilikan is required"),
  body("status")
    .isInt({ max: 1 })
    .withMessage("Status must be a string")
    .trim()
    .notEmpty()
    .withMessage("Status is required"),
  body("tgl_pembelian")
    .isDate()
    .withMessage("Tanggal Pembelian must be a valid date"),

  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      nama_barang,
      nomor_seri,
      jumlah,
      supplier,
      kepemilikan,
      status,
      tgl_pembelian,
    } = req.body;
    const sql =
      "UPDATE barang SET nama_barang = ?, nomor_seri = ?, jumlah = ?, supplier = ?, kepemilikan = ?, status = ?, tgl_pembelian = ? WHERE id_barang = ?";
    try {
      await query(sql, [
        nama_barang,
        nomor_seri,
        jumlah,
        supplier,
        kepemilikan,
        status,
        tgl_pembelian,
        id,
      ]);
      res.json({ message: "Barang updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

export const deleteBarang = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM barang WHERE id_barang = ?";
  try {
    await query(sql, [id]);
    res.json({ message: "Barang deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
