import { query } from "../database/db.js";
import { body, validationResult } from "express-validator";
import { sendMail } from "./mailer.js";

export const getPeminjaman = async (req, res) => {
  const sql = `
    SELECT 
      p.id_peminjaman, 
      p.id_barang, 
      b.nama_barang, 
      -- add other Barang columns here
      p.id_user, 
      u.nama AS nama_user, 
      -- add other User columns here
      p.qty, 
      p.ket, 
      p.tgl_pinjam, 
      p.durasi_pinjam, 
      p.tgl_kembali, 
      p.status
    FROM 
      Peminjaman p
    JOIN 
      Barang b ON p.id_barang = b.id_barang
    JOIN 
      User u ON p.id_user = u.id_user
  `;

  try {
    const rows = await query(sql);
    const statusMap = {
      0: "pending",
      1: "approved",
      2: "rejected",
      3: "completed",
    };

    const peminjamans = rows.map((row) => ({
      id_peminjaman: row.id_peminjaman,
      barang: {
        id_barang: row.id_barang,
        nama_barang: row.nama_barang,
        // include other Barang columns here
      },
      user: {
        id_user: row.id_user,
        nama: row.nama_user,
        // include other User columns here
      },
      qty: row.qty,
      ket: row.ket,
      tgl_pinjam: row.tgl_pinjam,
      durasi_pinjam: row.durasi_pinjam,
      tgl_kembali: row.tgl_kembali,
      status: row.status,
      status_formated: statusMap[row.status] || "unknown",
    }));

    res.json(peminjamans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPeminjamanById = async (req, res) => {
  const { id } = req.params;
  const sql = ` SELECT 
      p.id_peminjaman, 
      p.id_barang, 
      b.nama_barang, 
      -- add other Barang columns here
      p.id_user, 
      u.nama AS nama_user, 
      -- add other User columns here
      p.qty, 
      p.ket, 
      p.tgl_pinjam, 
      p.durasi_pinjam, 
      p.tgl_kembali, 
      p.status
    FROM 
      Peminjaman p
    JOIN 
      Barang b ON p.id_barang = b.id_barang
    JOIN 
      User u ON p.id_user = u.id_user 
      WHERE id_peminjaman = ?`;
  try {
    const peminjamana = await query(sql, [id]);
    if (peminjamana.length === 0)
      return res.status(404).json({ message: "Peminjaman not found" });

    const statusMap = {
      0: "pending",
      1: "approved",
      2: "rejected",
      3: "completed",
    };

    const peminjaman = peminjamana.map((row) => ({
      id_peminjaman: row.id_peminjaman,
      barang: {
        id_barang: row.id_barang,
        nama_barang: row.nama_barang,
        // include other Barang columns here
      },
      user: {
        id_user: row.id_user,
        nama: row.nama_user,
        // include other User columns here
      },
      qty: row.qty,
      ket: row.ket,
      tgl_pinjam: row.tgl_pinjam,
      durasi_pinjam: row.durasi_pinjam,
      tgl_kembali: row.tgl_kembali,
      status: row.status,
      status_formated: statusMap[row.status] || "unknown",
    }));

    res.json(peminjaman);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPeminjamanByUser = async (req, res) => {
  const id = req.userId;
  const sql = ` SELECT 
  p.id_peminjaman, 
  p.id_barang, 
  b.nama_barang, 
  b.kepemilikan,
  -- add other Barang columns here
  p.id_user, 
  u.nama AS nama_user, 
  -- add other User columns here
  p.qty, 
  p.ket, 
  p.tgl_pinjam, 
  p.durasi_pinjam, 
  p.tgl_kembali, 
  p.status
FROM 
  Peminjaman p
JOIN 
  Barang b ON p.id_barang = b.id_barang
JOIN 
  User u ON p.id_user = u.id_user 
  WHERE p.id_user = ?`;

  try {
    const peminjamana = await query(sql, [id]);

    if (!peminjamana)
      return res.status(404).json({ message: "Peminjaman not found" });

    const statusMap = {
      0: "pending",
      1: "approved",
      2: "rejected",
      3: "completed",
    };

    const peminjaman = peminjamana.map((row) => ({
      id_peminjaman: row.id_peminjaman,
      barang: {
        id_barang: row.id_barang,
        nama_barang: row.nama_barang,
        kepemilikan: row.kepemilikan,
        // include other Barang columns here
      },
      user: {
        id_user: row.id_user,
        nama: row.nama_user,
        // include other User columns here
      },
      qty: row.qty,
      ket: row.ket,
      tgl_pinjam: row.tgl_pinjam,
      durasi_pinjam: row.durasi_pinjam,
      tgl_kembali: row.tgl_kembali,
      status: row.status,
      status_formated: statusMap[row.status] || "unknown",
    }));

    res.json(peminjaman);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPeminjamanValidator = [
  // Validation and Sanitization
  body("id_barang").isInt().withMessage("ID Barang must be an integer"),
  body("id_user").isInt().withMessage("ID User must be an integer"),
  body("ket")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Keterangan is required"),
  body("qty")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than 0"),
  body("tgl_pinjam")
    .isISO8601()
    .toDate()
    .withMessage("Tanggal Pinjam must be a valid ISO 8601 date"),
  body("durasi_pinjam").isISO8601().toDate().withMessage("Required"),
];

export const createPeminjaman = async (req, res) => {
  await Promise.all(
    createPeminjamanValidator.map((validation) => validation.run(req))
  );

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id_barang, id_user, ket, qty, tgl_pinjam, durasi_pinjam } = req.body;

  const insertPeminjamanQuery = `
    INSERT INTO Peminjaman (id_barang, id_user, ket, qty, tgl_pinjam, durasi_pinjam, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  const getUserEmailQuery = `
  SELECT email, nama
  FROM user
  WHERE id_user = ?
`;

  const getBarangNameQuery = `
    SELECT nama_barang
    FROM Barang
    WHERE id_barang = ?
  `;

  try {
    // Begin transaction
    await query("START TRANSACTION");

    // Insert into Peminjaman
    const peminjamanResult = await query(insertPeminjamanQuery, [
      id_barang,
      id_user,
      ket,
      qty,
      tgl_pinjam,
      durasi_pinjam,
    ]);

    // Commit transaction
    await query("COMMIT");

    const userQueryResult = await query(getUserEmailQuery, [id_user]);
    const userPeminjam = userQueryResult[0].email;
    const userNama = userQueryResult[0].nama;
    const barangNameQueryResult = await query(getBarangNameQuery, [id_barang]);
    const nama_barang = barangNameQueryResult[0].nama_barang;
    await sendMail(
      userPeminjam,
      "Peminjaman Berhasil",
      "Peminjaman Anda berhasil",
      `<p>Halo,</p>
    <p>Terima kasih telah melakukan peminjaman barang. Berikut adalah detail peminjaman Anda:</p>
    <ul>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
      <li><strong>Keperluan:</strong> ${ket}</li>
      <li><strong>Durasi Pinjam:</strong> ${durasi_pinjam}</li>
    </ul>
    <p>Terima kasih atas perhatiannya.</p>
    <p>Salam,</p>
    <p>Tim Administrasi</p>`
    );

    const adminEmail = "tajulmunandar701@gmail.com"; // Ganti dengan email admin
    await sendMail(
      adminEmail,
      "Peminjaman Baru",
      "Ada peminjaman baru",
      `<p>Halo,</p>
    <p>Ada peminjaman baru yang perlu ditinjau. Berikut adalah detail peminjaman yang perlu ditinjau:</p>
    <ul>
      <li><strong>Nama:</strong> ${userNama}</li>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
      <li><strong>Keperluan:</strong> ${ket}</li>
      <li><strong>Durasi Pinjam:</strong> ${durasi_pinjam}</li>
    </ul>
    <p>Terima kasih atas perhatiannya.</p>
    <p>Salam,</p>
    <p>Tim Administrasi</p>`
    );

    res.status(201).json({ message: "Peminjaman created successfully" });
  } catch (err) {
    // Rollback transaction in case of error
    await query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
};

export const updatePeminjaman = async (req, res) => {
  await Promise.all(
    createPeminjamanValidator.map((validation) => validation.run(req))
  );
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id_barang, id_user, ket, qty, tgl_pinjam, durasi_pinjam } = req.body;
  const { id } = req.params;

  const getOldPeminjamanQuery =
    "SELECT * FROM Peminjaman WHERE id_peminjaman = ?";
  const updatePeminjamanQuery =
    "UPDATE Peminjaman SET id_barang = ?, id_user = ?, qty = ?, ket = ?, tgl_pinjam = ?, durasi_pinjam = ? WHERE id_peminjaman = ? ";

  const getUserEmailQuery = `
    SELECT email, nama
    FROM user
    WHERE id_user = ?
  `;

  const getBarangNameQuery = `
    SELECT nama_barang
    FROM Barang
    WHERE id_barang = ?
  `;

  try {
    // Begin transaction
    await query("START TRANSACTION");

    // Get the old peminjaman record
    const oldPeminjaman = await query(getOldPeminjamanQuery, [id]);

    if (!oldPeminjaman) {
      throw new Error("Peminjaman not found");
    }

    // Update the peminjaman record
    await query(updatePeminjamanQuery, [
      id_barang,
      id_user,
      qty,
      ket,
      tgl_pinjam,
      durasi_pinjam,
      id,
    ]);

    // Commit transaction
    await query("COMMIT");

    const userQueryResult = await query(getUserEmailQuery, [id_user]);
    const userPeminjam = userQueryResult[0].email;
    const userNama = userQueryResult[0].nama;
    const barangNameQueryResult = await query(getBarangNameQuery, [id_barang]);
    const nama_barang = barangNameQueryResult[0].nama_barang;
    await sendMail(
      userPeminjam,
      "Peminjaman Berhasil",
      "Peminjaman Anda berhasil",
      `<p>Halo,</p>
    <p>Terima kasih telah melakukan <strong>pembaharuan</strong> peminjaman barang. Berikut adalah detail peminjaman Anda:</p>
    <ul>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
      <li><strong>Keperluan:</strong> ${ket}</li>
      <li><strong>Durasi Pinjam:</strong> ${durasi_pinjam}</li>
    </ul>
    <p>Terima kasih atas perhatiannya.</p>
    <p>Salam,</p>
    <p>Tim Administrasi</p>`
    );

    const adminEmail = "tajulmunandar701@gmail.com"; // Ganti dengan email admin
    await sendMail(
      adminEmail,
      "Peminjaman Baru",
      "Ada peminjaman baru",
      `<p>Halo,</p>
    <p>Ada peminjaman baru yang perlu ditinjau. Berikut adalah detail peminjaman yang perlu ditinjau:</p>
    <ul>
      <li><strong>Nama:</strong> ${userNama}</li>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
      <li><strong>Keperluan:</strong> ${ket}</li>
      <li><strong>Durasi Pinjam:</strong> ${durasi_pinjam}</li>
    </ul>
    <p>Terima kasih atas perhatiannya.</p>
    <p>Salam,</p>
    <p>Tim Administrasi</p>`
    );

    res.json({ message: "Update successful" });
  } catch (err) {
    // Rollback transaction in case of error
    await query("ROLLBACK");
    throw err;
  }
};

export const approvePeminjaman = async (req, res) => {
  const { id } = req.params;
  const updateStatusPeminjamanQuery = `
  UPDATE peminjaman
  SET status = '1'
  WHERE id_peminjaman = ?
`;

  const updateBarangQuery = `
  UPDATE Barang
  SET jumlah = jumlah - ?
  WHERE id_barang = ? AND jumlah >= ?
`;

  const getPeminjamanQuery = `
SELECT p.*, b.nama_barang, u.nama
FROM peminjaman p
INNER JOIN Barang b ON p.id_barang = b.id_barang
INNER JOIN User u ON p.id_user = u.id_user
WHERE p.id_peminjaman = ?
`;

  const getUserEmailQuery = `
    SELECT u.email
    FROM user u
    INNER JOIN Peminjaman p ON u.id_user = p.id_user
    WHERE p.id_peminjaman = ?
  `;

  try {
    // Update status of peminjaman
    const peminjamanResult = await query(getPeminjamanQuery, [id]);

    if (!peminjamanResult) {
      throw new Error("Peminjaman tidak ditemukan");
    }
    const peminjaman = peminjamanResult[0];

    const { id_barang, qty, nama_barang, nama } = peminjaman;

    const updateBarangResult = await query(updateBarangQuery, [
      qty,
      id_barang,
      qty,
    ]);

    if (updateBarangResult.affectedRows === 0) {
      throw new Error(
        "Jumlah barang tidak mencukupi atau barang tidak ditemukan"
      );
    }

    const updateStatusResult = await query(updateStatusPeminjamanQuery, [id]);

    if (updateStatusResult.affectedRows === 0) {
      throw new Error("Gagal mengupdate status peminjaman");
    }

    const userQueryResult = await query(getUserEmailQuery, [id]);
    const userPeminjam = userQueryResult[0].email;

    await sendMail(
      userPeminjam,
      "Peminjaman Berhasil",
      "Peminjaman Anda berhasil",
      `<p>Halo, ${nama}</p>
    <p>Terima kasih telah melakukan peminjaman barang. Berikut adalah detail peminjaman Anda:</p>
    <ul>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
    </ul>
    <p>Peminjaman Kamu Telah Disetejui.</p>
    <p>Tim Administrasi</p>`
    );

    res.json({ message: "Peminjaman Approved successfully" });
  } catch (err) {
    throw err;
  }
};

export const rejectPeminjaman = async (req, res) => {
  const { id } = req.params;

  const updateStatusPeminjamanQuery = `
    UPDATE peminjaman
    SET status = '2' 
    WHERE id_peminjaman = ?
  `;

  const getPeminjamanQuery = `
  SELECT p.*, b.nama_barang, u.nama
  FROM peminjaman p
  INNER JOIN Barang b ON p.id_barang = b.id_barang
  INNER JOIN User u ON p.id_user = u.id_user
  WHERE p.id_peminjaman = ?
  `;

  const getUserEmailQuery = `
    SELECT u.email
    FROM user u
    INNER JOIN Peminjaman p ON u.id_user = p.id_user
    WHERE p.id_peminjaman = ?
  `;

  try {
    // Mendapatkan data peminjaman
    const peminjamanResult = await query(getPeminjamanQuery, [id]);
    if (!peminjamanResult) {
      throw new Error("Peminjaman tidak ditemukan");
    }
    const { qty, nama_barang, nama } = peminjamanResult[0];

    // Mengupdate status peminjaman menjadi 'ditolak'
    const updateStatusResult = await query(updateStatusPeminjamanQuery, [id]);

    if (updateStatusResult.affectedRows === 0) {
      throw new Error("Gagal mengupdate status peminjaman");
    }

    // Mengambil email pengguna yang melakukan peminjaman
    const userQueryResult = await query(getUserEmailQuery, [id]);
    if (!userQueryResult) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const userPeminjam = userQueryResult[0].email;

    // Mengirim email pemberitahuan kepada pengguna
    await sendMail(
      userPeminjam,
      "Peminjaman Ditolak",
      "Peminjaman Anda ditolak",
      `<p>Halo, ${nama}</p>
    <p>Terima kasih telah melakukan peminjaman barang. Berikut adalah detail peminjaman Anda:</p>
    <ul>
      <li><strong>Barang:</strong> ${nama_barang}</li>
      <li><strong>Jumlah:</strong> ${qty}</li>
    </ul>
    <p>Maaf Peminjaman Anda ditolak!</p>
    <p>Tim Administrasi</p>`
    );

    res.json({ message: "Peminjaman Rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveReturnPeminjaman = async (req, res) => {
  const { id } = req.params;
  const tgl_kembali = new Date();

  const sql = "SELECT * FROM peminjaman WHERE id_peminjaman = ?";
  const getUserEmailQuery = `
  SELECT u.email
  FROM user u
  INNER JOIN Peminjaman p ON u.id_user = p.id_user
  WHERE p.id_peminjaman = ?
`;

  const updatePeminjamanQuery = `
    UPDATE Peminjaman
    SET status = 3, tgl_kembali = ?
    WHERE id_peminjaman = ?
  `;

  const updateBarangQuery = `
    UPDATE Barang
    SET jumlah = jumlah + ?
    WHERE id_barang = ?
  `;

  try {
    // Get the old peminjaman record
    const result = await query(sql, [id]);

    if (!result) {
      throw new Error("Peminjaman not found");
    }

    const idBarang = result[0].id_barang;
    const qty = result[0].qty;

    // Begin transaction
    await query("START TRANSACTION");

    // Update the peminjaman record
    await query(updatePeminjamanQuery, [tgl_kembali, id]);

    // Update the barang quantity
    await query(updateBarangQuery, [qty, idBarang]);

    // Commit transaction
    await query("COMMIT");

    const userQueryResult = await query(getUserEmailQuery, [id]);
    const userPeminjam = userQueryResult[0].email;
    await sendMail(
      userPeminjam,
      "Peminjaman Selesai",
      "Peminjaman Anda Sudah Selesai",
      "<p>Peminjaman yang anda Telah Selesai!</p>"
    );

    res.json({ message: "Peminjaman returned successfully" });
  } catch (err) {
    // Rollback transaction if error occurs
    await query("ROLLBACK");
    throw err;
  }
};
