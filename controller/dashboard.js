import { query } from "../database/db.js";

export const getTotal = async (req, res) => {
  const countAllSql = `
      SELECT 
        COUNT(*) AS total_barang
      FROM 
        Barang
    `;

  const countReadySql = `
      SELECT 
        COUNT(*) AS total_ready_barang
      FROM 
        Barang
      WHERE 
        status = 1
    `;

  const countNotReadySql = `
      SELECT 
        COUNT(*) AS total_not_ready_barang
      FROM 
        Barang
      WHERE 
        status = 0
    `;

  const countLatePeminjamanDurasiSql = `
    SELECT 
      COUNT(*) AS total_late_peminjaman_durasi
    FROM 
      Peminjaman
    WHERE 
      DATEDIFF(NOW(), durasi_pinjam) AND tgl_kembali IS NULL
  `;

  try {
    const countAllResult = await query(countAllSql);
    const countReadyResult = await query(countReadySql);
    const countNotReadyResult = await query(countNotReadySql);
    const countLatePeminjamanDurasiResult = await query(
      countLatePeminjamanDurasiSql
    );

    if (countAllResult.length === 0 || countReadyResult.length === 0) {
      return res.status(404).json({ message: "No barang found" });
    }

    const totalBarang = countAllResult[0].total_barang;
    const totalReadyBarang = countReadyResult[0].total_ready_barang;
    const totalNotReadyBarang = countNotReadyResult[0].total_not_ready_barang;
    const totalLatePeminjamanDurasi =
      countLatePeminjamanDurasiResult[0].total_late_peminjaman_durasi;

    res.json({
      total_barang: totalBarang,
      total_ready_barang: totalReadyBarang,
      total_not_ready_barang: totalNotReadyBarang,
      total_late_peminjaman_durasi: totalLatePeminjamanDurasi,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
