import React, { useState, useEffect } from 'react';
import {
  DamageReport,
  AssetItem,
  User,
  UserRole,
  UrgencyLevel,
  ReportStatus,
} from '../types';
import { StorageService } from '../services/storage';
import { KopSurat } from './KopSurat';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Camera,
  Upload,
  Eye,
  X,
  Send,
  UserCheck,
  Printer,
  FileText,
} from 'lucide-react';

interface LaporanKerusakanViewProps {
  reports: DamageReport[];
  assets: AssetItem[];
  currentUser: User;
  userRole: UserRole;
  preloadedAsset: AssetItem | null;
  onClearPreloadedAsset: () => void;
  onAddReport: (report: Omit<DamageReport, 'id' | 'tiket'>) => void;
  onUpdateReportStatus: (
    reportId: string,
    status: ReportStatus,
    tindakLanjut: string,
    teknisiNama: string
  ) => void;
}

export const LaporanKerusakanView: React.FC<LaporanKerusakanViewProps> = ({
  reports,
  assets,
  currentUser,
  userRole,
  preloadedAsset,
  onClearPreloadedAsset,
  onAddReport,
  onUpdateReportStatus,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [assetNama, setAssetNama] = useState('');
  const [assetKode, setAssetKode] = useState('');
  const [lokasiRuangan, setLokasiRuangan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urgensi, setUrgensi] = useState<UrgencyLevel>('Sedang');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  // Status Filter
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Process Modal
  const [processingReport, setProcessingReport] = useState<DamageReport | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<ReportStatus>('Diproses');
  const [tindakLanjutVal, setTindakLanjutVal] = useState('');
  const [teknisiVal, setTeknisiVal] = useState('');

  // Detail Modal
  const [viewDetailReport, setViewDetailReport] = useState<DamageReport | null>(null);
  const [isPrintingDamageSlip, setIsPrintingDamageSlip] = useState(false);

  // Auto-fill from preloaded asset (e.g. from QR scan)
  useEffect(() => {
    if (preloadedAsset) {
      setSelectedAssetId(preloadedAsset.id);
      setAssetNama(preloadedAsset.nama);
      setAssetKode(preloadedAsset.kode);
      setLokasiRuangan(preloadedAsset.ruanganNama);
      setIsFormOpen(true);
      onClearPreloadedAsset();
    }
  }, [preloadedAsset, onClearPreloadedAsset]);

  const handleAssetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assetId = e.target.value;
    setSelectedAssetId(assetId);
    if (assetId === 'custom') {
      setAssetNama('');
      setAssetKode('');
      setLokasiRuangan('');
    } else {
      const matched = assets.find((a) => a.id === assetId);
      if (matched) {
        setAssetNama(matched.nama);
        setAssetKode(matched.kode);
        setLokasiRuangan(matched.ruanganNama);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReport({
      pelaporNama: currentUser.name,
      pelaporRole: currentUser.jabatan,
      pelaporNIP: currentUser.username,
      assetKode: assetKode || undefined,
      assetNama,
      lokasiRuangan,
      deskripsi,
      urgensi,
      fotoUrl: fotoUrl || undefined,
      status: 'Menunggu',
      tanggalLapor: new Date().toISOString().slice(0, 10),
    });

    // Reset Form
    setSelectedAssetId('');
    setAssetNama('');
    setAssetKode('');
    setLokasiRuangan('');
    setDeskripsi('');
    setUrgensi('Sedang');
    setFotoUrl('');
    setIsFormOpen(false);
  };

  const handleOpenProcess = (report: DamageReport) => {
    setProcessingReport(report);
    setUpdateStatusVal(report.status === 'Menunggu' ? 'Diproses' : report.status);
    setTindakLanjutVal(report.tindakLanjut || '');
    setTeknisiVal(report.teknisiNama || 'Rahmat Hidayat (Teknisi Sarpras)');
  };

  const handleSaveProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingReport) return;
    onUpdateReportStatus(processingReport.id, updateStatusVal, tindakLanjutVal, teknisiVal);
    setProcessingReport(null);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchStatus = filterStatus === 'Semua' || r.status === filterStatus;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (r.assetNama || '').toLowerCase().includes(q) ||
      (r.tiket || '').toLowerCase().includes(q) ||
      (r.lokasiRuangan || '').toLowerCase().includes(q) ||
      (r.pelaporNama || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Laporan Kerusakan Sarpras</h2>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              {reports.filter((r) => r.status === 'Menunggu').length} Tiket Menunggu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Layanan pelaporan kerusakan fasilitas, alat bengkel kejuruan, dan inventaris sekolah secara cepat dan transparan.
          </p>
        </div>

        <button
          id="btn-buat-laporan"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Kerusakan</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari tiket, barang, pelapor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'Menunggu', 'Diproses', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Nama Barang & Lokasi</th>
                <th className="py-3 px-4">Pelapor</th>
                <th className="py-3 px-4">Urgensi</th>
                <th className="py-3 px-4">Foto Bukti</th>
                <th className="py-3 px-4">Status & Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data laporan kerusakan sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tiket */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                      {report.tiket}
                    </td>

                    {/* Barang & Lokasi */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-bold text-slate-900">{report.assetNama}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{report.lokasiRuangan}</div>
                      <p className="text-[11px] text-slate-600 italic line-clamp-1 mt-0.5">
                        "{report.deskripsi}"
                      </p>
                    </td>

                    {/* Pelapor */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{report.pelaporNama}</div>
                      <span className="text-[10px] text-slate-400">{report.pelaporRole}</span>
                    </td>

                    {/* Urgensi */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.urgensi === 'Darurat'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : report.urgensi === 'Tinggi'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : report.urgensi === 'Sedang'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {report.urgensi}
                      </span>
                    </td>

                    {/* Foto Bukti */}
                    <td className="py-3 px-4">
                      {report.fotoUrl ? (
                        <div
                          onClick={() => setViewDetailReport(report)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={report.fotoUrl}
                            alt="Bukti Rusak"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Tidak ada foto</span>
                      )}
                    </td>

                    {/* Status & Tanggal */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.status === 'Menunggu'
                            ? 'bg-amber-100 text-amber-800'
                            : report.status === 'Diproses'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {report.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{report.tanggalLapor}</div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewDetailReport(report)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                          title="Lihat Rincian Laporan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isFullAccess && (
                          <button
                            onClick={() => handleOpenProcess(report)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 font-semibold text-xs flex items-center gap-1"
                            title="Tindak Lanjuti / Update Status"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Proses</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM PELAPORAN KERUSAKAN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Formulir Pelaporan Kerusakan Sarpras</h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-700">Pelapor Terdaftar:</span>
                <p className="font-bold text-slate-900">{currentUser.name} ({currentUser.jabatan})</p>
                <p className="text-slate-500 font-mono text-[11px]">NIP/NISN: {currentUser.username}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Aset dari Database (atau Input Manual)
                </label>
                <select
                  value={selectedAssetId}
                  onChange={handleAssetSelect}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                >
                  <option value="">-- Pilih Barang dari Inventaris Sekolah --</option>
                  <option value="custom">+ Barang / Fasilitas Lainnya (Ketik Manual)</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.kode}] {a.nama} - {a.ruanganNama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Barang / Fasilitas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AC Ruang Guru / PC Lab 04"
                    value={assetNama}
                    onChange={(e) => setAssetNama(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Ruangan / Bengkel
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bengkel Listrik 1 / Lab Kimia Analisis"
                    value={lokasiRuangan}
                    onChange={(e) => setLokasiRuangan(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Urgensi Kerusakan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Rendah', 'Sedang', 'Tinggi', 'Darurat'] as UrgencyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgensi(level)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        urgensi === level
                          ? level === 'Darurat'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : level === 'Tinggi'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Kerusakan & Gejala
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan secara detail bagian yang rusak, bunyi aneh, bau gosong, atau kendala operasional..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Unggah Foto Bukti */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah Foto Bukti Kerusakan
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>Pilih Foto dari Galeri / Kamera</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {fotoUrl && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Foto siap diunggah
                    </span>
                  )}
                </div>

                {fotoUrl && (
                  <div className="mt-2 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 relative">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Kerusakan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN: PROSES & DISPOSISI LAPORAN */}
      {processingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Tindak Lanjut Laporan Kerusakan</h3>
                <p className="text-xs text-blue-300 font-mono">Tiket: {processingReport.tiket}</p>
              </div>
              <button
                onClick={() => setProcessingReport(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
                <p>
                  <strong>Aset:</strong> {processingReport.assetNama}
                </p>
                <p>
                  <strong>Lokasi:</strong> {processingReport.lokasiRuangan}
                </p>
                <p>
                  <strong>Keluhan:</strong> "{processingReport.deskripsi}"
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Penanganan</label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value as ReportStatus)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Menunggu">Menunggu Penanganan</option>
                  <option value="Diproses">Diproses (Sedang Dikerjakan)</option>
                  <option value="Selesai">Selesai (Sudah Diperbaiki / Diganti)</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teknisi / Penanggung Jawab Perbaikan
                </label>
                <input
                  type="text"
                  required
                  value={teknisiVal}
                  onChange={(e) => setTeknisiVal(e.target.value)}
                  placeholder="Nama teknisi internal atau vendor rekanan"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tindak Lanjut & Solusi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan komponen yang diganti, jadwal pengecekan ulang, atau keterangan solusi..."
                  value={tindakLanjutVal}
                  onChange={(e) => setTindakLanjutVal(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProcessingReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL WITH PHOTO VIEW */}
      {viewDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-300">{viewDetailReport.tiket}</span>
                <h3 className="font-bold text-base">{viewDetailReport.assetNama}</h3>
              </div>
              <button
                onClick={() => setViewDetailReport(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {viewDetailReport.fotoUrl && (
                <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={viewDetailReport.fotoUrl}
                    alt="Foto Kerusakan"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Lokasi Ruangan:</span>
                  <span className="font-semibold text-slate-800">{viewDetailReport.lokasiRuangan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tingkat Urgensi:</span>
                  <span className="font-bold text-rose-700">{viewDetailReport.urgensi}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pelapor:</span>
                  <span className="font-semibold text-slate-800">{viewDetailReport.pelaporNama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Lapor:</span>
                  <span className="font-semibold text-slate-800">{viewDetailReport.tanggalLapor}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Deskripsi Kerusakan:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {viewDetailReport.deskripsi}
                </p>
              </div>

              {viewDetailReport.tindakLanjut && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <span className="text-blue-900 font-bold block">Tindak Lanjut & Teknisi:</span>
                  <p className="text-slate-700">{viewDetailReport.tindakLanjut}</p>
                  <p className="text-slate-500 text-[11px]">Teknisi: {viewDetailReport.teknisiNama || '-'}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsPrintingDamageSlip(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Berita Acara Kerusakan</span>
              </button>

              <button
                onClick={() => setViewDetailReport(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK RESMI BERITA ACARA KERUSAKAN / TIKET PERBAIKAN DENGAN KOP SURAT */}
      {isPrintingDamageSlip && viewDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in">
            {/* Top Bar (Hidden in Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Cetak Berita Acara Kerusakan</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {viewDetailReport.tiket} &bull; {viewDetailReport.assetNama}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => setIsPrintingDamageSlip(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL SHEET */}
            <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto text-slate-900 print:overflow-visible print:max-h-none print:p-0 print:m-0 font-serif">
              {/* KOP SURAT RESMI */}
              <KopSurat size="md" className="mb-4" />

              {/* JUDUL DOKUMEN */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-black uppercase text-black underline decoration-2 underline-offset-4">
                  BERITA ACARA KERUSAKAN & PERMOHONAN PERBAIKAN ASET
                </h2>
                <p className="text-xs font-bold text-black mt-1 font-mono">
                  Nomor Tiket : {viewDetailReport.tiket}
                </p>
              </div>

              {/* ISI BERITA ACARA */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed mt-5">
                <p>
                  Pada hari ini, dilaporkan terjadinya gangguan teknis / kerusakan pada sarana prasarana sekolah{' '}
                  <strong>SMK Negeri 6 Dumai</strong> dengan data rincian sebagai berikut:
                </p>

                <div className="border border-black p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Kode Barang / Aset</span>
                    <span className="col-span-2 font-mono font-bold text-black">
                      {viewDetailReport.assetKode}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Nama Barang</span>
                    <span className="col-span-2 font-bold text-black">
                      {viewDetailReport.assetNama}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Lokasi Penempatan</span>
                    <span className="col-span-2 text-black">
                      {viewDetailReport.lokasiRuangan}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Nama Pelapor</span>
                    <span className="col-span-2 text-black">
                      {viewDetailReport.pelaporNama} (Peran: {viewDetailReport.pelaporRole})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Tanggal Pelaporan</span>
                    <span className="col-span-2 font-mono text-black">
                      {viewDetailReport.tanggalLapor}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Tingkat Urgensi</span>
                    <span className="col-span-2 font-bold text-rose-800">
                      {viewDetailReport.urgensi}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Deskripsi Kerusakan</span>
                    <span className="col-span-2 text-black italic">
                      "{viewDetailReport.deskripsi}"
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Status Penanganan</span>
                    <span className="col-span-2 font-semibold text-blue-900">
                      {viewDetailReport.status}
                    </span>
                  </div>
                  {viewDetailReport.tindakLanjut && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-bold text-slate-700">Tindak Lanjut Teknisi</span>
                      <span className="col-span-2 text-slate-800">
                        {viewDetailReport.tindakLanjut} (Teknisi: {viewDetailReport.teknisiNama || '-'})
                      </span>
                    </div>
                  )}
                </div>

                <p>
                  Demikian Berita Acara Kerusakan ini dibuat dengan sebenarnya untuk diteruskan kepada Unit Sarana dan
                  Prasarana guna tindak lanjut perbaikan atau penggantian suku cadang.
                </p>

                {/* TANDA TANGAN RESMI */}
                {(() => {
                  const sp = StorageService.getSchoolProfile();
                  return (
                    <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                      <div className="space-y-16">
                        <div>
                          <p>Pelapor / Penanggung Jawab Ruangan,</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">{viewDetailReport.pelaporNama}</p>
                          <p className="text-[11px] text-slate-600">Guru / Staf Pelapor</p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <div>
                          <p>Dumai, {viewDetailReport.tanggalLapor}</p>
                          <p className="font-bold">Unit Sarana & Prasarana,</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">
                            {sp.pengelolaAset || 'Rahmat Hidayat, A.Md.'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            NIP. {sp.nipPengelolaAset || '19880421 201101 1 003'}
                          </p>
                        </div>
                      </div>

                      {/* Mengetahui Kepala Sekolah (Center Bottom) */}
                      <div className="col-span-2 pt-6 space-y-16">
                        <div>
                          <p>Mengetahui,</p>
                          <p className="font-bold">Kepala SMK Negeri 6 Dumai</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">
                            {sp.kepalaSekolah || 'Drs. H. Syahrul, M.Pd.'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            NIP. {sp.nipKepalaSekolah || '19680512 199403 1 005'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer (Hidden in Print) */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                Berita acara kerusakan resmi dilengkapi Kop Surat Pemprov Riau & SMKN 6 Dumai.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintingDamageSlip(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
