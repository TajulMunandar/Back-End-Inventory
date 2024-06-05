import { query } from "../database/db.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  const { nama, email, password, telepon, nik, divisi, is_admin, perusahaan } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql =
    "INSERT INTO User (nama, email, password, telepon, nik, divisi, is_admin, perusahaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  try {
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
};

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
  const sql = "SELECT * FROM User WHERE id_user = ?";
  try {
    const user = await query(sql, [id]);
    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, telepon, nik, divisi, is_admin, perusahaan } = req.body;
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
};

export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "UPDATE User SET password = ? WHERE id_user = ?";
  try {
    await query(sql, [hashedPassword, id]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
