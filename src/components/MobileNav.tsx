import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Package,
  QrCode,
  AlertOctagon,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  pendingDamage: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  pendingDamage,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F172A] border-t border-slate-800 text-slate-400 py-1.5 px-3 flex items-center justify-around shadow-2xl backdrop-blur-md"
    >
      <button
        id="mobile-tab-dashboard"
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </button>

      <button
        id="mobile-tab-inventaris"
        onClick={() => setActiveTab('inventaris')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
          activeTab === 'inventaris' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Package className="w-5 h-5" />
        <span>Inventaris</span>
      </button>

      {/* Center QR Scan Action Button */}
      <button
        id="mobile-tab-qrcode"
        onClick={() => setActiveTab('qrcode')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium -mt-4 transition-transform active:scale-95`}
      >
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-2 ${
          activeTab === 'qrcode'
            ? 'bg-blue-600 border-white text-white'
            : 'bg-blue-700 border-slate-900 text-white hover:bg-blue-600'
        }`}>
          <QrCode className="w-5 h-5" />
        </div>
        <span className={activeTab === 'qrcode' ? 'text-blue-400 font-semibold' : 'text-slate-400'}>
          Scan QR
        </span>
      </button>

      <button
        id="mobile-tab-laporan"
        onClick={() => setActiveTab('laporan-kerusakan')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-medium relative transition-colors ${
          activeTab === 'laporan-kerusakan' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <AlertOctagon className="w-5 h-5" />
          {pendingDamage > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingDamage}
            </span>
          )}
        </div>
        <span>Lapor Rusak</span>
      </button>

      <button
        id="mobile-tab-menu"
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
