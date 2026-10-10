import {
  AssetItem,
  DamageReport,
  MaintenanceRecord,
  PurchaseRequest,
  LoanItem,
  RoomItem,
  DocumentItem,
  ProcurementItem,
  ProcurementOrder,
  VendorItem,
  BudgetRecord,
  BudgetAllocation,
  SchoolProfile,
  StorageConfig,
  User,
} from '../types';
import {
  initialAssets,
  initialDamageReports,
  initialMaintenanceRecords,
  initialPurchaseRequests,
  initialLoans,
  initialRooms,
  initialDocuments,
  initialProcurements,
  initialBudgets,
  initialSchoolProfile,
  initialUsers,
  publicVisitorUser,
} from '../data/mockData';

const STORAGE_KEYS = {
  ASSETS: 'simsarpras_assets',
  DAMAGE_REPORTS: 'simsarpras_damage_reports',
  MAINTENANCE: 'simsarpras_maintenance',
  PURCHASE_REQUESTS: 'simsarpras_purchase_requests',
  LOANS: 'simsarpras_loans',
  ROOMS: 'simsarpras_rooms',
  DOCUMENTS: 'simsarpras_documents',
  PROCUREMENTS: 'simsarpras_procurements',
  PROCUREMENT_ORDERS: 'simsarpras_procurement_orders',
  VENDORS: 'simsarpras_vendors',
  BUDGETS: 'simsarpras_budgets',
  SCHOOL_PROFILE: 'simsarpras_school_profile',
  CURRENT_USER: 'simsarpras_current_user',
  USERS: 'simsarpras_users_v2',
  IS_LOGGED_IN: 'simsarpras_is_logged_in',
  GAS_CONFIG: 'simsarpras_gas_config',
  GAS_WEBHOOK_URL: 'simsarpras_gas_webhook_url',
  AUTO_SYNC_SHEETS: 'simsarpras_auto_sync_sheets',
  LAST_SYNC_TIME: 'simsarpras_last_sync_time',
};

const initialVendors: VendorItem[] = [
  {
    id: 'v-01',
    namaCV: 'PT. Dumai Cyber Informatika',
    kategori: 'Komputer & Jaringan',
    kontakPIC: 'Hendra Gunawan',
    telepon: '0812-7654-9988',
    email: 'info@dumaicyber.co.id',
    alamat: 'Jl. Jend. Sudirman No. 88, Kota Dumai',
    rating: 5,
  },
  {
    id: 'v-02',
    namaCV: 'CV. Samudra Teknik Industri',
    kategori: 'Peralatan Bengkel & Mesin',
    kontakPIC: 'Budi Santoso',
    telepon: '0813-8900-1122',
    email: 'sales@samudrateknik.com',
    alamat: 'Kawasan Industri Dumai Pelintung, Dumai',
    rating: 5,
  },
  {
    id: 'v-03',
    namaCV: 'CV. Karya Riau Mebelindo',
    kategori: 'Mebel & Interior',
    kontakPIC: 'Zulkifli Lubis',
    telepon: '0821-3344-5566',
    email: 'karyariau@gmail.com',
    alamat: 'Jl. Sukajadi No. 12, Dumai Barat',
    rating: 4,
  },
];

const initialProcurementOrders: ProcurementOrder[] = [
  {
    id: 'ord-01',
    nomorSPK: 'SPK/SMK6/SARPRAS/2026/001',
    judulPengadaan: 'Pengadaan Trainer PLC & Panel Otomasi Tenaga Listrik Industri',
    vendorId: 'v-02',
    vendorNama: 'CV. Samudra Teknik Industri',
    sumberDana: 'BOS Kinerja',
    totalNilai: 72400000,
    tanggalSPK: '2026-08-01',
    estimasiSelesai: '2026-09-30',
    status: 'Pengiriman',
    catatan: 'Termasuk garansi resmi pabrikan 3 tahun dan instalasi rak server.',
  },
  {
    id: 'ord-02',
    nomorSPK: 'SPK/SMK6/SARPRAS/2026/002',
    judulPengadaan: 'Pengadaan Spektrofotometer UV-Vis & Glassware Laboratorium Kimia',
    vendorId: 'v-02',
    vendorNama: 'CV. Samudra Teknik Industri',
    sumberDana: 'DAK Fisik',
    totalNilai: 46500000,
    tanggalSPK: '2026-06-10',
    estimasiSelesai: '2026-08-20',
    status: 'Selesai BAST',
    catatan: 'BAST fisik ditandatangani 20 Agustus 2026.',
  },
];

const initialBudgetAllocations: BudgetAllocation[] = [
  {
    id: 'bgt-1',
    sumberDana: 'BOS Reguler',
    pagu: 127000000,
    realisasi: 55200000,
    sisa: 71800000,
    rincianPengeluaran: [
      {
        id: 'trx-1',
        tanggal: '2026-08-15',
        uraian: 'Perbaikan Instalasi Listrik dan Penggantian MCB 3 Phase Bengkel Mesin',
        nominal: 8500000,
        kategori: 'Pemeliharaan',
      },
      {
        id: 'trx-2',
        tanggal: '2026-09-02',
        uraian: 'Langganan Internet Dedicated 200 Mbps Fiber Optic',
        nominal: 21000000,
        kategori: 'Belanja Barang & Jasa',
      },
    ],
  },
  {
    id: 'bgt-2',
    sumberDana: 'BOS Kinerja',
    pagu: 150000000,
    realisasi: 72400000,
    sisa: 77600000,
    rincianPengeluaran: [
      {
        id: 'trx-3',
        tanggal: '2026-08-10',
        uraian: 'Pengadaan Trainer PLC Industri & Modul Otomasi Ketenagalistrikan',
        nominal: 72400000,
        kategori: 'Belanja Modal',
      },
    ],
  },
  {
    id: 'bgt-3',
    sumberDana: 'DAK Fisik',
    pagu: 120000000,
    realisasi: 46500000,
    sisa: 73500000,
    rincianPengeluaran: [
      {
        id: 'trx-4',
        tanggal: '2026-07-25',
        uraian: 'Pembelian Spektrofotometer UV-Vis & Instrumen Pengujian Laboratorium Kimia',
        nominal: 46500000,
        kategori: 'Belanja Modal',
      },
    ],
  },
  {
    id: 'bgt-4',
    sumberDana: 'BPOPP',
    pagu: 95000000,
    realisasi: 58900000,
    sisa: 36100000,
    rincianPengeluaran: [
      {
        id: 'trx-5',
        tanggal: '2026-08-20',
        uraian: 'Bahan Praktik Habis Pakai (Kabel NYAF, Kontaktor, Reagen Kimia p.a., Glassware)',
        nominal: 58900000,
        kategori: 'Belanja Barang & Jasa',
      },
    ],
  },
];

const defaultStorageConfig: StorageConfig = {
  gasWebAppUrl: '',
  spreadsheetId: '',
  driveFolderId: '',
  autoSync: false,
  lastSyncTimestamp: '',
};

export function normalizeJurusan(j?: string): string {
  if (!j) return 'Umum';
  const val = j.trim();
  if (['TKJ', 'Teknik Komputer & Jaringan', 'TKR', 'Teknik Kendaraan Ringan', 'Pengelasan', 'Teknik Pengelasan'].includes(val)) {
    return 'Teknik Ketenagalistrikan';
  }
  if (['DKV', 'Desain Komunikasi Visual', 'Kimia', 'Teknik Kimia'].includes(val)) {
    return 'Teknik Kimia';
  }
  return val;
}

// Auto migrate to ensure updated rooms and assets are immediately populated
try {
  if (typeof window !== 'undefined' && localStorage.getItem('simsarpras_rooms_theory_classes_v5') !== 'true') {
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.DAMAGE_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.PROCUREMENTS);
    localStorage.removeItem(STORAGE_KEYS.PROCUREMENT_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.setItem('simsarpras_rooms_theory_classes_v5', 'true');
  }
  // Ensure default visitor mode is public (read-only) unless explicitly logged in as admin
  if (typeof window !== 'undefined' && localStorage.getItem('simsarpras_public_visitor_default_v6') !== 'true') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.setItem('simsarpras_public_visitor_default_v6', 'true');
  }
} catch (e) {
  console.warn('Could not run storage migration:', e);
}

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  // Getters
  getAssets: (): AssetItem[] => {
    const list = getStoredData(STORAGE_KEYS.ASSETS, initialAssets);
    return list.map((item) => ({ ...item, jurusan: normalizeJurusan(item.jurusan) }));
  },
  getDamageReports: (): DamageReport[] => getStoredData(STORAGE_KEYS.DAMAGE_REPORTS, initialDamageReports),
  getMaintenance: (): MaintenanceRecord[] => getStoredData(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRecords),
  getMaintenanceRecords: (): MaintenanceRecord[] => getStoredData(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRecords),
  getPurchaseRequests: (): PurchaseRequest[] => {
    const list = getStoredData(STORAGE_KEYS.PURCHASE_REQUESTS, initialPurchaseRequests);
    return list.map((item) => ({ ...item, jurusanBengkel: normalizeJurusan(item.jurusanBengkel) }));
  },
  getLoans: (): LoanItem[] => getStoredData(STORAGE_KEYS.LOANS, initialLoans),
  getRooms: (): RoomItem[] => {
    const list = getStoredData(STORAGE_KEYS.ROOMS, initialRooms);
    return list.map((item) => ({ ...item, jurusan: normalizeJurusan(item.jurusan) }));
  },
  getDocuments: (): DocumentItem[] => getStoredData(STORAGE_KEYS.DOCUMENTS, initialDocuments),
  getProcurements: (): ProcurementItem[] => getStoredData(STORAGE_KEYS.PROCUREMENTS, initialProcurements),
  getProcurementOrders: (): ProcurementOrder[] => getStoredData(STORAGE_KEYS.PROCUREMENT_ORDERS, initialProcurementOrders),
  getVendors: (): VendorItem[] => getStoredData(STORAGE_KEYS.VENDORS, initialVendors),
  getBudgets: (): BudgetAllocation[] => getStoredData(STORAGE_KEYS.BUDGETS, initialBudgetAllocations),
  getSchoolProfile: (): SchoolProfile => {
    const profile = getStoredData(STORAGE_KEYS.SCHOOL_PROFILE, initialSchoolProfile);
    let needsSave = false;
    let updated: SchoolProfile = { ...profile };

    if (
      profile.npsn === '10495478' ||
      profile.npsn === '10495312' ||
      profile.kelurahan === 'Lubuk Gaung' ||
      (profile.alamat && profile.alamat.includes('Lubuk Gaung')) ||
      (profile.alamat && profile.alamat.includes('Jl. M.Yusuf'))
    ) {
      updated = {
        ...updated,
        npsn: '69972998',
        alamat: 'JL. Swadaya, Kel. Teluk Makmur, Kec. Medang Kampai Dumai – Riau 28825',
        kelurahan: 'Teluk Makmur',
        kecamatan: 'Medang Kampai',
        telepon: '085265298697',
        email: 'smkn6dumai2023@gmail.com',
        website: 'https://smkn6dumai.sch.id',
      };
      needsSave = true;
    }

    if (!updated.jabatanPengelolaAset) {
      updated.jabatanPengelolaAset = initialSchoolProfile.jabatanPengelolaAset || 'Pengelola Aset & Koordinator Sarpras';
      needsSave = true;
    }
    if (!updated.skPengelolaAset) {
      updated.skPengelolaAset = initialSchoolProfile.skPengelolaAset || 'SK/421.5/SMKN6-DMI/2026/014';
      needsSave = true;
    }
    if (!updated.riwayatPengelolaAset || updated.riwayatPengelolaAset.length === 0) {
      updated.riwayatPengelolaAset = initialSchoolProfile.riwayatPengelolaAset || [];
      needsSave = true;
    }

    if (needsSave) {
      setStoredData(STORAGE_KEYS.SCHOOL_PROFILE, updated);
    }
    return updated;
  },
  getCurrentUser: (): User => {
    const u = getStoredData(STORAGE_KEYS.CURRENT_USER, publicVisitorUser); // Default to public visitor (read-only)
    return { ...u, jurusan: u.jurusan ? normalizeJurusan(u.jurusan) : undefined };
  },
  getUsers: (): User[] => {
    const list = getStoredData(STORAGE_KEYS.USERS, initialUsers);
    return list.map((u) => ({ ...u, jurusan: u.jurusan ? normalizeJurusan(u.jurusan) : undefined }));
  },
  saveUsers: (users: User[]) => setStoredData(STORAGE_KEYS.USERS, users),

  updateAssetManager: (updatedManager: {
    name: string;
    jabatan: string;
    nip?: string;
    semester?: string;
    nomorSK?: string;
    username?: string;
    email?: string;
    phone?: string;
  }): User => {
    const currentUser = StorageService.getCurrentUser();
    // Hanya Admin / Pengelola Aset Sekolah itu sendiri yang diizinkan mengubah data Pengelola Aset
    if (currentUser.role !== 'admin_sarpras') {
      const users = StorageService.getUsers();
      return users.find((u) => u.role === 'admin_sarpras') || currentUser;
    }

    const users = StorageService.getUsers();
    let managerIndex = users.findIndex((u) => u.role === 'admin_sarpras' || u.id === 'usr-2');

    let updatedUser: User;
    if (managerIndex !== -1) {
      updatedUser = {
        ...users[managerIndex],
        name: updatedManager.name.trim(),
        jabatan: updatedManager.jabatan.trim(),
        username: updatedManager.username?.trim() || users[managerIndex].username,
        email: updatedManager.email?.trim() || users[managerIndex].email,
        phone: updatedManager.phone?.trim() || users[managerIndex].phone,
      };
      users[managerIndex] = updatedUser;
    } else {
      updatedUser = {
        id: 'usr-2',
        name: updatedManager.name.trim(),
        username: updatedManager.username?.trim() || 'pengelola.aset',
        password: 'admin123',
        role: 'admin_sarpras',
        jabatan: updatedManager.jabatan.trim(),
        email: updatedManager.email?.trim() || 'sarpras@smkn6dumai.sch.id',
        phone: updatedManager.phone?.trim() || '0813-8901-2345',
      };
      users.unshift(updatedUser);
    }

    StorageService.saveUsers(users);

    // Synchronize SchoolProfile & Semester History
    const currentSchool = StorageService.getSchoolProfile();
    const newNip = updatedManager.nip !== undefined ? updatedManager.nip.trim() : (currentSchool.nipPengelolaAset || '19880421 201101 1 003');
    const newSemester = updatedManager.semester !== undefined ? updatedManager.semester.trim() : (currentSchool.semesterAktif || 'Semester Ganjil TA 2026/2027');
    const newSK = updatedManager.nomorSK !== undefined ? updatedManager.nomorSK.trim() : (currentSchool.skPengelolaAset || 'SK/421.5/SMKN6-DMI/2026/014');

    const prevHistory = currentSchool.riwayatPengelolaAset || [];
    const topHistory = prevHistory[0];
    const hasChanged =
      !topHistory ||
      topHistory.nama !== updatedManager.name.trim() ||
      topHistory.semester !== newSemester ||
      topHistory.nip !== newNip ||
      topHistory.nomorSK !== newSK;

    const updatedHistory = hasChanged
      ? [
          {
            id: `rw-${Date.now()}`,
            nama: updatedManager.name.trim(),
            nip: newNip,
            jabatan: updatedManager.jabatan.trim(),
            semester: newSemester,
            nomorSK: newSK,
            tanggalPenetapan: new Date().toISOString().slice(0, 10),
            diubahOleh: `${currentUser.name} (Admin / Pengelola Aset)`,
          },
          ...prevHistory,
        ]
      : prevHistory;

    StorageService.saveSchoolProfile({
      ...currentSchool,
      pengelolaAset: updatedManager.name.trim(),
      nipPengelolaAset: newNip,
      jabatanPengelolaAset: updatedManager.jabatan.trim(),
      semesterAktif: newSemester,
      skPengelolaAset: newSK,
      riwayatPengelolaAset: updatedHistory,
    });

    if (currentUser.id === updatedUser.id || currentUser.role === 'admin_sarpras') {
      StorageService.saveCurrentUser(updatedUser);
    }

    return updatedUser;
  },

  registerUser: (newUser: User): { success: boolean; message: string; user?: User } => {
    const users = StorageService.getUsers();
    const cleanUsername = newUser.username.trim().toLowerCase();
    const cleanEmail = (newUser.email || '').trim().toLowerCase();

    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (existing) {
      return {
        success: false,
        message: 'Username, NIP/NISN, atau email sudah terdaftar. Silakan gunakan akun lain atau login langsung.',
      };
    }

    const created: User = {
      ...newUser,
      id: newUser.id || `usr-${Date.now()}`,
      username: newUser.username.trim(),
      password: newUser.password || 'admin123',
      registeredAt: new Date().toISOString(),
    };

    const updated = [...users, created];
    StorageService.saveUsers(updated);
    StorageService.saveCurrentUser(created);
    StorageService.setLoggedIn(true);

    return {
      success: true,
      message: 'Pendaftaran akun admin/pengguna berhasil! Anda otomatis masuk.',
      user: created,
    };
  },

  loginUser: (account: string, pass: string): { success: boolean; message: string; user?: User } => {
    const cleanAcc = account.trim().toLowerCase();
    const cleanPass = pass.trim();
    const users = StorageService.getUsers();

    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === cleanAcc ||
        (u.email && u.email.toLowerCase() === cleanAcc)
    );

    if (!matched) {
      return {
        success: false,
        message: 'Akun atau username tidak ditemukan. Pastikan NIP/NISN/Akun sudah benar atau lakukan pendaftaran akun baru.',
      };
    }

    const validPassword = matched.password || 'admin123';
    // Allow matching user's password, or admin123 / 123456 as master fallback
    if (cleanPass !== validPassword && cleanPass !== 'admin123' && cleanPass !== '123456') {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan coba lagi (demo: admin123).',
      };
    }

    StorageService.saveCurrentUser(matched);
    StorageService.setLoggedIn(true);
    return {
      success: true,
      message: `Selamat datang kembali, ${matched.name}!`,
      user: matched,
    };
  },

  isLoggedIn: (): boolean => {
    return getStoredData(STORAGE_KEYS.IS_LOGGED_IN, true);
  },
  setLoggedIn: (status: boolean) => {
    setStoredData(STORAGE_KEYS.IS_LOGGED_IN, status);
  },
  logout: () => {
    setStoredData(STORAGE_KEYS.CURRENT_USER, publicVisitorUser);
    setStoredData(STORAGE_KEYS.IS_LOGGED_IN, false);
  },
  switchToPublicVisitor: (): User => {
    setStoredData(STORAGE_KEYS.CURRENT_USER, publicVisitorUser);
    return publicVisitorUser;
  },
  getConfig: (): StorageConfig => getStoredData(STORAGE_KEYS.GAS_CONFIG, defaultStorageConfig),
  getGasWebhookUrl: (): string => getStoredData(STORAGE_KEYS.GAS_WEBHOOK_URL, ''),
  getAutoSync: (): boolean => getStoredData(STORAGE_KEYS.AUTO_SYNC_SHEETS, false),
  getLastSyncTime: (): string => getStoredData(STORAGE_KEYS.LAST_SYNC_TIME, ''),

  // Setters
  saveAssets: (data: AssetItem[]) => setStoredData(STORAGE_KEYS.ASSETS, data),
  saveDamageReports: (data: DamageReport[]) => setStoredData(STORAGE_KEYS.DAMAGE_REPORTS, data),
  saveMaintenance: (data: MaintenanceRecord[]) => setStoredData(STORAGE_KEYS.MAINTENANCE, data),
  saveMaintenanceRecords: (data: MaintenanceRecord[]) => setStoredData(STORAGE_KEYS.MAINTENANCE, data),
  savePurchaseRequests: (data: PurchaseRequest[]) => setStoredData(STORAGE_KEYS.PURCHASE_REQUESTS, data),
  saveLoans: (data: LoanItem[]) => setStoredData(STORAGE_KEYS.LOANS, data),
  saveRooms: (data: RoomItem[]) => setStoredData(STORAGE_KEYS.ROOMS, data),
  saveDocuments: (data: DocumentItem[]) => setStoredData(STORAGE_KEYS.DOCUMENTS, data),
  saveProcurements: (data: ProcurementItem[]) => setStoredData(STORAGE_KEYS.PROCUREMENTS, data),
  saveProcurementOrders: (data: ProcurementOrder[]) => setStoredData(STORAGE_KEYS.PROCUREMENT_ORDERS, data),
  saveVendors: (data: VendorItem[]) => setStoredData(STORAGE_KEYS.VENDORS, data),
  saveBudgets: (data: BudgetAllocation[]) => setStoredData(STORAGE_KEYS.BUDGETS, data),
  saveSchoolProfile: (data: SchoolProfile) => setStoredData(STORAGE_KEYS.SCHOOL_PROFILE, data),
  saveCurrentUser: (data: User) => setStoredData(STORAGE_KEYS.CURRENT_USER, data),
  saveConfig: (cfg: StorageConfig) => {
    setStoredData(STORAGE_KEYS.GAS_CONFIG, cfg);
    setStoredData(STORAGE_KEYS.GAS_WEBHOOK_URL, cfg.gasWebAppUrl);
  },
  saveGasWebhookUrl: (url: string) => setStoredData(STORAGE_KEYS.GAS_WEBHOOK_URL, url),
  saveAutoSync: (enabled: boolean) => setStoredData(STORAGE_KEYS.AUTO_SYNC_SHEETS, enabled),
  saveLastSyncTime: (iso: string) => setStoredData(STORAGE_KEYS.LAST_SYNC_TIME, iso),

  // Reset to factory mock data
  resetToDefaults: () => {
    localStorage.clear();
    StorageService.saveAssets(initialAssets);
    StorageService.saveDamageReports(initialDamageReports);
    StorageService.saveMaintenance(initialMaintenanceRecords);
    StorageService.savePurchaseRequests(initialPurchaseRequests);
    StorageService.saveLoans(initialLoans);
    StorageService.saveRooms(initialRooms);
    StorageService.saveDocuments(initialDocuments);
    StorageService.saveProcurementOrders(initialProcurementOrders);
    StorageService.saveVendors(initialVendors);
    StorageService.saveBudgets(initialBudgetAllocations);
    StorageService.saveSchoolProfile(initialSchoolProfile);
    StorageService.saveCurrentUser(publicVisitorUser);
    StorageService.saveConfig(defaultStorageConfig);
  },

  resetToDefault: () => {
    StorageService.resetToDefaults();
  },

  // 2-Way Sync Push
  syncPushToGAS: async (): Promise<boolean> => {
    const config = StorageService.getConfig();
    const url = config.gasWebAppUrl || StorageService.getGasWebhookUrl();
    if (!url) return false;

    const payload = {
      action: 'syncAll',
      data: {
        assets: StorageService.getAssets(),
        damageReports: StorageService.getDamageReports(),
        maintenanceRecords: StorageService.getMaintenance(),
        purchaseRequests: StorageService.getPurchaseRequests(),
        loans: StorageService.getLoans(),
        rooms: StorageService.getRooms(),
        documents: StorageService.getDocuments(),
        procurements: StorageService.getProcurementOrders(),
        budgets: StorageService.getBudgets(),
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const now = new Date().toISOString();
      const updatedCfg = { ...config, lastSyncTimestamp: now };
      StorageService.saveConfig(updatedCfg);
      StorageService.saveLastSyncTime(now);
      return true;
    }
    return false;
  },

  // 2-Way Sync Pull
  syncPullFromGAS: async (): Promise<any | null> => {
    const config = StorageService.getConfig();
    const url = config.gasWebAppUrl || StorageService.getGasWebhookUrl();
    if (!url) return null;

    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=getAllData`, {
      method: 'GET',
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
    return null;
  },
};
