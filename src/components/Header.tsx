import { User, ActiveTab } from '../types';
import { SchoolLogo } from './SchoolLogo';
import {
  Menu,
  Bell,
  LogOut,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingReportsCount: number;
  pendingRequestsCount: number;
  hasGasConfigured: boolean;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenLoginModal,
  onToggleSidebar,
  setActiveTab,
  pendingReportsCount,
  pendingRequestsCount,
  hasGasConfigured,
  onQuickSync,
  isSyncing,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const totalNotifications = pendingReportsCount + pendingRequestsCount;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'waka_sarpras':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-2 py-0.5 rounded-full font-medium">Waka Sarpras</span>;
      case 'admin_sarpras':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2 py-0.5 rounded-full font-medium">Admin Sarpras</span>;
      case 'guru':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-2 py-0.5 rounded-full font-medium">Guru / Kapro</span>;
      default:
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs px-2 py-0.5 rounded-full font-medium">Siswa / Staf</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A] text-white border-b border-slate-800 shadow-md">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Sembunyikan / Tampilkan Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Official Logo SMKN 6 Dumai */}
            <div className="p-1 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <SchoolLogo size="sm" className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">SIM-SARPRAS</span>
                <span className="hidden md:inline-block text-[11px] bg-blue-600/30 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-semibold tracking-wide">
                  SMKN 6 DUMAI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline-block">
                Sistem Informasi Manajemen Sarana & Prasarana
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sync Status, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Sheets Sync Pill */}
          <button
            id="btn-quick-sync"
            onClick={onQuickSync}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              hasGasConfigured
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title={hasGasConfigured ? 'Terhubung ke Google Sheets. Klik untuk sinkronisasi instan.' : 'Klik untuk hubungkan Google Sheets'}
          >
            <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : hasGasConfigured ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="font-medium">
              {isSyncing ? 'Menyinkronkan...' : hasGasConfigured ? 'Google Sheets Aktif' : 'Simpan ke Google Sheets'}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
              title="Pemberitahuan Sistem"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-popup"
                className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-semibold text-sm text-white">Notifikasi Aktivitas</h4>
                  <span className="text-xs text-slate-400">{totalNotifications} Baru</span>
                </div>

                <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
                  {pendingReportsCount > 0 && (
                    <div
                      onClick={() => {
                        setActiveTab('laporan-kerusakan');
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/40 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-rose-200">{pendingReportsCount} Laporan Kerusakan Menunggu</p>
                        <p className="text-[11px] text-rose-300/80">Perlu penanganan dan penugasan teknisi.</p>
                      </div>
                    </div>
                  )}

                  {pendingRequestsCount > 0 && (
                    <div
                      onClick={() => {
                        setActiveTab('pengajuan-barang');
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/50 hover:bg-amber-900/40 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-200">{pendingRequestsCount} Pengajuan Bahan/Alat</p>
                        <p className="text-[11px] text-amber-300/80">Menunggu persetujuan (approval) Waka Sarpras.</p>
                      </div>
                    </div>
                  )}

                  {totalNotifications === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Semua pengajuan & laporan telah diproses.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('laporan');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Buka Pusat Rekapitulasi Laporan &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px]">
                  {currentUser.jabatan}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in"
              >
                <div className="pb-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.jabatan}</p>
                  <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      onOpenLoginModal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Ganti Pengguna / Akun</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('pengaturan');
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Setup Google Apps Script & Sheets</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
