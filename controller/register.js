import { query } from "../database/db.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { nama, email, password } = req.body;

  // Validasi input
  if (!nama || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nama, email, dan password harus diisi" });
  }

  try {
    // Periksa apakah email sudah digunakan sebelumnya
    const emailExistsQuery =
      "SELECT COUNT(*) as count FROM User WHERE email = ?";
    const result = await query(emailExistsQuery, [email]);
    if (result[0].count > 0) {
      return res.status(400).json({ error: "Email sudah digunakan" });
    }

    // Enkripsi kata sandi
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna ke dalam database
    const sql =
      "INSERT INTO User (nama, email, password, created_at) VALUES (?, ?, ?, NOW())";
    await query(sql, [nama, email, hashedPassword]);

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
