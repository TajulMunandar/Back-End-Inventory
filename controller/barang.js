import { query } from "../database/db.js";

export const getBarangs = async (req, res) => {
  const sql = "SELECT * FROM barang";
  try {
    const barangs = await query(sql);
    res.json(barangs);
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
    res.json(barang[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBarang = async (req, res) => {
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
};

export const updateBarang = async (req, res) => {
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
};

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
