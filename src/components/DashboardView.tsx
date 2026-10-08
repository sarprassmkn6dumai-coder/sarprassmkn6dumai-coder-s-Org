import React, { useState } from 'react';
import {
  AssetItem,
  DamageReport,
  LoanItem,
  RoomItem,
  ActiveTab,
  UserRole,
} from '../types';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  QrCode,
  ArrowRightLeft,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  assets: AssetItem[];
  damageReports: DamageReport[];
  loans: LoanItem[];
  rooms: RoomItem[];
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  damageReports,
  loans,
  rooms,
  setActiveTab,
}) => {
  const [selectedChartFilter, setSelectedChartFilter] = useState<'jurusan' | 'kategori'>('jurusan');

  // Stats calculation
  const totalAssetsCount = (assets || []).reduce((sum, item) => sum + (item?.jumlah || 1), 0);
  const totalAssetItems = (assets || []).length;
  const goodConditionCount = (assets || [])
    .filter((a) => a?.kondisi === 'Baik')
    .reduce((sum, item) => sum + (item?.jumlah || 1), 0);
  const brokenLightCount = (assets || [])
    .filter((a) => a?.kondisi === 'Rusak Ringan')
    .reduce((sum, item) => sum + (item?.jumlah || 1), 0);
  const brokenHeavyCount = (assets || [])
    .filter((a) => a?.kondisi === 'Rusak Berat')
    .reduce((sum, item) => sum + (item?.jumlah || 1), 0);
  const totalBroken = brokenLightCount + brokenHeavyCount;

  const pendingReports = (damageReports || []).filter((r) => r?.status === 'Menunggu').length;
  const activeLoansCount = (loans || []).filter(
    (l) => l?.status === 'Aktif' || l?.status === 'Dipinjam'
  ).length;
  const totalRoomsCount = (rooms || []).length;

  // Breakdown by Jurusan
  const jurusanList = ['Teknik Ketenagalistrikan', 'Teknik Kimia', 'Umum', 'Kantor'];
  const assetByJurusan = jurusanList.map((jur) => {
    const items = (assets || []).filter((a) =>
      (a?.jurusan || '').toUpperCase().includes((jur || '').toUpperCase())
    );
    const count = items.reduce((s, i) => s + (i?.jumlah || 1), 0);
    return { name: jur, count };
  });

  // Monthly breakdown of damage reports
  const monthlyReports = [
    { month: 'Mei', count: 2 },
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 3 },
    { month: 'Ags', count: 4 },
    { month: 'Sep', count: damageReports.length },
  ];

  const maxMonthVal = Math.max(...monthlyReports.map((m) => m.count), 6);
  const maxJurusanVal = Math.max(...assetByJurusan.map((j) => j.count), 40);

  return (
    <div className="space-y-6 pb-8">
      {/* Banner Sambutan */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] p-6 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                Sistem Informasi Terpadu
              </span>
              <span className="text-xs text-slate-300">Tahun Ajaran 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              SIM-SARPRAS SMKN 6 Dumai
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Pusat kendali sarana prasarana: inventarisasi digital, pencetakan stiker QR Code, pemantauan kerusakan, perawatan berkala bengkel kejuruan, dan integrasi Google Sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('qrcode')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Pindai QR Aset</span>
            </button>
            <button
              onClick={() => setActiveTab('laporan-kerusakan')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Kerusakan</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 Kartu Statistik Utama */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Aset */}
        <div
          onClick={() => setActiveTab('inventaris')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Aset</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{totalAssetsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalAssetItems} Jenis Barang Terdata</p>
        </div>

        {/* Kondisi Baik */}
        <div
          onClick={() => setActiveTab('inventaris')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Kondisi Baik</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">{goodConditionCount}</span>
            <span className="text-xs text-slate-400 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalAssetsCount > 0 ? Math.round((goodConditionCount / totalAssetsCount) * 100) : 0}% Kondisi Prima
          </p>
        </div>

        {/* Rusak Ringan/Berat */}
        <div
          onClick={() => setActiveTab('inventaris')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Perlu Perbaikan</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-700">{totalBroken}</span>
            <span className="text-xs text-slate-400 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1">
            {brokenLightCount} Ringan &bull; {brokenHeavyCount} Berat
          </p>
        </div>

        {/* Pengajuan Menunggu */}
        <div
          onClick={() => setActiveTab('laporan-kerusakan')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Laporan Menunggu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-700">{pendingReports}</span>
            <span className="text-xs text-slate-400 font-medium">Tiket</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1">{activeLoansCount} Peminjaman Aktif</p>
        </div>

        {/* Total Ruangan */}
        <div
          onClick={() => setActiveTab('ruangan')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Ruang/Lab</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{totalRoomsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Ruang</span>
          </div>
          <p className="text-[11px] text-indigo-600 mt-1">Lab, Bengkel, Kelas & TU</p>
        </div>
      </div>

      {/* 2 Grafik Interaktif: Distribusi Aset & Trend Kerusakan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grafik 1: Distribusi Aset per Jurusan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Aset Berdasarkan Jurusan</h3>
              <p className="text-xs text-slate-400">Total unit barang yang dialokasikan di tiap kompetensi keahlian</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
              SMKN 6 Dumai
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {assetByJurusan.map((item) => {
              const percentage = Math.round((item.count / maxJurusanVal) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Jurusan / Bidang {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{item.count} Unit</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-700 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fasilitas Bengkel Ketenagalistrikan & Lab Kimia merupakan penerima aset terbesar</span>
            <button
              onClick={() => setActiveTab('inventaris')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Katalog Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grafik 2: Trend Laporan Kerusakan Bulanan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trend Laporan Kerusakan Fasilitas</h3>
                <p className="text-xs text-slate-400">Frekuensi keluhan sarpras 5 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Monitoring Aktif</span>
              </div>
            </div>

            {/* Custom Bar Chart Visualizer */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {monthlyReports.map((item, index) => {
                const heightPercent = Math.max((item.count / maxMonthVal) * 100, 15);
                const isCurrent = index === monthlyReports.length - 1;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-bold text-slate-700 opacity-90 group-hover:text-blue-600">
                      {item.count}
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-32 flex items-end p-1">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isCurrent
                            ? 'bg-rose-500 group-hover:bg-rose-600'
                            : 'bg-blue-600 group-hover:bg-blue-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{pendingReports} laporan memerlukan tindak lanjut perbaikan</span>
            <button
              onClick={() => setActiveTab('laporan-kerusakan')}
              className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Pantau Tiket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Laporan Terkini & Peminjaman Aktif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Laporan Kerusakan Terbaru */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Laporan Kerusakan Terbaru</h3>
            <button
              onClick={() => setActiveTab('laporan-kerusakan')}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Lihat Semua ({damageReports.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {damageReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/70 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{report.assetNama}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        report.urgensi === 'Darurat'
                          ? 'bg-rose-100 text-rose-700'
                          : report.urgensi === 'Tinggi'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {report.urgensi}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{report.deskripsi}</p>
                  <p className="text-[11px] text-slate-400">
                    Pelapor: {report.pelaporNama} &bull; {report.lokasiRuangan}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0 ${
                    report.status === 'Menunggu'
                      ? 'bg-amber-100 text-amber-800'
                      : report.status === 'Diproses'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peminjaman Alat Aktif */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Peminjaman Aset Aktif</h3>
            <button
              onClick={() => setActiveTab('peminjaman')}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Lihat Semua ({loans.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {loans.slice(0, 3).map((loan) => (
              <div
                key={loan.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/70 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {loan.assetNama || loan.itemNama || 'Barang'}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {loan.jumlah || 1} {loan.satuan || 'Unit'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Peminjam: <strong className="text-slate-800">{loan.peminjamNama}</strong> ({loan.peminjamRole})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Batas Kembali: <span className="font-semibold text-slate-700">{loan.rencanaKembali}</span>
                  </p>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0 ${
                    loan.status === 'Aktif' || loan.status === 'Dipinjam'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {loan.status === 'Aktif' || loan.status === 'Dipinjam' ? 'Sedang Dipinjam' : 'Dikembalikan'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
