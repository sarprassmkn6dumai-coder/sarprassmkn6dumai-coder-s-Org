export type UserRole = 'admin_sarpras' | 'waka_sarpras' | 'guru' | 'staf' | 'siswa' | 'publik';

export interface User {
  id: string;
  name: string;
  username: string; // NIP or NISN or account identifier
  password?: string;
  role: UserRole;
  jabatan: string;
  jurusan?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  registeredAt?: string;
}

export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type AssetStatus = 'Tersedia' | 'Dipinjam' | 'Dalam Perbaikan' | 'Dihapuskan';

export interface AssetItem {
  id: string;
  kode: string; // e.g. "AST-SMK6-LIS-001"
  nama: string;
  kategori: string; // Alat Praktek, Elektronik, Mebel, Kendaraan, Mesin
  ruanganId: string;
  ruanganNama: string;
  jurusan: string; // Teknik Ketenagalistrikan, Teknik Kimia, Umum, Kantor
  jumlah: number;
  satuan: string; // Unit, Set, Pcs, Buah
  kondisi: AssetCondition;
  status: AssetStatus;
  tahunPerolehan: number;
  sumberDana: string; // BOS Reguler, BOS Kinerja, BPOPP, DAK, Hibah
  hargaPerolehan: number;
  keterangan?: string;
  spesifikasi?: string;
  terakhirDiperiksa?: string;
}

export type UrgencyLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';
export type ReportStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';

export interface DamageReport {
  id: string;
  tiket: string; // e.g. "LAP-2026-001"
  pelaporNama: string;
  pelaporRole: string;
  pelaporNIP: string;
  assetKode?: string;
  assetNama: string;
  lokasiRuangan: string;
  deskripsi: string;
  urgensi: UrgencyLevel;
  fotoUrl?: string;
  status: ReportStatus;
  tanggalLapor: string;
  tindakLanjut?: string;
  teknisiNama?: string;
  tanggalSelesai?: string;
}

export interface MaintenanceRecord {
  id: string;
  kodeAset: string;
  namaAset: string;
  lokasiRuangan: string;
  jadwalTanggal: string;
  jenisPerawatan: string; // Servis Rutin, Penggantian Komponen, Kalibrasi, Pembersihan
  teknisiPIC: string;
  biaya: number;
  status: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai';
  catatan?: string;
  tanggalSelesai?: string;
}

export interface PurchaseRequest {
  id: string;
  nomorSurat: string;
  pemohonNama: string;
  pemohonJabatan: string;
  jurusanBengkel: string;
  namaBarang: string;
  spesifikasi: string;
  jumlah: number;
  satuan: string;
  estimasiHargaSatuan: number;
  totalEstimasi: number;
  alasanKebutuhan: string;
  tanggalPengajuan: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Revisi';
  catatanWaka?: string;
}

export type LoanStatus = 'Aktif' | 'Selesai' | 'Terlambat' | 'Dipinjam' | 'Dikembalikan';

export interface LoanItem {
  id: string;
  nomorPeminjaman?: string;
  kodePinjam?: string;
  peminjamNama: string;
  peminjamRole: string;
  peminjamKontak: string;
  assetId?: string;
  itemId?: string;
  assetKode?: string;
  assetNama?: string;
  itemNama?: string;
  tipe?: 'Barang' | 'Ruangan';
  satuan?: string;
  jumlah: number;
  tanggalPinjam: string;
  rencanaKembali: string;
  tanggalKembali?: string;
  realisasiKembali?: string;
  status: LoanStatus;
  keperluan: string;
  kondisiPinjam?: AssetCondition | string;
  kondisiKembali?: AssetCondition | string;
  catatanPengembalian?: string;
  catatanKembali?: string;
}

export interface RoomItem {
  id: string;
  kodeRuang: string;
  namaRuang: string;
  kategori?: 'Bengkel Kejuruan' | 'Laboratorium' | 'Ruang Kelas' | 'Kantor & TU' | 'Fasilitas Umum' | string;
  jurusan: string;
  kapasitas: number;
  penanggungJawab: string;
  kontakPJ?: string;
  fotoUrl?: string;
  kondisiRuang?: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan';
  totalAsetCount?: number;
  nipPJ?: string;
  luasMeter?: number;
  kondisi?: string;
  keterangan?: string;
}

export interface DocumentItem {
  id: string;
  nomorDokumen: string;
  judul: string;
  kategori: 'SK' | 'BAST' | 'Hibah' | 'SOP' | 'Inventarisasi' | 'Manual Book' | 'KIR' | 'Surat Tugas' | 'Lainnya';
  tanggalDokumen: string;
  fileUrl: string;
  fileSize: string;
  keterangan: string;
  uploader?: string;
}

export type SarprasDocument = DocumentItem;

export type ProcurementStage = 'Penyusunan RAP' | 'Proses Pembelian' | 'Penerimaan Barang' | 'Selesai (Masuk Inventaris)';

export interface ProcurementItem {
  id: string;
  kodeRAP: string;
  namaPengadaan: string;
  sumberAnggaran: string;
  paguAnggaran: number;
  realisasiHarga: number;
  tahunAnggaran: string;
  tahapan: ProcurementStage;
  vendorRekanan: string;
  daftarBarang: {
    nama: string;
    kategori: string;
    jumlah: number;
    satuan: string;
    ruanganTujuan: string;
    jurusan: string;
  }[];
  tanggalMulai: string;
  targetSelesai: string;
  sudahDimasukkanKeInventaris: boolean;
}

export interface VendorItem {
  id: string;
  namaCV: string;
  kategori: string;
  kontakPIC: string;
  telepon: string;
  email: string;
  alamat: string;
  rating: number;
}

export interface ProcurementOrder {
  id: string;
  nomorSPK: string;
  judulPengadaan: string;
  vendorId: string;
  vendorNama: string;
  sumberDana: string;
  totalNilai: number;
  tanggalSPK: string;
  estimasiSelesai: string;
  status: 'Perencanaan' | 'SPK Terbit' | 'Pengiriman' | 'Selesai BAST';
  catatan?: string;
}

export interface BudgetRecord {
  id: string;
  tahunAjaran: string;
  mataAnggaran: string;
  sumberDana: string;
  paguTotal: number;
  realisasiTotal: number;
  keterangan: string;
}

export interface BudgetExpense {
  id: string;
  tanggal: string;
  uraian: string;
  nominal: number;
  kategori: 'Belanja Modal' | 'Belanja Barang & Jasa' | 'Pemeliharaan';
}

export interface BudgetAllocation {
  id: string;
  sumberDana: string;
  pagu: number;
  realisasi: number;
  sisa: number;
  rincianPengeluaran: BudgetExpense[];
}

export interface StorageConfig {
  gasWebAppUrl: string;
  spreadsheetId: string;
  driveFolderId: string;
  autoSync: boolean;
  lastSyncTimestamp?: string;
}

export interface AssetManagerHistoryItem {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  semester: string;
  nomorSK?: string;
  tanggalPenetapan: string;
  diubahOleh: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  wakaSarpras: string;
  nipWakaSarpras: string;
  pengelolaAset: string;
  nipPengelolaAset?: string;
  jabatanPengelolaAset?: string;
  semesterAktif?: string;
  skPengelolaAset?: string;
  riwayatPengelolaAset?: AssetManagerHistoryItem[];
  telepon: string;
  email: string;
  website: string;
  logoUrl?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'inventaris'
  | 'qrcode'
  | 'qr-code'
  | 'laporan-kerusakan'
  | 'pemeliharaan'
  | 'pengajuan-barang'
  | 'peminjaman'
  | 'ruangan'
  | 'dokumen'
  | 'pengadaan'
  | 'anggaran'
  | 'laporan'
  | 'pengaturan';
