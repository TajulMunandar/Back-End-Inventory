import { query } from "../database/db.js";

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  const sql =
    "SELECT nama, email, telepon, nik, divisi, is_admin, perusahaan FROM User WHERE id_user = ?";
  try {
    const [user] = await query(sql, [userId]);
    if (!user) {
      return res.status(404).json({ error: "Profil pengguna tidak ditemukan" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.userId; // Ambil ID pengguna dari token autentikasi atau sesi

  const { nama, email, telepon, nik, divisi, perusahaan } = req.body;

  // Validasi input
  if (!nama || !email || !telepon || !nik || !divisi || !perusahaan) {
    return res.status(400).json({
      error: "Nama, email, telepon, nik, divisi, perusahaan  harus diisi",
    });
  }

  const sql =
    "UPDATE User SET nama = ?, email = ?, telepon = ?, nik = ? , divisi = ? , perusahaan = ? WHERE id_user = ?";
  try {
    await query(sql, [nama, email, telepon, nik, divisi, perusahaan, userId]);
    res.json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
