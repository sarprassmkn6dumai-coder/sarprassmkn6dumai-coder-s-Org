import React, { useState } from 'react';
import { MaintenanceRecord, AssetItem, RoomItem, UserRole } from '../types';
import {
  Wrench,
  Plus,
  Calendar,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface PemeliharaanViewProps {
  records: MaintenanceRecord[];
  assets: AssetItem[];
  rooms: RoomItem[];
  userRole: UserRole;
  onAddRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onUpdateRecordStatus: (id: string, status: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai') => void;
}

export const PemeliharaanView: React.FC<PemeliharaanViewProps> = ({
  records,
  assets,
  rooms,
  userRole,
  onAddRecord,
  onUpdateRecordStatus,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    kodeAset: assets[0]?.kode || '',
    namaAset: assets[0]?.nama || '',
    lokasiRuangan: assets[0]?.ruanganNama || '',
    jadwalTanggal: new Date().toISOString().slice(0, 10),
    jenisPerawatan: 'Servis Rutin Berkala',
    teknisiPIC: 'Teknisi Internal Sarpras',
    biaya: 500000,
    status: 'Terjadwal' as 'Terjadwal' | 'Sedang Berjalan' | 'Selesai',
    catatan: '',
  });

  const totalBiaya = records.reduce((sum, r) => sum + r.biaya, 0);
  const selesaiCount = records.filter((r) => r.status === 'Selesai').length;
  const berjalanCount = records.filter((r) => r.status === 'Sedang Berjalan').length;
  const terjadwalCount = records.filter((r) => r.status === 'Terjadwal').length;

  const handleAssetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kode = e.target.value;
    const item = assets.find((a) => a.kode === kode);
    if (item) {
      setFormData({
        ...formData,
        kodeAset: item.kode,
        namaAset: item.nama,
        lokasiRuangan: item.ruanganNama,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord(formData);
    setIsModalOpen(false);
  };

  const filteredRecords = records.filter((r) => {
    const matchStatus = filterStatus === 'Semua' || r.status === filterStatus;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (r.namaAset || '').toLowerCase().includes(q) ||
      (r.kodeAset || '').toLowerCase().includes(q) ||
      (r.teknisiPIC || '').toLowerCase().includes(q) ||
      (r.jenisPerawatan || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Jadwal & Riwayat Pemeliharaan</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {records.length} Agenda Perawatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen perawatan preventif & servis berkala mesin praktek kejuruan, komputer lab, dan fasilitas sekolah.
          </p>
        </div>

        {isFullAccess && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Pemeliharaan</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Biaya Pemeliharaan</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            Rp {totalBiaya.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400">Akumulasi biaya servis TA 2026</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Jadwal Terencana</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{terjadwalCount} Unit</div>
          <span className="text-[11px] text-amber-600">Menunggu giliran servis berkala</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sedang Dikerjakan</span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">{berjalanCount} Unit</div>
          <span className="text-[11px] text-blue-600">Teknisi sedang proses di lapangan</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Selesai Dikerjakan</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{selesaiCount} Agenda</div>
          <span className="text-[11px] text-emerald-600">Fasilitas siap digunakan kembali</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari aset, teknisi, perawatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'Terjadwal', 'Sedang Berjalan', 'Selesai'].map((st) => (
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

      {/* Maintenance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Aset & Kode</th>
                <th className="py-3 px-4">Lokasi Ruang</th>
                <th className="py-3 px-4">Jenis Perawatan</th>
                <th className="py-3 px-4">Jadwal Tanggal</th>
                <th className="py-3 px-4">Teknisi PIC</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4">Status</th>
                {isFullAccess && <th className="py-3 px-4 text-right">Ubah Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan pemeliharaan sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Aset */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.namaAset}</div>
                      <span className="font-mono text-[10px] text-blue-700 font-semibold">{item.kodeAset}</span>
                      {item.catatan && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">"{item.catatan}"</p>
                      )}
                    </td>

                    {/* Lokasi */}
                    <td className="py-3 px-4 text-slate-600 max-w-[160px]">
                      <span className="line-clamp-2">{item.lokasiRuangan}</span>
                    </td>

                    {/* Jenis Perawatan */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.jenisPerawatan}
                    </td>

                    {/* Jadwal Tanggal */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.jadwalTanggal}</span>
                      </div>
                    </td>

                    {/* Teknisi */}
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {item.teknisiPIC}
                    </td>

                    {/* Biaya */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      Rp {item.biaya.toLocaleString('id-ID')}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Terjadwal'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Sedang Berjalan'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Aksi Ubah Status */}
                    {isFullAccess && (
                      <td className="py-3 px-4 text-right">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            onUpdateRecordStatus(
                              item.id,
                              e.target.value as 'Terjadwal' | 'Sedang Berjalan' | 'Selesai'
                            )
                          }
                          className="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          <option value="Terjadwal">Terjadwal</option>
                          <option value="Sedang Berjalan">Sedang Berjalan</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH JADWAL PEMELIHARAAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Jadwalkan Pemeliharaan Aset</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Aset yang Akan Dirawat
                </label>
                <select
                  value={formData.kodeAset}
                  onChange={handleAssetSelect}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.kode}>
                      [{a.kode}] {a.nama} ({a.ruanganNama})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jadwal Tanggal Servis
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.jadwalTanggal}
                    onChange={(e) => setFormData({ ...formData, jadwalTanggal: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimasi Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.biaya}
                    onChange={(e) => setFormData({ ...formData, biaya: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Perawatan / Servis
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kalibrasi Mesin Las, Servis Rutin Oli Hidrolik..."
                  value={formData.jenisPerawatan}
                  onChange={(e) => setFormData({ ...formData, jenisPerawatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teknisi PIC / Vendor Pelaksana
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama teknisi internal atau nama PT/CV vendor..."
                  value={formData.teknisiPIC}
                  onChange={(e) => setFormData({ ...formData, teknisiPIC: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Instruksi Khusus
                </label>
                <textarea
                  rows={2}
                  placeholder="Bagian yang perlu diperiksa, spesifikasi sparepart pengganti..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
