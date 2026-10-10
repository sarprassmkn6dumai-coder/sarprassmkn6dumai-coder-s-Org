import React from 'react';
import { ActiveTab, UserRole } from '../types';
import { StorageService } from '../services/storage';
import {
  LayoutDashboard,
  Package,
  QrCode,
  AlertOctagon,
  Wrench,
  FilePlus,
  ArrowRightLeft,
  Building2,
  FileText,
  ShoppingCart,
  Coins,
  Printer,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  LogOut,
  Briefcase,
  Lock,
  Edit3,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  userRole: UserRole;
  counts: {
    pendingDamage: number;
    pendingPurchases: number;
    activeLoans: number;
    totalAssets: number;
  };
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  userRole,
  counts,
  onLogout,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          roleAllowed: true,
        },
      ],
    },
    {
      title: 'SARPRAS & ASET',
      items: [
        {
          id: 'inventaris' as ActiveTab,
          label: 'Inventaris Barang',
          icon: Package,
          badge: counts.totalAssets > 0 ? `${counts.totalAssets}` : null,
          roleAllowed: true,
        },
        {
          id: 'qrcode' as ActiveTab,
          label: 'QR Code & Scanner',
          icon: QrCode,
          badge: 'Scan',
          badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
          roleAllowed: true,
        },
        {
          id: 'ruangan' as ActiveTab,
          label: 'Data Ruangan & Bengkel',
          icon: Building2,
          badge: null,
          roleAllowed: true,
        },
      ],
    },
    {
      title: 'LAYANAN & OPERASIONAL',
      items: [
        {
          id: 'laporan-kerusakan' as ActiveTab,
          label: 'Laporan Kerusakan',
          icon: AlertOctagon,
          badge: counts.pendingDamage > 0 ? `${counts.pendingDamage}` : null,
          badgeColor: 'bg-rose-900/80 text-rose-200 border-rose-700/80',
          roleAllowed: true,
        },
        {
          id: 'peminjaman' as ActiveTab,
          label: 'Peminjaman Alat',
          icon: ArrowRightLeft,
          badge: counts.activeLoans > 0 ? `${counts.activeLoans}` : null,
          badgeColor: 'bg-amber-900/70 text-amber-200 border-amber-700/70',
          roleAllowed: true,
        },
        {
          id: 'pengajuan-barang' as ActiveTab,
          label: 'Permintaan Barang Praktek',
          icon: FilePlus,
          badge: counts.pendingPurchases > 0 ? `${counts.pendingPurchases}` : null,
          badgeColor: 'bg-amber-900/70 text-amber-200 border-amber-700/70',
          roleAllowed: true,
        },
        {
          id: 'pemeliharaan' as ActiveTab,
          label: 'Jadwal Pemeliharaan',
          icon: Wrench,
          badge: null,
          roleAllowed: isFullAccess,
        },
      ],
    },
    {
      title: 'DOKUMEN & ANGGARAN',
      items: [
        {
          id: 'dokumen' as ActiveTab,
          label: 'Dokumen & BAST',
          icon: FileText,
          badge: null,
          roleAllowed: isFullAccess,
        },
        {
          id: 'pengadaan' as ActiveTab,
          label: 'Pengadaan (RAP)',
          icon: ShoppingCart,
          badge: null,
          roleAllowed: isFullAccess,
        },
        {
          id: 'anggaran' as ActiveTab,
          label: 'Dashboard Anggaran',
          icon: Coins,
          badge: null,
          roleAllowed: isFullAccess,
        },
      ],
    },
    {
      title: 'OUTPUT & SISTEM',
      items: [
        {
          id: 'laporan' as ActiveTab,
          label: 'Cetak Laporan Resmi',
          icon: Printer,
          badge: null,
          roleAllowed: isFullAccess,
        },
        {
          id: 'pengaturan' as ActiveTab,
          label: 'Integrasi GAS & Setelan',
          icon: Settings,
          badge: 'GAS',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
          roleAllowed: true,
        },
      ],
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isOpenMobile) {
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 h-full z-40 bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-68'}`}
      >
        {/* Sidebar Header in Drawer / Desktop */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
                SMK
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white leading-tight">SMKN 6 DUMAI</span>
                <span className="text-[11px] text-blue-400 font-medium">Sarana & Prasarana</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                6D
              </div>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
            aria-label="Collapse Sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menus with Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => item.roleAllowed);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed ? (
                  <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {section.title}
                  </h5>
                ) : (
                  <div className="h-px bg-slate-800 mx-2 my-2" />
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-105' : 'text-slate-400 group-hover:text-slate-200'}`} />

                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                            item.badgeColor || (isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-800 text-slate-300 border-slate-700')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        {!isCollapsed ? (
          <div className="p-3.5 m-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">
                {userRole === 'admin_sarpras'
                  ? 'Mode Admin / Pengelola Aset'
                  : userRole === 'publik'
                  ? 'Mode Pengunjung Publik'
                  : isFullAccess
                  ? 'Mode Waka Sarpras'
                  : 'Mode Terbatas'}
              </span>
            </div>

            {/* School Asset Manager Info Badge (Dapat Diedit Tiap Semester Khusus Admin / Pengelola Aset) */}
            {(() => {
              const sp = StorageService.getSchoolProfile();
              const isAdminAssetManager = userRole === 'admin_sarpras';
              return (
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span>Pengelola Aset:</span>
                    </div>
                    {isAdminAssetManager ? (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('pengaturan')}
                        className="text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-0.5 font-semibold cursor-pointer"
                        title="Edit Pengelola Aset / Ganti Semester"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <span
                        className="text-[10px] text-amber-300/90 flex items-center gap-0.5 font-medium"
                        title="Terkunci: Tidak dapat diedit oleh pengunjung/publik"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Terkunci</span>
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-200 truncate">
                    {sp.pengelolaAset || 'Rahmat Hidayat, A.Md.'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    NIP. {sp.nipPengelolaAset || '19880421 201101 1 003'}
                  </div>
                  <div className="text-[10px] text-blue-300 font-medium truncate">
                    {sp.semesterAktif || 'Semester Ganjil TA 2026/2027'}
                  </div>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {userRole === 'admin_sarpras'
                ? 'Hak akses penuh: Tambah, edit & hapus katalog aset, anggaran & integrasi Sheets.'
                : 'Katalog inventaris diproteksi (Read-Only). Hanya Admin / Pengelola Aset yang dapat mengedit atau menghapus.'}
            </p>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Halaman Login)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 text-center text-slate-500 text-[10px]">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar (Halaman Login)"
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors mx-auto block mb-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            v1.0
          </div>
        )}
      </aside>
    </>
  );
};
