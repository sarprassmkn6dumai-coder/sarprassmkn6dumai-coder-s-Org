export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SIM-SARPRAS SMKN 6 DUMAI - GOOGLE APPS SCRIPT BACKEND & DATABASE ENGINE
 * =========================================================================
 * Sistem Informasi Manajemen Sarana & Prasarana
 * SMK Negeri 6 Dumai - Provinsi Riau
 * 
 * FUNGSI UTAMA:
 * 1. Database Google Sheets: Otomatisasi tabel inventaris, laporan, pinjaman, dsb.
 * 2. Cloud Storage Google Drive: Otomatisasi upload berkas foto aset, bukti kerusakan, PDF.
 * 3. REST API Web App Endpoint (doGet & doPost) untuk integrasi 2 arah.
 * 
 * CARA INSTALASI MUDAH (3 MENIT):
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Beri nama Spreadsheet: "DATABASE SIM-SARPRAS SMKN 6 DUMAI"
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script
 * 4. Hapus semua kode default, lalu PASTE seluruh kode ini ke dalam editor
 * 5. Pada dropdown fungsi di atas, pilih "setupDatabaseDanFolder" lalu klik "Jalankan" (Run)
 *    (Berikan izin/otentikasi Google saat diminta)
 * 6. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Penerapan baru" (New Deployment)
 * 7. Pilih tipe: "Aplikasi Web" (Web App)
 *    - Deskripsi: SIM-SARPRAS SMKN 6 Dumai v1.0
 *    - Jalankan sebagai: Saya (Email Anda)
 *    - Yang memiliki akses: Siapa saja (Anyone)  <-- PENTING!
 * 8. Klik "Terapkan" (Deploy) dan SALIN URL Aplikasi Web (Web App URL)
 * 9. Tempelkan URL tersebut ke Menu "Pengaturan" di aplikasi SIM-SARPRAS!
 * =========================================================================
 */

// KONFIGURASI GLOBAL
var DRIVE_FOLDER_NAME = "SIM-SARPRAS_SMKN6_DUMAI_MEDIA";
var SHEET_NAMES = {
  INVENTARIS: "Data_Inventaris",
  LAPORAN_KERUSAKAN: "Laporan_Kerusakan",
  PEMELIHARAAN: "Jadwal_Pemeliharaan",
  PENGAJUAN_BARANG: "Pengajuan_Barang",
  PEMINJAMAN: "Data_Peminjaman",
  RUANGAN: "Data_Ruangan",
  DOKUMEN: "Dokumen_Digital",
  PENGADAAN: "Pengadaan_RAP",
  ANGGARAN: "Anggaran_Keuangan"
};

/**
 * Endpoint HTTP GET (Untuk membaca data / Read API)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return responseJson({
        status: "success",
        message: "SIM-SARPRAS SMKN 6 Dumai Backend API aktif dan terhubung.",
        timestamp: new Date().toISOString(),
        spreadsheetName: ss.getName()
      });
    }

    if (action === "getAllData") {
      var allData = {
        assets: getSheetDataAsObjects(ss, SHEET_NAMES.INVENTARIS),
        damageReports: getSheetDataAsObjects(ss, SHEET_NAMES.LAPORAN_KERUSAKAN),
        maintenanceRecords: getSheetDataAsObjects(ss, SHEET_NAMES.PEMELIHARAAN),
        purchaseRequests: getSheetDataAsObjects(ss, SHEET_NAMES.PENGAJUAN_BARANG),
        loans: getSheetDataAsObjects(ss, SHEET_NAMES.PEMINJAMAN),
        rooms: getSheetDataAsObjects(ss, SHEET_NAMES.RUANGAN),
        documents: getSheetDataAsObjects(ss, SHEET_NAMES.DOKUMEN),
        procurements: getSheetDataAsObjects(ss, SHEET_NAMES.PENGADAAN),
        budgets: getSheetDataAsObjects(ss, SHEET_NAMES.ANGGARAN)
      };

      return responseJson({
        status: "success",
        data: allData,
        message: "Seluruh data berhasil diambil dari Google Sheets."
      });
    }

    if (action === "getAssets") {
      return responseJson({
        status: "success",
        data: getSheetDataAsObjects(ss, SHEET_NAMES.INVENTARIS)
      });
    }

    return responseJson({
      status: "error",
      message: "Action '" + action + "' tidak dikenali."
    });

  } catch (err) {
    return responseJson({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Endpoint HTTP POST (Untuk menulis data, sinkronisasi, & upload file ke Google Drive)
 */
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. SINKRONISASI BATCH / SYNC SEMUA DATA DARI WEB APP KE GOOGLE SHEETS
    if (action === "syncAll") {
      var data = payload.data;
      if (data.assets) replaceSheetData(ss, SHEET_NAMES.INVENTARIS, data.assets);
      if (data.damageReports) replaceSheetData(ss, SHEET_NAMES.LAPORAN_KERUSAKAN, data.damageReports);
      if (data.maintenanceRecords) replaceSheetData(ss, SHEET_NAMES.PEMELIHARAAN, data.maintenanceRecords);
      if (data.purchaseRequests) replaceSheetData(ss, SHEET_NAMES.PENGAJUAN_BARANG, data.purchaseRequests);
      if (data.loans) replaceSheetData(ss, SHEET_NAMES.PEMINJAMAN, data.loans);
      if (data.rooms) replaceSheetData(ss, SHEET_NAMES.RUANGAN, data.rooms);
      if (data.documents) replaceSheetData(ss, SHEET_NAMES.DOKUMEN, data.documents);
      if (data.procurements) replaceSheetData(ss, SHEET_NAMES.PENGADAAN, data.procurements);
      if (data.budgets) replaceSheetData(ss, SHEET_NAMES.ANGGARAN, data.budgets);

      return responseJson({
        status: "success",
        message: "Sinkronisasi seluruh data ke Google Sheets berhasil!",
        lastSync: new Date().toISOString()
      });
    }

    // 2. UPLOAD FILE MEDIA KE GOOGLE DRIVE
    if (action === "uploadMedia") {
      var fileName = payload.fileName || ("Upload_" + new Date().getTime());
      var mimeType = payload.mimeType || "image/jpeg";
      var base64Data = payload.base64Data; // Raw base64 string tanpa prefix data:...;base64,

      if (base64Data.indexOf(",") > -1) {
        base64Data = base64Data.split(",")[1];
      }

      var decodedBytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      // Cari atau buat folder di Drive
      var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return responseJson({
        status: "success",
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        message: "File berhasil diunggah ke Google Drive SMKN 6 Dumai."
      });
    }

    // 3. TAMBAH LAPORAN KERUSAKAN BARU
    if (action === "addDamageReport") {
      var report = payload.report;
      var sheet = getOrCreateSheet(ss, SHEET_NAMES.LAPORAN_KERUSAKAN);
      sheet.appendRow([
        report.id || ("lap-" + new Date().getTime()),
        report.tiket || "",
        report.pelaporNama || "",
        report.pelaporRole || "",
        report.pelaporNIP || "",
        report.assetKode || "",
        report.assetNama || "",
        report.lokasiRuangan || "",
        report.deskripsi || "",
        report.urgensi || "Sedang",
        report.fotoUrl || "",
        report.status || "Menunggu",
        report.tanggalLapor || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
        report.tindakLanjut || "",
        report.teknisiNama || ""
      ]);

      return responseJson({
        status: "success",
        message: "Laporan kerusakan berhasil dicatat di Google Sheets.",
        reportTiket: report.tiket
      });
    }

    return responseJson({
      status: "error",
      message: "Action POST '" + action + "' tidak dikenali."
    });

  } catch (err) {
    return responseJson({
      status: "error",
      message: "Gagal memproses request: " + err.toString()
    });
  }
}

/**
 * FUNGSI SETUP: Inisialisasi Otomatis Semua Sheet & Folder Drive
 * Jalankan fungsi ini sekali setelah menempelkan kode di Apps Script!
 */
function setupDatabaseDanFolder() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Folder Google Drive
  var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
  Logger.log("Folder Drive siap: " + folder.getUrl());

  // 2. Setup Sheet Inventaris
  setupSheet(ss, SHEET_NAMES.INVENTARIS, [
    "ID", "Kode Barang", "Nama Barang", "Kategori", "ID Ruangan", 
    "Nama Ruangan", "Jurusan", "Jumlah", "Satuan", "Kondisi", 
    "Status", "Tahun Perolehan", "Sumber Dana", "Harga Perolehan", 
    "Spesifikasi", "Keterangan", "Terakhir Diperiksa"
  ]);

  // 3. Setup Sheet Laporan Kerusakan
  setupSheet(ss, SHEET_NAMES.LAPORAN_KERUSAKAN, [
    "ID", "Tiket", "Nama Pelapor", "Role Pelapor", "NIP/NISN",
    "Kode Aset", "Nama Aset", "Lokasi Ruangan", "Deskripsi Kerusakan",
    "Urgensi", "Foto URL", "Status", "Tanggal Lapor", "Tindak Lanjut", "Teknisi PIC"
  ]);

  // 4. Setup Sheet Jadwal Pemeliharaan
  setupSheet(ss, SHEET_NAMES.PEMELIHARAAN, [
    "ID", "Kode Aset", "Nama Aset", "Lokasi Ruangan", "Jadwal Tanggal",
    "Jenis Perawatan", "Teknisi PIC", "Estimasi Biaya", "Status", "Catatan"
  ]);

  // 5. Setup Sheet Pengajuan Barang Baru
  setupSheet(ss, SHEET_NAMES.PENGAJUAN_BARANG, [
    "ID", "Nomor Surat", "Pemohon Nama", "Pemohon Jabatan", "Jurusan/Bengkel",
    "Nama Barang", "Spesifikasi", "Jumlah", "Satuan", "Estimasi Satuan",
    "Total Estimasi", "Alasan Kebutuhan", "Tanggal Pengajuan", "Status", "Catatan Waka"
  ]);

  // 6. Setup Sheet Data Peminjaman
  setupSheet(ss, SHEET_NAMES.PEMINJAMAN, [
    "ID", "Nomor Pinjam", "Nama Peminjam", "Role Peminjam", "No Kontak",
    "ID Aset", "Kode Aset", "Nama Aset", "Jumlah", "Tgl Pinjam",
    "Rencana Kembali", "Tgl Kembali", "Status", "Keperluan", "Kondisi Pinjam", "Kondisi Kembali"
  ]);

  // 7. Setup Sheet Data Ruangan
  setupSheet(ss, SHEET_NAMES.RUANGAN, [
    "ID", "Kode Ruang", "Nama Ruang", "Kategori", "Jurusan",
    "Kapasitas", "Penanggung Jawab", "Kontak PJ", "Kondisi Ruang", "Total Aset"
  ]);

  // 8. Setup Sheet Dokumen Digital
  setupSheet(ss, SHEET_NAMES.DOKUMEN, [
    "ID", "Nomor Dokumen", "Judul Dokumen", "Kategori", "Tanggal Dokumen",
    "File URL", "Ukuran File", "Keterangan", "Uploader"
  ]);

  // 9. Setup Sheet Pengadaan RAP
  setupSheet(ss, SHEET_NAMES.PENGADAAN, [
    "ID", "Kode RAP", "Nama Pengadaan", "Sumber Anggaran", "Pagu Anggaran",
    "Realisasi Harga", "Tahun Anggaran", "Tahapan", "Vendor Rekanan", "Tgl Mulai", "Target Selesai"
  ]);

  // 10. Setup Sheet Anggaran Keuangan
  setupSheet(ss, SHEET_NAMES.ANGGARAN, [
    "ID", "Tahun Ajaran", "Mata Anggaran", "Sumber Dana", "Pagu Total",
    "Realisasi Total", "Keterangan"
  ]);

  SpreadsheetApp.getUi().alert(
    "SUKSES!\\n\\nDatabase Google Sheets dan Folder Google Drive untuk SIM-SARPRAS SMKN 6 Dumai telah berhasil dibuat dan ditata secara otomatis.\\n\\nLangkah berikutnya:\\n1. Klik tombol 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment)\\n2. Pilih jenis 'Aplikasi Web'\\n3. Set Akses: 'Siapa saja' (Anyone)\\n4. Salin Web App URL dan tempel ke SIM-SARPRAS web app."
  );
}

// -------------------------------------------------------------
// FUNGSI PEMBANTU (HELPER UTILITIES)
// -------------------------------------------------------------

function setupSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F172A");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    for (var col = 1; col <= headers.length; col++) {
      sheet.setColumnWidth(col, 160);
    }
  }
  return sheet;
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getSheetDataAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var result = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = toCamelCase(headers[j]);
      obj[key] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function replaceSheetData(ss, sheetName, items) {
  if (!items || !items.length) return;
  var sheet = getOrCreateSheet(ss, sheetName);
  
  // Jika sheet kosong, beri header dari keys
  var keys = Object.keys(items[0]);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  var dataRows = [];
  for (var i = 0; i < items.length; i++) {
    var row = [];
    for (var j = 0; j < keys.length; j++) {
      var val = items[i][keys[j]];
      if (typeof val === "object") {
        row.push(JSON.stringify(val));
      } else {
        row.push(val !== undefined && val !== null ? val : "");
      }
    }
    dataRows.push(row);
  }

  if (dataRows.length > 0) {
    sheet.getRange(2, 1, dataRows.length, keys.length).setValues(dataRows);
  }
}

function toCamelCase(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/(?:^\\w|[A-Z]|\\b\\w)/g, function(letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\\s+/g, "");
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GAS_CODE_SNIPPET = GOOGLE_APPS_SCRIPT_CODE;

export const GAS_DEPLOYMENT_INSTRUCTIONS = [
  'Buka Google Sheets baru di https://sheets.new dengan nama "SIM-SARPRAS SMKN 6 DUMAI"',
  'Klik menu Ekstensi > Apps Script',
  'Hapus isi kode default, lalu salin (paste) seluruh kode Google Apps Script di atas',
  'Pilih fungsi setupDatabaseDanFolder pada dropdown lalu klik Jalankan (Run) untuk inisialisasi sheet otomatis',
  'Klik tombol biru Terapkan (Deploy) di kanan atas > Penerapan baru (New Deployment)',
  'Pilih tipe: Aplikasi Web (Web App)',
  'Set "Yang memiliki akses (Who has access)" ke "Siapa saja (Anyone)"',
  'Salin URL Aplikasi Web yang dihasilkan dan tempelkan ke kolom Web App URL di Pengaturan SIM-SARPRAS'
];
