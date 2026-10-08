import React, { useState } from 'react';
import { BudgetAllocation, UserRole } from '../types';
import {
  DollarSign,
  Plus,
  Coins,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface AnggaranViewProps {
  budgets: BudgetAllocation[];
  userRole: UserRole;
  onAddTransaction: (
    budgetId: string,
    transaction: {
      tanggal: string;
      uraian: string;
      nominal: number;
      kategori: 'Belanja Modal' | 'Belanja Barang & Jasa' | 'Pemeliharaan';
    }
  ) => void;
}

export const AnggaranView: React.FC<AnggaranViewProps> = ({
  budgets,
  userRole,
  onAddTransaction,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(budgets[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [transForm, setTransForm] = useState({
    budgetId: budgets[0]?.id || '',
    tanggal: new Date().toISOString().slice(0, 10),
    uraian: '',
    nominal: 1500000,
    kategori: 'Pemeliharaan' as 'Belanja Modal' | 'Belanja Barang & Jasa' | 'Pemeliharaan',
  });

  const totalPagu = budgets.reduce((sum, b) => sum + b.pagu, 0);
  const totalRealisasi = budgets.reduce((sum, b) => sum + b.realisasi, 0);
  const totalSisa = budgets.reduce((sum, b) => sum + b.sisa, 0);
  const percentageTotal = totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0;

  const currentSelectedBudget = budgets.find((b) => b.id === selectedBudgetId) || budgets[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(transForm.budgetId, {
      tanggal: transForm.tanggal,
      uraian: transForm.uraian,
      nominal: transForm.nominal,
      kategori: transForm.kategori,
    });
    setIsModalOpen(false);
    setTransForm({
      budgetId: currentSelectedBudget.id,
      tanggal: new Date().toISOString().slice(0, 10),
      uraian: '',
      nominal: 1500000,
      kategori: 'Pemeliharaan',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Alokasi & Penyerapan Anggaran Sarpras
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Tahun Anggaran 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring realisasi penyerapan dana BOS Kinerja, BOS Reguler, DAK Fisik Kejuruan, dan BPOPP SMKN 6 Dumai.
          </p>
        </div>

        {isFullAccess && (
          <button
            onClick={() => {
              setTransForm((prev) => ({ ...prev, budgetId: currentSelectedBudget?.id || '' }));
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Realisasi Belanja</span>
          </button>
        )}
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Pagu Alokasi</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            Rp {totalPagu.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400">Total pagu anggaran 4 sumber dana</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Realisasi Belanja</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            Rp {totalRealisasi.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">{percentageTotal}% telah terserap</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sisa Anggaran Belum Digunakan</span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            Rp {totalSisa.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {100 - percentageTotal}% saldo siap dibelanjakan
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Persentase Penyerapan</span>
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-800">Progres Serapan</span>
              <span className="text-blue-700">{percentageTotal}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentageTotal}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Status evaluasi serapan: Optimal</span>
        </div>
      </div>

      {/* Sources Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgets.map((b) => {
          const isSelected = selectedBudgetId === b.id;
          const percent = Math.round((b.realisasi / b.pagu) * 100);

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBudgetId(b.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 text-sm">{b.sumberDana}</span>
                <span className="text-xs font-bold text-blue-700">{percent}%</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Pagu:</span>
                  <span className="font-semibold text-slate-800">Rp {b.pagu.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Realisasi:</span>
                  <span className="font-semibold text-blue-700">Rp {b.realisasi.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Sisa:</span>
                  <span className="font-semibold text-emerald-700">Rp {b.sisa.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3 text-[10px] text-slate-400 text-right">
                {b.rincianPengeluaran.length} Transaksi &bull; Klik untuk lihat
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Budget Transactions Table */}
      {currentSelectedBudget && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rincian Transaksi Belanja: {currentSelectedBudget.sumberDana}
              </h3>
              <p className="text-xs text-slate-500">
                Log pembukuan belanja modal peralatan, suku cadang mesin, dan bahan praktikum siswa.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Total Terserap dari Pos Ini:</span>
              <div className="text-sm font-mono font-bold text-blue-700">
                Rp {currentSelectedBudget.realisasi.toLocaleString('id-ID')} / Rp{' '}
                {currentSelectedBudget.pagu.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Uraian Transaksi / Belanja</th>
                  <th className="py-2.5 px-3">Kategori Belanja</th>
                  <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {currentSelectedBudget.rincianPengeluaran.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Belum ada catatan transaksi pengeluaran pada pos anggaran ini.
                    </td>
                  </tr>
                ) : (
                  currentSelectedBudget.rincianPengeluaran.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{trx.tanggal}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{trx.uraian}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            trx.kategori === 'Belanja Modal'
                              ? 'bg-blue-100 text-blue-800'
                              : trx.kategori === 'Pemeliharaan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {trx.kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rp {trx.nominal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORM CATAT REALISASI BELANJA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Catat Realisasi Belanja Anggaran</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pos Sumber Dana Anggaran
                </label>
                <select
                  value={transForm.budgetId}
                  onChange={(e) => setTransForm({ ...transForm, budgetId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.sumberDana} (Sisa: Rp {b.sisa.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Belanja / Transaksi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian 15 Unit Tang Crimping RJ45 & Toolset"
                  value={transForm.uraian}
                  onChange={(e) => setTransForm({ ...transForm, uraian: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Pengeluaran (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={transForm.nominal}
                    onChange={(e) =>
                      setTransForm({ ...transForm, nominal: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={transForm.tanggal}
                    onChange={(e) => setTransForm({ ...transForm, tanggal: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Belanja
                </label>
                <select
                  value={transForm.kategori}
                  onChange={(e) => setTransForm({ ...transForm, kategori: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Belanja Modal">Belanja Modal (Aset Tetap)</option>
                  <option value="Belanja Barang & Jasa">Belanja Barang & Jasa (BHP Praktik)</option>
                  <option value="Pemeliharaan">Pemeliharaan / Servis Alat</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
