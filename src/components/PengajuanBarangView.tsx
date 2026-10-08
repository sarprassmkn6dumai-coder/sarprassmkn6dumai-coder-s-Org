import React, { useState } from 'react';
import { PurchaseRequest, User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { SchoolLogo } from './SchoolLogo';
import { KopSurat } from './KopSurat';
import {
  FilePlus,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Check,
  X,
  Send,
  Eye,
  FileSpreadsheet,
  FileText,
  Printer,
  Edit3,
  User as UserIcon,
  Building2,
  Save,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PengajuanBarangViewProps {
  requests: PurchaseRequest[];
  currentUser: User;
  userRole: UserRole;
  onAddRequest: (request: Omit<PurchaseRequest, 'id' | 'nomorSurat'>) => void;
  onApproveRequest: (
    id: string,
    status: 'Disetujui' | 'Ditolak' | 'Revisi',
    catatanWaka: string
  ) => void;
  onUpdateRequest?: (request: PurchaseRequest) => void;
}

export const PengajuanBarangView: React.FC<PengajuanBarangViewProps> = ({
  requests,
  currentUser,
  userRole,
  onAddRequest,
  onApproveRequest,
  onUpdateRequest,
}) => {
  const isWaka = userRole === 'waka_sarpras' || userRole === 'admin_sarpras';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Approval Modal State
  const [selectedForApproval, setSelectedForApproval] = useState<PurchaseRequest | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'Disetujui' | 'Ditolak' | 'Revisi'>('Disetujui');
  const [catatanWaka, setCatatanWaka] = useState('');

  // Dedicated Surat Pengajuan Modal State (Surat Resmi dengan nama pemohon & jabatan yang bisa diedit)
  const [selectedForSurat, setSelectedForSurat] = useState<PurchaseRequest | null>(null);
  const [suratPemohonNama, setSuratPemohonNama] = useState('');
  const [suratPemohonJabatan, setSuratPemohonJabatan] = useState('');
  const [suratJurusanBengkel, setSuratJurusanBengkel] = useState('');
  const [suratTanggal, setSuratTanggal] = useState('');
  const [suratSavedToast, setSuratSavedToast] = useState(false);

  // Form State for New / Edit Request
  const [formData, setFormData] = useState({
    pemohonNama: currentUser.name,
    pemohonJabatan: currentUser.jabatan,
    jurusanBengkel: currentUser.jurusan || 'Teknik Ketenagalistrikan',
    namaBarang: '',
    spesifikasi: '',
    jumlah: 1,
    satuan: 'Unit',
    estimasiHargaSatuan: 500000,
    alasanKebutuhan: '',
    tanggalPengajuan: new Date().toISOString().slice(0, 10),
  });

  const handleOpenNewForm = () => {
    setEditingRequest(null);
    setFormData({
      pemohonNama: currentUser.name,
      pemohonJabatan: currentUser.jabatan,
      jurusanBengkel: currentUser.jurusan || 'Teknik Ketenagalistrikan',
      namaBarang: '',
      spesifikasi: '',
      jumlah: 1,
      satuan: 'Unit',
      estimasiHargaSatuan: 500000,
      alasanKebutuhan: '',
      tanggalPengajuan: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (req: PurchaseRequest) => {
    setEditingRequest(req);
    setFormData({
      pemohonNama: req.pemohonNama,
      pemohonJabatan: req.pemohonJabatan,
      jurusanBengkel: req.jurusanBengkel,
      namaBarang: req.namaBarang,
      spesifikasi: req.spesifikasi,
      jumlah: req.jumlah,
      satuan: req.satuan,
      estimasiHargaSatuan: req.estimasiHargaSatuan,
      alasanKebutuhan: req.alasanKebutuhan,
      tanggalPengajuan: req.tanggalPengajuan,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalEstimasi = formData.jumlah * formData.estimasiHargaSatuan;

    if (editingRequest) {
      if (onUpdateRequest) {
        onUpdateRequest({
          ...editingRequest,
          ...formData,
          totalEstimasi,
        });
      }
    } else {
      onAddRequest({
        ...formData,
        totalEstimasi,
        status: 'Menunggu',
      });
    }

    setIsFormOpen(false);
    setEditingRequest(null);
  };

  const handleOpenSurat = (req: PurchaseRequest) => {
    setSelectedForSurat(req);
    setSuratPemohonNama(req.pemohonNama);
    setSuratPemohonJabatan(req.pemohonJabatan);
    setSuratJurusanBengkel(req.jurusanBengkel);
    setSuratTanggal(req.tanggalPengajuan);
    setSuratSavedToast(false);
  };

  const handleSaveSuratChanges = () => {
    if (!selectedForSurat) return;
    const updated: PurchaseRequest = {
      ...selectedForSurat,
      pemohonNama: suratPemohonNama.trim() || selectedForSurat.pemohonNama,
      pemohonJabatan: suratPemohonJabatan.trim() || selectedForSurat.pemohonJabatan,
      jurusanBengkel: suratJurusanBengkel,
      tanggalPengajuan: suratTanggal,
    };
    setSelectedForSurat(updated);
    if (onUpdateRequest) {
      onUpdateRequest(updated);
    }
    setSuratSavedToast(true);
    setTimeout(() => setSuratSavedToast(false), 2500);
  };

  const handlePrintSurat = () => {
    window.print();
  };

  const handleOpenApproval = (req: PurchaseRequest) => {
    setSelectedForApproval(req);
    setApprovalStatus(req.status === 'Menunggu' ? 'Disetujui' : req.status);
    setCatatanWaka(req.catatanWaka || '');
  };

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForApproval) return;
    onApproveRequest(selectedForApproval.id, approvalStatus, catatanWaka);
    setSelectedForApproval(null);
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus = filterStatus === 'Semua' || r.status === filterStatus;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (r.namaBarang || '').toLowerCase().includes(q) ||
      (r.pemohonNama || '').toLowerCase().includes(q) ||
      (r.nomorSurat || '').toLowerCase().includes(q) ||
      (r.jurusanBengkel || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengajuan Permintaan Bahan & Alat Praktek
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {requests.filter((r) => r.status === 'Menunggu').length} Butuh Approval
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Usulan bahan habis pakai (BHP) dan alat praktikum dari guru kejuruan & kepala bengkel ke Waka Sarpras.
          </p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Permintaan Barang</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari surat, barang, pemohon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'Menunggu', 'Disetujui', 'Revisi', 'Ditolak'].map((st) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">No. Pengajuan</th>
                <th className="py-3 px-4">Nama Barang & Spek</th>
                <th className="py-3 px-4">Pemohon & Jurusan</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4">Total Estimasi</th>
                <th className="py-3 px-4">Status & Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi & Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data pengajuan bahan/alat sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nomor Pengajuan */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                      {req.nomorSurat}
                    </td>

                    {/* Barang & Spek */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-bold text-slate-900">{req.namaBarang}</div>
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">{req.spesifikasi}</p>
                      {req.alasanKebutuhan && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          Alasan: {req.alasanKebutuhan}
                        </p>
                      )}
                    </td>

                    {/* Pemohon */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{req.pemohonNama}</div>
                      <div className="text-[10px] text-slate-500">{req.pemohonJabatan}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 inline-block mt-0.5">
                        {req.jurusanBengkel}
                      </span>
                    </td>

                    {/* Jumlah */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900">{req.jumlah}</span>
                      <span className="text-[11px] text-slate-400 ml-1">{req.satuan}</span>
                    </td>

                    {/* Total Estimasi */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      Rp {req.totalEstimasi.toLocaleString('id-ID')}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Menunggu'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'Revisi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{req.tanggalPengajuan}</div>
                    </td>

                    {/* Aksi & Approval */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Tombol Lihat & Cetak Surat Pengajuan Resmi */}
                        <button
                          type="button"
                          onClick={() => handleOpenSurat(req)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                          title="Buka Surat Pengajuan (Edit Pemohon/Jabatan & Cetak)"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Surat</span>
                        </button>

                        {/* Tombol Edit Rincian Permintaan */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(req)}
                          className="p-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                          title="Edit Formulir Permintaan & Pemohon"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        </button>

                        {/* Tombol Approval / Catatan */}
                        <button
                          type="button"
                          onClick={() => handleOpenApproval(req)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isWaka && req.status === 'Menunggu'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isWaka ? 'Approval' : 'Catatan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL PENGAJUAN BARANG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base">
                    {editingRequest ? 'Edit Surat Pengajuan Permintaan Barang/Alat' : 'Surat Pengajuan Permintaan Barang/Alat'}
                  </h3>
                  {editingRequest && (
                    <span className="font-mono text-xs text-blue-300">{editingRequest.nomorSurat}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* EDITABLE IDENTITAS PEMOHON */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Identitas Pemohon (Bisa Diedit)</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    Dapat disesuaikan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Pemohon <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso, S.Pd."
                      value={formData.pemohonNama}
                      onChange={(e) => setFormData({ ...formData, pemohonNama: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Jabatan / Unit Kerja <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Guru Produktif / Kepala Bengkel Listrik"
                      value={formData.pemohonJabatan}
                      onChange={(e) => setFormData({ ...formData, pemohonJabatan: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Pilihan Cepat:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pemohonNama: currentUser.name,
                        pemohonJabatan: currentUser.jabatan,
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Gunakan Akun Saya ({currentUser.name.split(' ')[0]})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pemohonNama: 'Ir. Ahmad Zulkifli, S.T.',
                        pemohonJabatan: 'Ketua Program Keahlian Teknik Ketenagalistrikan',
                        jurusanBengkel: 'Teknik Ketenagalistrikan',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Kapro Ketenagalistrikan
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pemohonNama: 'Dr. Nurul Hidayati, S.Si., M.T.',
                        pemohonJabatan: 'Ketua Program Keahlian Teknik Kimia',
                        jurusanBengkel: 'Teknik Kimia',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Kapro Teknik Kimia
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pemohonNama: 'Hendra Gunawan, S.Pd.',
                        pemohonJabatan: 'Kepala Bengkel Ketenagalistrikan',
                        jurusanBengkel: 'Teknik Ketenagalistrikan',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Kepala Bengkel Listrik
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pemohonNama: 'Siti Rahmawati, S.Pd.',
                        pemohonJabatan: 'Kepala Laboratorium Kimia',
                        jurusanBengkel: 'Teknik Kimia',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Kepala Lab Kimia
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jurusan / Bengkel Pemohon
                  </label>
                  <select
                    value={formData.jurusanBengkel}
                    onChange={(e) => setFormData({ ...formData, jurusanBengkel: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Teknik Ketenagalistrikan">Teknik Ketenagalistrikan</option>
                    <option value="Teknik Kimia">Teknik Kimia</option>
                    <option value="Umum">Umum / Sarana Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengajuan
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalPengajuan}
                    onChange={(e) => setFormData({ ...formData, tanggalPengajuan: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bahan / Alat yang Diminta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kabel UTP Cat6 Belden / Kawat Las E6013 / Kunci Torsi..."
                  value={formData.namaBarang}
                  onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spesifikasi Teknis & Merek
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tuliskan spesifikasi, ukuran, grade bahan, atau merek yang direkomendasikan..."
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Roll / Dus / Unit"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.estimasiHargaSatuan}
                    onChange={(e) =>
                      setFormData({ ...formData, estimasiHargaSatuan: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">Total Perkiraan Biaya Pengajuan:</span>
                <span className="font-mono font-bold text-blue-900 text-sm">
                  Rp {(formData.jumlah * formData.estimasiHargaSatuan).toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Kebutuhan / Peruntukan Pembelajaran
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Kebutuhan praktikum job sheet 4, persiapan Uji Kompetensi Keahlian (UKK)..."
                  value={formData.alasanKebutuhan}
                  onChange={(e) => setFormData({ ...formData, alasanKebutuhan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingRequest ? 'Simpan Perubahan' : 'Kirim Usulan ke Waka'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SURAT PENGAJUAN PERMINTAAN BARANG/ALAT RESMI (CETAK & EDIT NAMA/JABATAN) */}
      {selectedForSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print-modal-container">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in my-auto print-modal-content">
            {/* Header Toolbar (Hidden in Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Surat Pengajuan Permintaan Barang/Alat
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-mono text-blue-300 font-semibold">{selectedForSurat.nomorSurat}</span>
                    <span>•</span>
                    <span>Status: <strong className="text-white">{selectedForSurat.status}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSuratChanges}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Simpan Perubahan Nama Pemohon & Data Surat"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintSurat}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Cetak Surat atau Simpan ke PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedForSurat(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Toast if Saved (Hidden in Print) */}
            {suratSavedToast && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2 font-medium no-print animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Perubahan Nama Pemohon & Jabatan/Unit pada surat ini berhasil disimpan!</span>
              </div>
            )}

            {/* Banner info bantuan editing (Hidden in Print) */}
            <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Fitur Edit Aktif:</strong> Anda dapat langsung mengedit <strong>Nama Pemohon</strong>, <strong>Jabatan / Unit</strong>, dan <strong>Tanggal</strong> di dalam surat di bawah ini sebelum dicetak.
                </span>
              </div>
              <button
                onClick={handleSaveSuratChanges}
                className="underline font-bold text-amber-800 hover:text-amber-950 text-[11px] shrink-0 ml-2 cursor-pointer"
              >
                Klik Simpan
              </button>
            </div>

            {/* THE ACTUAL PRINTABLE LETTER SHEET */}
            <div className="p-6 sm:p-10 max-h-[75vh] overflow-y-auto text-slate-900 print:overflow-visible print:max-h-none print:p-0 print:m-0">
              {/* KOP SURAT RESMI PEMERINTAH PROVINSI RIAU - SMKN 6 DUMAI */}
              <KopSurat size="md" className="mb-4" />

              {/* SURAT METADATA & TUJUAN */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-700">Nomor</span>
                    <span>:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedForSurat.nomorSurat}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-700">Lampiran</span>
                    <span>:</span>
                    <span>1 (Satu) Berkas Usulan</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-700">Hal</span>
                    <span>:</span>
                    <span className="font-bold text-slate-900">
                      Permohonan Pengadaan / Permintaan Bahan & Alat Praktik Kejuruan
                    </span>
                  </div>
                </div>

                <div className="text-right sm:w-64">
                  <div className="flex items-center sm:justify-end gap-1 mb-2">
                    <span className="text-slate-600">Dumai,</span>
                    <input
                      type="date"
                      value={suratTanggal}
                      onChange={(e) => setSuratTanggal(e.target.value)}
                      className="px-2 py-0.5 rounded border border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs font-medium text-slate-800 bg-slate-50/50 print:bg-transparent print:border-none print:p-0"
                      title="Tanggal Surat (Bisa Diedit)"
                    />
                  </div>
                  <div className="text-left font-sans text-xs space-y-0.5">
                    <p>Kepada Yth.</p>
                    <p className="font-bold">Wakil Kepala Sekolah Bidang Sarpras</p>
                    <p>SMK Negeri 6 Dumai</p>
                    <p>di - <span className="underline">Tempat</span></p>
                  </div>
                </div>
              </div>

              {/* PARAGRAF PEMBUKA */}
              <div className="mt-6 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans space-y-3">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan kelancaran kegiatan belajar mengajar (KBM) dan praktikum kejuruan peserta didik di bengkel/laboratorium SMK Negeri 6 Dumai, yang bertanda tangan di bawah ini:
                </p>

                {/* FORM IDENTITAS PEMOHON YANG BISA DIEDIT LANGSUNG */}
                <div className="my-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 print:border-none print:p-0 print:bg-transparent space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-slate-700 flex items-center gap-1">
                      Nama Pemohon
                      <span className="no-print text-[10px] text-blue-600 font-normal">(bisa diedit)</span>
                      <span>:</span>
                    </span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={suratPemohonNama}
                        onChange={(e) => setSuratPemohonNama(e.target.value)}
                        placeholder="Nama lengkap pemohon..."
                        className="w-full max-w-md px-2.5 py-1 text-xs font-bold text-slate-900 bg-white rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-600 outline-none print:border-none print:p-0 print:bg-transparent print:text-sm"
                        title="Klik untuk mengubah nama pemohon"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-slate-700 flex items-center gap-1">
                      Jabatan / Unit
                      <span className="no-print text-[10px] text-blue-600 font-normal">(bisa diedit)</span>
                      <span>:</span>
                    </span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={suratPemohonJabatan}
                        onChange={(e) => setSuratPemohonJabatan(e.target.value)}
                        placeholder="Jabatan / unit pemohon..."
                        className="w-full max-w-md px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-600 outline-none print:border-none print:p-0 print:bg-transparent print:text-sm"
                        title="Klik untuk mengubah jabatan/unit pemohon"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-slate-700 flex items-center gap-1">
                      Jurusan / Bengkel
                      <span className="no-print text-[10px] text-blue-600 font-normal">(bisa diedit)</span>
                      <span>:</span>
                    </span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <select
                        value={suratJurusanBengkel}
                        onChange={(e) => setSuratJurusanBengkel(e.target.value)}
                        className="max-w-md px-2.5 py-1 text-xs font-medium text-slate-800 bg-white rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-600 outline-none print:hidden"
                      >
                        <option value="Teknik Ketenagalistrikan">Teknik Ketenagalistrikan</option>
                        <option value="Teknik Kimia">Teknik Kimia</option>
                        <option value="Umum">Umum / Sarana Sekolah</option>
                      </select>
                      <span className="hidden print:inline text-xs font-medium text-slate-900">
                        {suratJurusanBengkel}
                      </span>
                    </div>
                  </div>
                </div>

                <p>
                  Dengan ini mengajukan permohonan pengadaan atau permintaan barang/alat praktik kejuruan dengan rincian sebagai berikut:
                </p>

                {/* TABEL RINCIAN BARANG RESMI */}
                <div className="border border-slate-300 rounded-lg overflow-hidden my-3 print:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900 print:bg-slate-200">
                        <th className="p-2 text-center w-10 border-r border-slate-300">No</th>
                        <th className="p-2 border-r border-slate-300">Nama Bahan / Alat</th>
                        <th className="p-2 border-r border-slate-300">Spesifikasi Teknis & Merek</th>
                        <th className="p-2 text-center border-r border-slate-300 w-24">Jumlah</th>
                        <th className="p-2 text-right border-r border-slate-300 w-32">Estimasi Harga</th>
                        <th className="p-2 text-right w-36">Total Estimasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 print:divide-slate-400">
                      <tr>
                        <td className="p-2 text-center border-r border-slate-300">1</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                          {selectedForSurat.namaBarang}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-700 italic">
                          {selectedForSurat.spesifikasi || '-'}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-semibold">
                          {selectedForSurat.jumlah} {selectedForSurat.satuan}
                        </td>
                        <td className="p-2 text-right border-r border-slate-300 font-mono">
                          Rp {selectedForSurat.estimasiHargaSatuan.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          Rp {selectedForSurat.totalEstimasi.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold print:bg-slate-100">
                        <td colSpan={5} className="p-2 text-right text-slate-800 border-r border-slate-300">
                          Total Perkiraan Biaya Kebutuhan:
                        </td>
                        <td className="p-2 text-right font-mono text-sm text-blue-900 font-black print:text-slate-900">
                          Rp {selectedForSurat.totalEstimasi.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* ALASAN KEBUTUHAN */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:border-none print:p-0 print:bg-transparent">
                  <p className="text-xs">
                    <strong>Tujuan / Alasan Kebutuhan:</strong> {selectedForSurat.alasanKebutuhan}
                  </p>
                  {selectedForSurat.catatanWaka && (
                    <p className="text-xs text-blue-900 mt-1">
                      <strong>Disposisi / Catatan Waka Sarpras:</strong> {selectedForSurat.catatanWaka}
                    </p>
                  )}
                </div>

                <p>
                  Demikian surat pengajuan permintaan bahan dan alat ini kami sampaikan. Besar harapan kami usulan ini dapat direalisasikan demi mendukung ketercapaian kompetensi kejuruan peserta didik. Atas perhatian, arahan, dan kebijaksanaan Bapak, kami ucapkan terima kasih.
                </p>
              </div>

              {/* LEMBAR PENGESAHAN / TANDA TANGAN (3 PIHAK RESMI) */}
              <div className="mt-10 pt-4 grid grid-cols-3 gap-4 text-center text-xs font-sans leading-tight">
                {/* 1. Mengetahui Waka Sarpras */}
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900">Waka Sarana & Prasarana</p>
                  <div className="h-20 flex items-center justify-center">
                    {selectedForSurat.status === 'Disetujui' && (
                      <span className="text-[11px] font-bold text-emerald-700 border border-emerald-500 rounded px-2 py-0.5 bg-emerald-50 rotate-[-4deg]">
                        DISETUJUI WAKA
                      </span>
                    )}
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {StorageService.getSchoolProfile().wakaSarpras || 'Bambang Trianto, S.T., M.Kom.'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    NIP. {StorageService.getSchoolProfile().nipWakaSarpras || '19790815 200801 1 012'}
                  </p>
                </div>

                {/* 2. Menyetujui Kepala Sekolah */}
                <div>
                  <p className="text-slate-600">Menyetujui,</p>
                  <p className="font-bold text-slate-900">Kepala SMK Negeri 6 Dumai</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">
                      [Tanda Tangan & Cap]
                    </span>
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {StorageService.getSchoolProfile().kepalaSekolah || 'Drs. H. Syahrul, M.Pd.'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    NIP. {StorageService.getSchoolProfile().nipKepalaSekolah || '19680512 199403 1 005'}
                  </p>
                </div>

                {/* 3. Pemohon (OTOMATIS MEREFLEKSIKAN NAMA & JABATAN YANG DIEDIT) */}
                <div>
                  <p className="text-slate-600">Dumai, {suratTanggal || selectedForSurat.tanggalPengajuan}</p>
                  <p className="font-bold text-slate-900">Pemohon / Pengusul,</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">
                      [Tanda Tangan]
                    </span>
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {suratPemohonNama || selectedForSurat.pemohonNama}
                  </p>
                  <p className="text-[10px] text-slate-700 font-medium">
                    {suratPemohonJabatan || selectedForSurat.pemohonJabatan}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Footer (Hidden in Print) */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              <div className="text-xs text-slate-500">
                Data pemohon yang diedit akan langsung diperbarui di sistem saat Anda menekan <strong>Simpan Perubahan</strong>.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForSurat(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveSuratChanges}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Surat</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSurat}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL & CATATAN MODAL */}
      {selectedForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-300">{selectedForApproval.nomorSurat}</span>
                <h3 className="font-bold text-base">Alur Persetujuan Waka Sarpras</h3>
              </div>
              <button
                onClick={() => setSelectedForApproval(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApproval} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
                <p>
                  <strong>Barang:</strong> {selectedForApproval.namaBarang} ({selectedForApproval.jumlah}{' '}
                  {selectedForApproval.satuan})
                </p>
                <p>
                  <strong>Pemohon:</strong> {selectedForApproval.pemohonNama} ({selectedForApproval.jurusanBengkel})
                </p>
                <p>
                  <strong>Estimasi Biaya:</strong> Rp{' '}
                  {selectedForApproval.totalEstimasi.toLocaleString('id-ID')}
                </p>
                <p>
                  <strong>Alasan:</strong> {selectedForApproval.alasanKebutuhan}
                </p>
              </div>

              {isWaka ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keputusan Waka Sarpras
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setApprovalStatus('Disetujui')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          approvalStatus === 'Disetujui'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => setApprovalStatus('Revisi')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          approvalStatus === 'Revisi'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Minta Revisi
                      </button>
                      <button
                        type="button"
                        onClick={() => setApprovalStatus('Ditolak')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          approvalStatus === 'Ditolak'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Tolak
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Disposisi / Sumber Anggaran
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Disetujui masuk pengadaan BOS Kinerja Triwulan 3..."
                      value={catatanWaka}
                      onChange={(e) => setCatatanWaka(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-blue-900 block">Status Saat Ini: {selectedForApproval.status}</span>
                  <p className="text-slate-700">
                    Catatan Waka: {selectedForApproval.catatanWaka || 'Belum ada catatan dari Waka Sarpras.'}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForApproval(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Tutup
                </button>
                {isWaka && (
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md cursor-pointer"
                  >
                    Simpan Keputusan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
