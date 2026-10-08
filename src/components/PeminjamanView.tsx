import React, { useState, useEffect } from 'react';
import { LoanItem, AssetItem, RoomItem, User, UserRole, LoanStatus } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { KopSurat } from './KopSurat';
import {
  Share2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  FileCheck,
  Send,
  Calendar,
  UserCheck,
  User as UserIcon,
  Phone,
  Edit3,
  Save,
  Check,
} from 'lucide-react';

interface PeminjamanViewProps {
  loans: LoanItem[];
  assets: AssetItem[];
  rooms: RoomItem[];
  currentUser: User;
  userRole: UserRole;
  preloadedAsset: AssetItem | null;
  onClearPreloadedAsset: () => void;
  onAddLoan: (loan: Omit<LoanItem, 'id' | 'kodePinjam'>) => void;
  onReturnLoan: (
    loanId: string,
    kondisiKembali: 'Baik' | 'Ada Kerusakan',
    catatanKembali: string
  ) => void;
  onUpdateLoan?: (loan: LoanItem) => void;
}

export const PeminjamanView: React.FC<PeminjamanViewProps> = ({
  loans,
  assets,
  rooms,
  currentUser,
  userRole,
  preloadedAsset,
  onClearPreloadedAsset,
  onAddLoan,
  onReturnLoan,
  onUpdateLoan,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Digital Slip Modal
  const [selectedLoanForSlip, setSelectedLoanForSlip] = useState<LoanItem | null>(null);
  const [slipPeminjamNama, setSlipPeminjamNama] = useState('');
  const [slipPeminjamRole, setSlipPeminjamRole] = useState('');
  const [slipPeminjamKontak, setSlipPeminjamKontak] = useState('');
  const [slipSavedToast, setSlipSavedToast] = useState(false);

  // Return Modal
  const [returningLoan, setReturningLoan] = useState<LoanItem | null>(null);
  const [kondisiKembaliVal, setKondisiKembaliVal] = useState<'Baik' | 'Ada Kerusakan'>('Baik');
  const [catatanKembaliVal, setCatatanKembaliVal] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    peminjamNama: currentUser.name,
    peminjamRole: currentUser.jabatan,
    peminjamKontak: currentUser.phone || '0812-7654-3210',
    tipe: 'Barang' as 'Barang' | 'Ruangan',
    itemId: assets[0]?.id || '',
    itemNama: assets[0]?.nama || '',
    jumlah: 1,
    satuan: 'Unit',
    tanggalPinjam: new Date().toISOString().slice(0, 10),
    rencanaKembali: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    keperluan: '',
  });

  // Preload from QR scan
  useEffect(() => {
    if (preloadedAsset) {
      setFormData((prev) => ({
        ...prev,
        tipe: 'Barang',
        itemId: preloadedAsset.id,
        itemNama: preloadedAsset.nama,
        satuan: preloadedAsset.satuan,
      }));
      setIsFormOpen(true);
      onClearPreloadedAsset();
    }
  }, [preloadedAsset, onClearPreloadedAsset]);

  const handleOpenNewForm = () => {
    setEditingLoan(null);
    setFormData({
      peminjamNama: currentUser.name,
      peminjamRole: currentUser.jabatan,
      peminjamKontak: currentUser.phone || '0812-7654-3210',
      tipe: 'Barang',
      itemId: assets[0]?.id || '',
      itemNama: assets[0]?.nama || '',
      jumlah: 1,
      satuan: 'Unit',
      tanggalPinjam: new Date().toISOString().slice(0, 10),
      rencanaKembali: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      keperluan: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (loan: LoanItem) => {
    setEditingLoan(loan);
    setFormData({
      peminjamNama: loan.peminjamNama,
      peminjamRole: loan.peminjamRole,
      peminjamKontak: loan.peminjamKontak || '0812-7654-3210',
      tipe: loan.tipe || 'Barang',
      itemId: loan.itemId || loan.assetId || '',
      itemNama: loan.itemNama || loan.assetNama || '',
      jumlah: loan.jumlah || 1,
      satuan: loan.satuan || 'Unit',
      tanggalPinjam: loan.tanggalPinjam,
      rencanaKembali: loan.rencanaKembali,
      keperluan: loan.keperluan || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenSlip = (loan: LoanItem) => {
    setSelectedLoanForSlip(loan);
    setSlipPeminjamNama(loan.peminjamNama);
    setSlipPeminjamRole(loan.peminjamRole);
    setSlipPeminjamKontak(loan.peminjamKontak || '');
    setSlipSavedToast(false);
  };

  const handleSaveSlipChanges = () => {
    if (!selectedLoanForSlip) return;
    const updated: LoanItem = {
      ...selectedLoanForSlip,
      peminjamNama: slipPeminjamNama.trim() || selectedLoanForSlip.peminjamNama,
      peminjamRole: slipPeminjamRole.trim() || selectedLoanForSlip.peminjamRole,
      peminjamKontak: slipPeminjamKontak.trim() || selectedLoanForSlip.peminjamKontak,
    };
    setSelectedLoanForSlip(updated);
    if (onUpdateLoan) {
      onUpdateLoan(updated);
    }
    setSlipSavedToast(true);
    setTimeout(() => setSlipSavedToast(false), 2500);
  };

  const handleTypeChange = (type: 'Barang' | 'Ruangan') => {
    if (type === 'Barang') {
      setFormData({
        ...formData,
        tipe: 'Barang',
        itemId: assets[0]?.id || '',
        itemNama: assets[0]?.nama || '',
        satuan: 'Unit',
        jumlah: 1,
      });
    } else {
      setFormData({
        ...formData,
        tipe: 'Ruangan',
        itemId: rooms[0]?.id || '',
        itemNama: rooms[0]?.namaRuang || '',
        satuan: 'Ruangan',
        jumlah: 1,
      });
    }
  };

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (formData.tipe === 'Barang') {
      const itm = assets.find((a) => a.id === id);
      if (itm) {
        setFormData({
          ...formData,
          itemId: itm.id,
          itemNama: itm.nama,
          satuan: itm.satuan,
        });
      }
    } else {
      const r = rooms.find((rm) => rm.id === id);
      if (r) {
        setFormData({
          ...formData,
          itemId: r.id,
          itemNama: r.namaRuang,
          satuan: 'Ruangan',
        });
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoan) {
      if (onUpdateLoan) {
        onUpdateLoan({
          ...editingLoan,
          ...formData,
          assetId: formData.tipe === 'Barang' ? formData.itemId : undefined,
          assetNama: formData.tipe === 'Barang' ? formData.itemNama : undefined,
        });
      }
    } else {
      onAddLoan({
        ...formData,
        status: 'Aktif',
      });
    }
    setIsFormOpen(false);
    setEditingLoan(null);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;
    onReturnLoan(returningLoan.id, kondisiKembaliVal, catatanKembaliVal);
    setReturningLoan(null);
  };

  const filteredLoans = loans.filter((l) => {
    const isDipinjam = l.status === 'Aktif' || l.status === 'Dipinjam';
    const isDikembalikan = l.status === 'Selesai' || l.status === 'Dikembalikan';
    const matchStatus =
      filterStatus === 'Semua' ||
      (filterStatus === 'Dipinjam' && isDipinjam) ||
      (filterStatus === 'Dikembalikan' && isDikembalikan) ||
      l.status === filterStatus;

    const itemName = l.itemNama || l.assetNama || '';
    const kode = l.kodePinjam || l.nomorPeminjaman || '';
    const matchSearch =
      itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.peminjamNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.keperluan && l.keperluan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Peminjaman Alat & Ruangan Praktik
            </h2>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              {loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Aktif').length} Sedang Dipinjam
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan sirkulasi peminjaman alat bengkel, proyektor lab, dan pemakaian ruangan praktikum SMKN 6 Dumai.
          </p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Form Peminjaman Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari kode pinjam, barang, peminjam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'Dipinjam', 'Dikembalikan', 'Terlambat'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
                <th className="py-3 px-4">Kode Pinjam</th>
                <th className="py-3 px-4">Item & Tipe</th>
                <th className="py-3 px-4">Peminjam</th>
                <th className="py-3 px-4">Tgl Pinjam & Rencana Kembali</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi peminjaman sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Kode */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                      {loan.kodePinjam || loan.nomorPeminjaman}
                    </td>

                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{loan.itemNama || loan.assetNama}</div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                        {loan.tipe || 'Barang'}: {loan.jumlah} {loan.satuan || 'Unit'}
                      </span>
                    </td>

                    {/* Peminjam */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{loan.peminjamNama}</div>
                      <div className="text-[10px] text-slate-500">{loan.peminjamRole}</div>
                      {loan.peminjamKontak && (
                        <div className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{loan.peminjamKontak}</span>
                        </div>
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>Pinjam: {loan.tanggalPinjam}</div>
                      <div className="text-[11px] text-slate-400">Kembali: {loan.rencanaKembali}</div>
                      {(loan.realisasiKembali || loan.tanggalKembali) && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Telah kembali: {loan.realisasiKembali || loan.tanggalKembali}
                        </div>
                      )}
                    </td>

                    {/* Keperluan */}
                    <td className="py-3 px-4 max-w-[200px] text-slate-600">
                      <span className="line-clamp-2">{loan.keperluan}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          loan.status === 'Dipinjam' || loan.status === 'Aktif'
                            ? 'bg-purple-100 text-purple-800'
                            : loan.status === 'Dikembalikan' || loan.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Tombol Cetak Bukti Digital */}
                        <button
                          type="button"
                          onClick={() => handleOpenSlip(loan)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                          title="Cetak Bukti Digital Peminjaman"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Tombol Edit Transaksi Peminjaman */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loan)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                          title="Edit Data Peminjam & Peminjaman"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Tombol Pengembalian */}
                        {isFullAccess && (loan.status === 'Dipinjam' || loan.status === 'Aktif') && (
                          <button
                            type="button"
                            onClick={() => {
                              setReturningLoan(loan);
                              setKondisiKembaliVal('Baik');
                              setCatatanKembaliVal('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                          >
                            Pengembalian
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

      {/* FORM MODAL PINJAM BARU / EDIT PEMINJAMAN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base">
                    {editingLoan ? 'Edit Formulir Peminjaman Sarpras' : 'Formulir Peminjaman Sarpras Baru'}
                  </h3>
                  {editingLoan && (
                    <span className="font-mono text-xs text-blue-300">
                      {editingLoan.kodePinjam || editingLoan.nomorPeminjaman}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingLoan(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* EDITABLE IDENTITAS PEMINJAM */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Identitas Peminjam (Bisa Diedit)</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    Dapat Disesuaikan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Peminjam <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso, S.Pd. / Ahmad (Siswa)"
                      value={formData.peminjamNama}
                      onChange={(e) => setFormData({ ...formData, peminjamNama: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Peran / Jabatan / Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Guru Produktif Listrik / Siswa XII TITL 1"
                      value={formData.peminjamRole}
                      onChange={(e) => setFormData({ ...formData, peminjamRole: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kontak / No. Telepon / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Contoh: 0812-7654-3210"
                      value={formData.peminjamKontak}
                      onChange={(e) => setFormData({ ...formData, peminjamKontak: e.target.value })}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-medium text-slate-900"
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
                        peminjamNama: currentUser.name,
                        peminjamRole: currentUser.jabatan,
                        peminjamKontak: currentUser.phone || formData.peminjamKontak,
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
                        peminjamNama: 'Ahmad Fauzi',
                        peminjamRole: 'Siswa XII TITL 1 (Praktikan)',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Siswa Praktikan TITL
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peminjamNama: 'Dewi Lestari',
                        peminjamRole: 'Siswa XII TKI 2 (Praktikan)',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Siswa Praktikan TKI
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peminjamNama: 'Dedi Kurniawan, S.Pd.',
                        peminjamRole: 'Guru Produktif Ketenagalistrikan',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Guru Produktif Listrik
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peminjamNama: 'Rina Marlina, S.Si.',
                        peminjamRole: 'Guru Produktif Teknik Kimia',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Guru Produktif Kimia
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        peminjamNama: 'Hasan Basri',
                        peminjamRole: 'Toolman / Teknisi Bengkel',
                      })
                    }
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Toolman / Teknisi
                  </button>
                </div>
              </div>

              {/* Toggle Barang vs Ruangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Objek Peminjaman
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('Barang')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.tipe === 'Barang'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Alat / Barang Praktik
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('Ruangan')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.tipe === 'Ruangan'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Ruangan / Lab / Bengkel
                  </button>
                </div>
              </div>

              {/* Item Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.tipe === 'Barang' ? 'Pilih Alat / Barang' : 'Pilih Ruangan'}
                </label>
                <select
                  value={formData.itemId}
                  onChange={handleItemSelect}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium"
                >
                  {formData.tipe === 'Barang'
                    ? assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          [{a.kode}] {a.nama} ({a.ruanganNama})
                        </option>
                      ))
                    : rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.namaRuang} - Kapasitas {r.kapasitas} orang
                        </option>
                      ))}
                </select>
              </div>

              {/* Jumlah & Satuan untuk Barang */}
              {formData.tipe === 'Barang' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jumlah Dipinjam <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      placeholder="Unit / Set / Pcs"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalPinjam}
                    onChange={(e) => setFormData({ ...formData, tanggalPinjam: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana Kembali</label>
                  <input
                    type="date"
                    required
                    value={formData.rencanaKembali}
                    onChange={(e) => setFormData({ ...formData, rencanaKembali: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan / Mata Pelajaran / Kegiatan
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Praktikum perakitan instalasi tenaga listrik / Praktikum titrasi kimia..."
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingLoan(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingLoan ? 'Simpan Perubahan Peminjaman' : 'Proses Peminjaman'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUKTI DIGITAL PEMINJAMAN / SURAT BEBAS TANGGUNGAN SLIP */}
      {selectedLoanForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in my-auto">
            {/* Toolbar Header (Hidden on Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Bukti Peminjaman & Bebas Tanggungan Sarpras</h3>
                  <span className="font-mono text-[11px] text-blue-300">
                    {selectedLoanForSlip.kodePinjam || selectedLoanForSlip.nomorPeminjaman}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSlipChanges}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Simpan Perubahan Peminjam & Peran"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLoanForSlip(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Toast if Saved (Hidden in Print) */}
            {slipSavedToast && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2 font-medium no-print animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Perubahan Nama Peminjam & Peran berhasil disimpan!</span>
              </div>
            )}

            {/* Banner info bantuan editing (Hidden in Print) */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between no-print">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Edit Peminjam:</strong> Nama, peran, dan kontak dapat diubah langsung di bawah sebelum dicetak.
                </span>
              </div>
              <button
                onClick={handleSaveSlipChanges}
                className="underline font-bold text-amber-800 hover:text-amber-950 text-[10px] shrink-0 ml-2 cursor-pointer"
              >
                Klik Simpan
              </button>
            </div>

            {/* Printable Slip Area */}
            <div className="p-6 space-y-4 text-xs text-slate-800" id="printable-loan-slip">
              {/* Kop Surat Resmi Pemprov Riau - SMKN 6 Dumai */}
              <KopSurat size="sm" className="mb-3" />

              {/* Judul Surat Bukti Peminjaman */}
              <div className="text-center my-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 underline decoration-2">
                  SURAT BUKTI PEMINJAMAN SARANA & PRASARANA
                </h4>
                <p className="text-xs font-mono font-bold text-blue-800 mt-1">
                  Nomor Registrasi: {selectedLoanForSlip.kodePinjam || selectedLoanForSlip.nomorPeminjaman}
                </p>
              </div>

              {/* Data Table */}
              <div className="space-y-2.5 py-1">
                {/* Nama Peminjam (Editable) */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    Nama Peminjam:
                  </span>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={slipPeminjamNama}
                      onChange={(e) => setSlipPeminjamNama(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold text-slate-900 bg-blue-50/40 rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-1 focus:ring-blue-600 outline-none print:border-none print:p-0 print:bg-transparent"
                      title="Klik untuk mengubah nama peminjam"
                    />
                  </div>
                </div>

                {/* Peran / Jabatan (Editable) */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-slate-500 font-semibold">Jabatan / Peran:</span>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={slipPeminjamRole}
                      onChange={(e) => setSlipPeminjamRole(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-semibold text-slate-800 bg-blue-50/40 rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-1 focus:ring-blue-600 outline-none print:border-none print:p-0 print:bg-transparent"
                      title="Klik untuk mengubah jabatan/peran peminjam"
                    />
                  </div>
                </div>

                {/* Kontak Peminjam (Editable) */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-slate-500 font-semibold">No. Kontak / WA:</span>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={slipPeminjamKontak}
                      onChange={(e) => setSlipPeminjamKontak(e.target.value)}
                      placeholder="08xx-xxxx-xxxx"
                      className="w-full px-2 py-1 text-xs text-slate-800 bg-blue-50/40 rounded-lg border border-slate-300 hover:border-blue-400 focus:ring-1 focus:ring-blue-600 outline-none print:border-none print:p-0 print:bg-transparent font-mono"
                      title="Klik untuk mengubah no kontak peminjam"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Barang/Ruangan:</span>
                  <span className="col-span-2 font-bold text-blue-900">
                    {selectedLoanForSlip.itemNama || selectedLoanForSlip.assetNama} ({selectedLoanForSlip.jumlah}{' '}
                    {selectedLoanForSlip.satuan || 'Unit'})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Tanggal Pinjam:</span>
                  <span className="col-span-2">{selectedLoanForSlip.tanggalPinjam}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Batas Kembali:</span>
                  <span className="col-span-2 font-semibold text-rose-700">
                    {selectedLoanForSlip.rencanaKembali}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Keperluan:</span>
                  <span className="col-span-2 italic">"{selectedLoanForSlip.keperluan}"</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Status Saat Ini:</span>
                  <span className="col-span-2 font-bold text-emerald-700">
                    {selectedLoanForSlip.status}
                  </span>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-6 text-center text-[10px]">
                <div>
                  <p>Peminjam,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-slate-300 italic text-[9px]">[Tanda Tangan]</span>
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {slipPeminjamNama || selectedLoanForSlip.peminjamNama}
                  </p>
                  <p className="text-[9px] text-slate-600">
                    {slipPeminjamRole || selectedLoanForSlip.peminjamRole}
                  </p>
                </div>
                <div>
                  <p>Petugas Sarpras SMKN 6,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-slate-300 italic text-[9px]">[Tanda Tangan & Cap]</span>
                  </div>
                  <p className="font-bold underline text-slate-900">Bambang Trianto, S.T., M.Kom.</p>
                  <p className="text-[9px] text-slate-600">Waka Sarana & Prasarana</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer (Hidden in Print) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 no-print">
              <span className="text-[11px] text-slate-500">
                Tekan <strong>Simpan</strong> untuk memperbarui data peminjam di aplikasi.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForSlip(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlipChanges}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Lembar Bukti</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROSES PENGEMBALIAN */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Konfirmasi Pengembalian Barang</h3>
              <button
                type="button"
                onClick={() => setReturningLoan(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p>
                  <strong>Item:</strong> {returningLoan.itemNama}
                </p>
                <p>
                  <strong>Peminjam:</strong> {returningLoan.peminjamNama} ({returningLoan.peminjamRole})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kondisi Fisik Saat Dikembalikan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKondisiKembaliVal('Baik')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      kondisiKembaliVal === 'Baik'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Lengkap & Berfungsi Baik
                  </button>
                  <button
                    type="button"
                    onClick={() => setKondisiKembaliVal('Ada Kerusakan')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      kondisiKembaliVal === 'Ada Kerusakan'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Ada Kerusakan / Cacat
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pengembalian
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan kebersihan, kelengkapan kabel, atau kondisi akhir..."
                  value={catatanKembaliVal}
                  onChange={(e) => setCatatanKembaliVal(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturningLoan(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
                >
                  Selesaikan Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
