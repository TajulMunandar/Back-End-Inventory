import { query } from "../database/db.js";
import { body, validationResult } from "express-validator";
import { sendMail } from "./mailer.js";

export const getPeminjaman = async (req, res) => {
  const sql = "SELECT * FROM Peminjaman";
  try {
    const peminjamans = await query(sql);
    res.json(peminjamans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPeminjamanById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Peminjaman WHERE id_peminjaman = ?";
  try {
    const peminjaman = await query(sql, [id]);
    if (peminjaman.length === 0)
      return res.status(404).json({ message: "Peminjaman not found" });
    res.json(barang[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPeminjamanByUser = async (req, res) => {
  const id = req.userId;
  const sql = "SELECT * FROM Peminjaman WHERE id_user = ?";
  try {
    const peminjaman = await query(sql, [id]);
    if (peminjaman.length === 0)
      return res.status(404).json({ message: "Peminjaman not found" });
    res.json(peminjaman[0]);
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
  body("durasi_pinjam")
    .isInt({ min: 1 })
    .withMessage("Durasi Pinjam must be an integer greater than 0"),
];

export const createPeminjaman = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id_barang, id_user, ket, qty, tgl_pinjam, durasi_pinjam } = req.body;

  const insertPeminjamanQuery = `
    INSERT INTO Peminjaman (id_barang, id_user, ket, qty, tgl_pinjam, durasi_pinjam)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const updateBarangQuery = `
    UPDATE Barang
    SET jumlah = jumlah - ?
    WHERE id_barang = ? AND jumlah >= ?
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

    // Update Barang
    const updateBarangResult = await query(updateBarangQuery, [
      qty,
      id_barang,
      qty,
    ]);

    // Check if any row is affected
    if (updateBarangResult.affectedRows === 0) {
      await query("ROLLBACK");
      return res.status(400).json({ error: "Not enough items in stock" });
    }

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

  const getBarangQtyQuery = "SELECT jumlah FROM Barang WHERE id_barang = ?";
  const updateBarangQuery =
    "UPDATE Barang SET jumlah = jumlah + ? - ? WHERE id_barang = ? AND jumlah >= ? ";

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

    const oldQty = oldPeminjaman[0].qty;
    const oldIdBarang = oldPeminjaman[0].id_barang;
    const newIdBarang = id_barang;
    const newQty = qty;

    // Check if the new quantity is available in stock
    const barang = await query(getBarangQtyQuery, [newIdBarang]);
    if (!barang.length || barang[0].jumlah < newQty - oldQty) {
      throw new Error("Not enough items in stock");
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

    // Update the stock of the old and new barang
    if (oldIdBarang !== newIdBarang) {
      await query("UPDATE Barang SET jumlah = jumlah + ? WHERE id_barang = ?", [
        oldQty,
        oldIdBarang,
      ]);
      await query(updateBarangQuery, [0, newQty, newIdBarang, newQty]);
    } else {
      await query(updateBarangQuery, [
        oldQty,
        newQty,
        newIdBarang,
        newQty - oldQty,
      ]);
    }

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
  const sql = "UPDATE Peminjaman SET status = 1 WHERE id_peminjaman = ? ";
  const getUserEmailQuery = `
    SELECT u.email
    FROM user u
    INNER JOIN Peminjaman p ON u.id_user = p.id_user
    WHERE p.id_peminjaman = ?
  `;

  try {
    // Update status of peminjaman
    const result = await query(sql, [id]);

    const userQueryResult = await query(getUserEmailQuery, [id]);
    const userPeminjam = userQueryResult[0].email;
    await sendMail(
      userPeminjam,
      "Peminjaman Berhasil",
      "Peminjaman Anda berhasil",
      "<p>Peminjaman Anda Telah di setujui</p>"
    );

    if (!result) {
      throw new Error("Failed to update peminjaman status");
    }

    res.json({ message: "Peminjaman Approved successfully" });
  } catch (err) {
    throw err;
  }
};

export const approveReturnPeminjaman = async (req, res) => {
  const { id } = req.params;
  const { tgl_kembali } = req.body;

  const sql = "SELECT * FROM peminjaman WHERE id_peminjaman = ?";
  const getUserEmailQuery = `
  SELECT u.email
  FROM user u
  INNER JOIN Peminjaman p ON u.id_user = p.id_user
  WHERE p.id_peminjaman = ?
`;

  const updatePeminjamanQuery = `
    UPDATE Peminjaman
    SET status = 0, tgl_kembali = ?
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
      "Peminjaman Berhasil",
      "Peminjaman Anda berhasil",
      "<p>Peminjaman yang anda kembalikan telah disetujui</p>"
    );

    res.json({ message: "Peminjaman returned successfully" });
  } catch (err) {
    // Rollback transaction if error occurs
    await query("ROLLBACK");
    throw err;
  }
};
