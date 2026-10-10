import React, { useState } from 'react';
import {
  ActiveTab,
  User,
  AssetItem,
  DamageReport,
  MaintenanceRecord,
  PurchaseRequest,
  LoanItem,
  RoomItem,
  SarprasDocument,
  VendorItem,
  ProcurementOrder,
  BudgetAllocation,
  StorageConfig,
} from './types';
import { StorageService } from './services/storage';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { InventarisView } from './components/InventarisView';
import { QRCodeView } from './components/QRCodeView';
import { LaporanKerusakanView } from './components/LaporanKerusakanView';
import { PemeliharaanView } from './components/PemeliharaanView';
import { PengajuanBarangView } from './components/PengajuanBarangView';
import { PeminjamanView } from './components/PeminjamanView';
import { RuanganView } from './components/RuanganView';
import { DokumenView } from './components/DokumenView';
import { PengadaanView } from './components/PengadaanView';
import { AnggaranView } from './components/AnggaranView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  // Default to true so all public visitors immediately land directly on the dashboard
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Core Data States
  const [assets, setAssets] = useState<AssetItem[]>(() => StorageService.getAssets());
  const [rooms, setRooms] = useState<RoomItem[]>(() => StorageService.getRooms());
  const [damageReports, setDamageReports] = useState<DamageReport[]>(() => StorageService.getDamageReports());
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => StorageService.getMaintenanceRecords());
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => StorageService.getPurchaseRequests());
  const [loans, setLoans] = useState<LoanItem[]>(() => StorageService.getLoans());
  const [documents, setDocuments] = useState<SarprasDocument[]>(() => StorageService.getDocuments());
  const [vendors, setVendors] = useState<VendorItem[]>(() => StorageService.getVendors());
  const [procurementOrders, setProcurementOrders] = useState<ProcurementOrder[]>(() => StorageService.getProcurementOrders());
  const [budgets, setBudgets] = useState<BudgetAllocation[]>(() => StorageService.getBudgets());
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(() => StorageService.getConfig());

  // Cross-Module Transitions
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<AssetItem | null>(null);
  const [preloadedAssetForDamage, setPreloadedAssetForDamage] = useState<AssetItem | null>(null);
  const [preloadedAssetForLoan, setPreloadedAssetForLoan] = useState<AssetItem | null>(null);

  // Syncing State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    StorageService.saveCurrentUser(user);
    StorageService.setLoggedIn(true);
  };

  const handleLogout = () => {
    const guest = StorageService.switchToPublicVisitor();
    setCurrentUser(guest);
    setIsLoggedIn(false);
    StorageService.logout();
  };

  // Save current user on change
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    StorageService.saveCurrentUser(user);
  };

  // Sync Push
  const handleSyncPush = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const success = await StorageService.syncPushToGAS();
      if (success) {
        setStorageConfig(StorageService.getConfig());
      } else {
        setSyncError('Sinkronisasi ke Google Apps Script tidak berhasil. Pastikan URL Web App valid dan berizin Anyone.');
      }
    } catch (e: any) {
      setSyncError(e?.message || 'Gagal terhubung ke Google Apps Script.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Pull
  const handleSyncPull = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await StorageService.syncPullFromGAS();
      if (data) {
        if (data.assets) setAssets(data.assets);
        if (data.rooms) setRooms(data.rooms);
        if (data.damageReports) setDamageReports(data.damageReports);
        if (data.maintenanceRecords) setMaintenanceRecords(data.maintenanceRecords);
        if (data.purchaseRequests) setPurchaseRequests(data.purchaseRequests);
        if (data.loans) setLoans(data.loans);
        if (data.budgets) setBudgets(data.budgets);
        setStorageConfig(StorageService.getConfig());
      } else {
        setSyncError('Tidak ada data yang dapat ditarik dari Google Sheets.');
      }
    } catch (e: any) {
      setSyncError(e?.message || 'Gagal menarik data dari Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset to default mock data
  const handleResetDefault = () => {
    StorageService.resetToDefaults();
    setAssets(StorageService.getAssets());
    setRooms(StorageService.getRooms());
    setDamageReports(StorageService.getDamageReports());
    setMaintenanceRecords(StorageService.getMaintenanceRecords());
    setPurchaseRequests(StorageService.getPurchaseRequests());
    setLoans(StorageService.getLoans());
    setDocuments(StorageService.getDocuments());
    setVendors(StorageService.getVendors());
    setProcurementOrders(StorageService.getProcurementOrders());
    setBudgets(StorageService.getBudgets());
    setStorageConfig(StorageService.getConfig());
  };

  // CRUD: Assets (Hanya diizinkan untuk Admin / Pengelola Aset Sekolah)
  const handleAddAsset = (newAsset: Omit<AssetItem, 'id'>) => {
    if (currentUser.role !== 'admin_sarpras') return;
    const created: AssetItem = {
      ...newAsset,
      id: `asset-${Date.now()}`,
    };
    const updated = [created, ...assets];
    setAssets(updated);
    StorageService.saveAssets(updated);
  };

  const handleUpdateAsset = (updatedAsset: AssetItem) => {
    if (currentUser.role !== 'admin_sarpras') return;
    const updated = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    setAssets(updated);
    StorageService.saveAssets(updated);
  };

  const handleDeleteAsset = (id: string) => {
    if (currentUser.role !== 'admin_sarpras') return;
    const updated = assets.filter((a) => a.id !== id);
    setAssets(updated);
    StorageService.saveAssets(updated);
  };

  // CRUD: Damage Reports
  const handleAddDamageReport = (newRep: Omit<DamageReport, 'id' | 'tiket'>) => {
    const nextNo = damageReports.length + 1;
    const created: DamageReport = {
      ...newRep,
      id: `dmg-${Date.now()}`,
      tiket: `TKT-SMK6-${String(nextNo).padStart(3, '0')}`,
    };
    const updated = [created, ...damageReports];
    setDamageReports(updated);
    StorageService.saveDamageReports(updated);
  };

  const handleUpdateDamageStatus = (
    reportId: string,
    status: any,
    tindakLanjut: string,
    teknisiNama: string
  ) => {
    const updated = damageReports.map((r) =>
      r.id === reportId ? { ...r, status, tindakLanjut, teknisiNama } : r
    );
    setDamageReports(updated);
    StorageService.saveDamageReports(updated);
  };

  // CRUD: Maintenance
  const handleAddMaintenance = (newRec: Omit<MaintenanceRecord, 'id'>) => {
    const created: MaintenanceRecord = {
      ...newRec,
      id: `mnt-${Date.now()}`,
    };
    const updated = [created, ...maintenanceRecords];
    setMaintenanceRecords(updated);
    StorageService.saveMaintenanceRecords(updated);
  };

  const handleUpdateMaintenanceStatus = (
    id: string,
    status: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai'
  ) => {
    const updated = maintenanceRecords.map((m) => (m.id === id ? { ...m, status } : m));
    setMaintenanceRecords(updated);
    StorageService.saveMaintenanceRecords(updated);
  };

  // CRUD: Purchase Requests
  const handleAddPurchaseRequest = (newReq: Omit<PurchaseRequest, 'id' | 'nomorSurat'>) => {
    const nextNo = purchaseRequests.length + 1;
    const created: PurchaseRequest = {
      ...newReq,
      id: `req-${Date.now()}`,
      nomorSurat: `REQ-SMK6-2026-${String(nextNo).padStart(3, '0')}`,
    };
    const updated = [created, ...purchaseRequests];
    setPurchaseRequests(updated);
    StorageService.savePurchaseRequests(updated);
  };

  const handleApprovePurchaseRequest = (
    id: string,
    status: 'Disetujui' | 'Ditolak' | 'Revisi',
    catatanWaka: string
  ) => {
    const updated = purchaseRequests.map((r) => (r.id === id ? { ...r, status, catatanWaka } : r));
    setPurchaseRequests(updated);
    StorageService.savePurchaseRequests(updated);
  };

  const handleUpdatePurchaseRequest = (updatedReq: PurchaseRequest) => {
    const updated = purchaseRequests.map((r) => (r.id === updatedReq.id ? updatedReq : r));
    setPurchaseRequests(updated);
    StorageService.savePurchaseRequests(updated);
  };

  // CRUD: Loans
  const handleAddLoan = (newLoan: Omit<LoanItem, 'id' | 'kodePinjam'>) => {
    const nextNo = loans.length + 1;
    const created: LoanItem = {
      ...newLoan,
      id: `loan-${Date.now()}`,
      kodePinjam: `PJM-SMK6-${String(nextNo).padStart(3, '0')}`,
    };
    const updated = [created, ...loans];
    setLoans(updated);
    StorageService.saveLoans(updated);

    // If item was an asset, update status to Dipinjam
    if (newLoan.tipe === 'Barang' && newLoan.itemId) {
      const updatedAssets = assets.map((a) =>
        a.id === newLoan.itemId ? { ...a, status: 'Dipinjam' as const } : a
      );
      setAssets(updatedAssets);
      StorageService.saveAssets(updatedAssets);
    }
  };

  const handleUpdateLoan = (updatedLoan: LoanItem) => {
    const updated = loans.map((l) => (l.id === updatedLoan.id ? updatedLoan : l));
    setLoans(updated);
    StorageService.saveLoans(updated);
  };

  const handleReturnLoan = (
    loanId: string,
    kondisiKembali: 'Baik' | 'Ada Kerusakan',
    catatanKembali: string
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    const updatedLoans = loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            status: 'Dikembalikan' as const,
            realisasiKembali: new Date().toISOString().slice(0, 10),
            kondisiKembali,
            catatanKembali,
          }
        : l
    );
    setLoans(updatedLoans);
    StorageService.saveLoans(updatedLoans);

    // If item was an asset, return to Tersedia (or Dalam Perbaikan if damaged)
    if (targetLoan && targetLoan.itemId) {
      const newStatus = kondisiKembali === 'Baik' ? 'Tersedia' : 'Dalam Perbaikan';
      const updatedAssets = assets.map((a) =>
        a.id === targetLoan.itemId ? { ...a, status: newStatus as any } : a
      );
      setAssets(updatedAssets);
      StorageService.saveAssets(updatedAssets);
    }
  };

  // CRUD: Rooms
  const handleAddRoom = (newRoom: Omit<RoomItem, 'id'>) => {
    const created: RoomItem = {
      ...newRoom,
      id: `room-${Date.now()}`,
    };
    const updated = [...rooms, created];
    setRooms(updated);
    StorageService.saveRooms(updated);
  };

  const handleUpdateRoom = (updatedRoom: RoomItem) => {
    const updated = rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r));
    setRooms(updated);
    StorageService.saveRooms(updated);
  };

  // CRUD: Documents
  const handleAddDocument = (newDoc: Omit<SarprasDocument, 'id'>) => {
    const created: SarprasDocument = {
      ...newDoc,
      id: `doc-${Date.now()}`,
    };
    const updated = [created, ...documents];
    setDocuments(updated);
    StorageService.saveDocuments(updated);
  };

  // CRUD: Vendors & Orders
  const handleAddVendor = (newVendor: Omit<VendorItem, 'id'>) => {
    const created: VendorItem = {
      ...newVendor,
      id: `vendor-${Date.now()}`,
    };
    const updated = [...vendors, created];
    setVendors(updated);
    StorageService.saveVendors(updated);
  };

  const handleAddProcurementOrder = (newOrder: Omit<ProcurementOrder, 'id' | 'nomorSPK'>) => {
    const nextNo = procurementOrders.length + 1;
    const created: ProcurementOrder = {
      ...newOrder,
      id: `spk-${Date.now()}`,
      nomorSPK: `SPK/SMK6/SARPRAS/2026/${String(nextNo).padStart(3, '0')}`,
    };
    const updated = [created, ...procurementOrders];
    setProcurementOrders(updated);
    StorageService.saveProcurementOrders(updated);
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: 'Perencanaan' | 'SPK Terbit' | 'Pengiriman' | 'Selesai BAST'
  ) => {
    const updated = procurementOrders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setProcurementOrders(updated);
    StorageService.saveProcurementOrders(updated);
  };

  // CRUD: Budget Transaction
  const handleAddBudgetTransaction = (
    budgetId: string,
    transaction: {
      tanggal: string;
      uraian: string;
      nominal: number;
      kategori: 'Belanja Modal' | 'Belanja Barang & Jasa' | 'Pemeliharaan';
    }
  ) => {
    const updated = budgets.map((b) => {
      if (b.id === budgetId) {
        const newRealisasi = b.realisasi + transaction.nominal;
        const newSisa = Math.max(0, b.pagu - newRealisasi);
        const newRecord = {
          id: `trx-${Date.now()}`,
          ...transaction,
        };
        return {
          ...b,
          realisasi: newRealisasi,
          sisa: newSisa,
          rincianPengeluaran: [newRecord, ...b.rincianPengeluaran],
        };
      }
      return b;
    });
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  // Cross module jump to QR
  const handleSelectAssetForQR = (asset: AssetItem) => {
    setSelectedAssetForQR(asset);
    setActiveTab('qrcode');
  };

  const pendingDamageCount = damageReports.filter((r) => r.status === 'Menunggu').length;
  const pendingRequestsCount = purchaseRequests.filter((r) => r.status === 'Menunggu').length;
  const activeLoansCount = loans.filter((l) => l.status === 'Aktif' || l.status === 'Dipinjam').length;

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => {
          const guest = StorageService.switchToPublicVisitor();
          setCurrentUser(guest);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Collapsible Desktop & Mobile Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        userRole={currentUser.role}
        counts={{
          pendingDamage: pendingDamageCount,
          pendingPurchases: pendingRequestsCount,
          activeLoans: activeLoansCount,
          totalAssets: assets.length,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingReportsCount={pendingDamageCount}
          pendingRequestsCount={pendingRequestsCount}
          hasGasConfigured={Boolean(storageConfig.gasWebAppUrl)}
          onQuickSync={handleSyncPush}
          isSyncing={isSyncing}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              assets={assets}
              damageReports={damageReports}
              loans={loans}
              rooms={rooms}
              setActiveTab={setActiveTab}
              userRole={currentUser.role}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onSelectUser={handleSelectUser}
            />
          )}

          {activeTab === 'inventaris' && (
            <InventarisView
              assets={assets}
              rooms={rooms}
              userRole={currentUser.role}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
              onSelectAssetForQR={handleSelectAssetForQR}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}

          {(activeTab === 'qrcode' || activeTab === 'qr-code') && (
            <QRCodeView
              assets={assets}
              selectedAssetForQR={selectedAssetForQR}
              onSelectAsset={setSelectedAssetForQR}
              setActiveTab={setActiveTab}
              onPreloadDamageReport={(a) => {
                setPreloadedAssetForDamage(a);
                setActiveTab('laporan-kerusakan');
              }}
              onPreloadLoan={(a) => {
                setPreloadedAssetForLoan(a);
                setActiveTab('peminjaman');
              }}
            />
          )}

          {activeTab === 'laporan-kerusakan' && (
            <LaporanKerusakanView
              reports={damageReports}
              assets={assets}
              currentUser={currentUser}
              userRole={currentUser.role}
              preloadedAsset={preloadedAssetForDamage}
              onClearPreloadedAsset={() => setPreloadedAssetForDamage(null)}
              onAddReport={handleAddDamageReport}
              onUpdateReportStatus={handleUpdateDamageStatus}
            />
          )}

          {activeTab === 'pemeliharaan' && (
            <PemeliharaanView
              records={maintenanceRecords}
              assets={assets}
              rooms={rooms}
              userRole={currentUser.role}
              onAddRecord={handleAddMaintenance}
              onUpdateRecordStatus={handleUpdateMaintenanceStatus}
            />
          )}

          {activeTab === 'pengajuan-barang' && (
            <PengajuanBarangView
              requests={purchaseRequests}
              currentUser={currentUser}
              userRole={currentUser.role}
              onAddRequest={handleAddPurchaseRequest}
              onApproveRequest={handleApprovePurchaseRequest}
              onUpdateRequest={handleUpdatePurchaseRequest}
            />
          )}

          {activeTab === 'peminjaman' && (
            <PeminjamanView
              loans={loans}
              assets={assets}
              rooms={rooms}
              currentUser={currentUser}
              userRole={currentUser.role}
              preloadedAsset={preloadedAssetForLoan}
              onClearPreloadedAsset={() => setPreloadedAssetForLoan(null)}
              onAddLoan={handleAddLoan}
              onReturnLoan={handleReturnLoan}
              onUpdateLoan={handleUpdateLoan}
            />
          )}

          {activeTab === 'ruangan' && (
            <RuanganView
              rooms={rooms}
              assets={assets}
              userRole={currentUser.role}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onSelectAssetForQR={handleSelectAssetForQR}
            />
          )}

          {activeTab === 'dokumen' && (
            <DokumenView
              documents={documents}
              userRole={currentUser.role}
              onAddDocument={handleAddDocument}
            />
          )}

          {activeTab === 'pengadaan' && (
            <PengadaanView
              vendors={vendors}
              orders={procurementOrders}
              userRole={currentUser.role}
              onAddVendor={handleAddVendor}
              onAddOrder={handleAddProcurementOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'anggaran' && (
            <AnggaranView
              budgets={budgets}
              userRole={currentUser.role}
              onAddTransaction={handleAddBudgetTransaction}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              assets={assets}
              damageReports={damageReports}
              maintenanceRecords={maintenanceRecords}
              loans={loans}
              budgets={budgets}
              rooms={rooms}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              storageConfig={storageConfig}
              currentUser={currentUser}
              onSaveConfig={(cfg) => {
                setStorageConfig(cfg);
                StorageService.saveConfig(cfg);
              }}
              onSyncPush={handleSyncPush}
              onSyncPull={handleSyncPull}
              onResetDefaultData={handleResetDefault}
              isSyncing={isSyncing}
              syncError={syncError}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onSelectUser={handleSelectUser}
            />
          )}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsOpenMobile(true)}
        pendingDamage={pendingDamageCount}
      />

      {/* Role Switcher & Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onOpenFullLoginPage={handleLogout}
      />
    </div>
  );
}
