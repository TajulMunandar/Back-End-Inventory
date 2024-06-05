-- Create User table
CREATE TABLE User (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telepon VARCHAR(20),
    nik VARCHAR(20),
    divisi VARCHAR(50),
    is_admin BOOLEAN DEFAULT FALSE,
    perusahaan VARCHAR(100)
);

-- Create Barang table
CREATE TABLE Barang (
    id_barang INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    nomor_seri VARCHAR(255) UNIQUE,
    jumlah INT NOT NULL,
    supplier VARCHAR(255),
    kepemilikan VARCHAR(50),
    status VARCHAR(50),
    tgl_pembelian DATE
);

-- Create Peminjaman table
CREATE TABLE Peminjaman (
    id_peminjaman INT AUTO_INCREMENT PRIMARY KEY,
    id_barang INT,
    id_user INT,
    qty INT NOT NULL,
    ket TEXT,
    tgl_pinjam DATE NOT NULL,
    durasi_pinjam DATE NOT NULL,
    tgl_kembali DATE,
    status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_barang) REFERENCES Barang(id_barang),
    FOREIGN KEY (id_user) REFERENCES User(id_user)
);
