import React, { useState, useMemo } from 'react';
import {
  AssetItem,
  AssetCondition,
  AssetStatus,
  RoomItem,
  UserRole,
} from '../types';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface InventarisViewProps {
  assets: AssetItem[];
  rooms: RoomItem[];
  userRole: UserRole;
  onAddAsset: (asset: Omit<AssetItem, 'id'>) => void;
  onUpdateAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
  onSelectAssetForQR: (asset: AssetItem) => void;
}

export const InventarisView: React.FC<InventarisViewProps> = ({
  assets,
  rooms,
  userRole,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onSelectAssetForQR,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';

  // Filters and Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterKondisi, setFilterKondisi] = useState('Semua');
  const [filterRuangan, setFilterRuangan] = useState('Semua');
  const [filterJurusan, setFilterJurusan] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: 'Alat Praktek',
    ruanganId: rooms[0]?.id || '',
    jurusan: 'Teknik Ketenagalistrikan',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik' as AssetCondition,
    status: 'Tersedia' as AssetStatus,
    tahunPerolehan: 2026,
    sumberDana: 'BOS Kinerja',
    hargaPerolehan: 0,
    spesifikasi: '',
    keterangan: '',
  });

  const categories = ['Semua', 'Alat Praktek', 'Elektronik', 'Mebel', 'Kendaraan', 'Mesin'];
  const conditions = ['Semua', 'Baik', 'Rusak Ringan', 'Rusak Berat'];
  const jurusans = ['Semua', 'Teknik Ketenagalistrikan', 'Teknik Kimia', 'Umum', 'Kantor'];

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return assets.filter((item) => {
      const matchSearch =
        (item.nama || '').toLowerCase().includes(q) ||
        (item.kode || '').toLowerCase().includes(q) ||
        (item.spesifikasi || '').toLowerCase().includes(q);

      const matchKat = filterKategori === 'Semua' || item.kategori === filterKategori;
      const matchKondisi = filterKondisi === 'Semua' || item.kondisi === filterKondisi;
      const matchRuang = filterRuangan === 'Semua' || item.ruanganId === filterRuangan;
      const matchJurusan = filterJurusan === 'Semua' || item.jurusan === filterJurusan;

      return matchSearch && matchKat && matchKondisi && matchRuang && matchJurusan;
    });
  }, [assets, searchQuery, filterKategori, filterKondisi, filterRuangan, filterJurusan]);

  // Handle open modal for create
  const handleOpenAdd = () => {
    const nextNumber = assets.length + 1;
    const kodeDefault = `AST-SMK6-BRG-${String(nextNumber).padStart(3, '0')}`;
    setEditingAsset(null);
    setFormData({
      kode: kodeDefault,
      nama: '',
      kategori: 'Alat Praktek',
      ruanganId: rooms[0]?.id || '',
      jurusan: 'Teknik Ketenagalistrikan',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      status: 'Tersedia',
      tahunPerolehan: 2026,
      sumberDana: 'BOS Kinerja',
      hargaPerolehan: 0,
      spesifikasi: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (asset: AssetItem) => {
    setEditingAsset(asset);
    setFormData({
      kode: asset.kode,
      nama: asset.nama,
      kategori: asset.kategori,
      ruanganId: asset.ruanganId,
      jurusan: asset.jurusan,
      jumlah: asset.jumlah,
      satuan: asset.satuan,
      kondisi: asset.kondisi,
      status: asset.status,
      tahunPerolehan: asset.tahunPerolehan,
      sumberDana: asset.sumberDana,
      hargaPerolehan: asset.hargaPerolehan,
      spesifikasi: asset.spesifikasi || '',
      keterangan: asset.keterangan || '',
    });
    setIsModalOpen(true);
  };

  // Handle submit form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedRoom = rooms.find((r) => r.id === formData.ruanganId);
    const ruanganNama = matchedRoom ? matchedRoom.namaRuang : 'Gudang Utama Sarpras';

    if (editingAsset) {
      onUpdateAsset({
        ...editingAsset,
        ...formData,
        ruanganNama,
        terakhirDiperiksa: new Date().toISOString().slice(0, 10),
      });
    } else {
      onAddAsset({
        ...formData,
        ruanganNama,
        terakhirDiperiksa: new Date().toISOString().slice(0, 10),
      });
    }
    setIsModalOpen(false);
  };

  // Export to CSV / Excel format
  const exportToCSV = () => {
    const headers = [
      'No',
      'Kode Barang',
      'Nama Barang',
      'Kategori',
      'Ruangan/Lokasi',
      'Jurusan',
      'Jumlah',
      'Satuan',
      'Kondisi',
      'Status',
      'Tahun Perolehan',
      'Sumber Dana',
      'Harga Perolehan (Rp)',
      'Spesifikasi',
    ];

    const rows = filteredAssets.map((item, idx) => [
      idx + 1,
      `"${item.kode}"`,
      `"${item.nama}"`,
      `"${item.kategori}"`,
      `"${item.ruanganNama}"`,
      `"${item.jurusan}"`,
      item.jumlah,
      `"${item.satuan}"`,
      `"${item.kondisi}"`,
      `"${item.status}"`,
      item.tahunPerolehan,
      `"${item.sumberDana}"`,
      item.hargaPerolehan,
      `"${(item.spesifikasi || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventaris_SMKN6_Dumai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Inventaris Sarpras</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {filteredAssets.length} Aset
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar data barang, mesin praktek, alat laboratorium, dan perlengkapan SMKN 6 Dumai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
            title="Export data inventaris ke spreadsheet CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel/CSV</span>
          </button>

          {isFullAccess && (
            <button
              id="btn-tambah-barang"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari kode, nama barang, spesifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Kategori: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kondisi */}
          <div>
            <select
              value={filterKondisi}
              onChange={(e) => setFilterKondisi(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              {conditions.map((c) => (
                <option key={c} value={c}>
                  Kondisi: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jurusan */}
          <div>
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            >
              {jurusans.map((j) => (
                <option key={j} value={j}>
                  Jurusan: {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Ruangan dropdown */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Lokasi Ruang:</span>
          <select
            value={filterRuangan}
            onChange={(e) => setFilterRuangan(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Ruangan & Bengkel</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.namaRuang}
              </option>
            ))}
          </select>
          {(filterKategori !== 'Semua' || filterKondisi !== 'Semua' || filterRuangan !== 'Semua' || filterJurusan !== 'Semua' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterKategori('Semua');
                setFilterKondisi('Semua');
                setFilterRuangan('Semua');
                setFilterJurusan('Semua');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold ml-auto text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Kode & Nama Barang</th>
                <th className="py-3 px-4">Kategori & Jurusan</th>
                <th className="py-3 px-4">Lokasi Ruang</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data barang yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => {
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-medium">{index + 1}</td>

                      {/* Kode & Nama */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{asset.nama}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {asset.kode}
                          </span>
                          <span className="text-[10px] text-slate-400">&bull; Thn {asset.tahunPerolehan}</span>
                        </div>
                        {asset.spesifikasi && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                            {asset.spesifikasi}
                          </p>
                        )}
                      </td>

                      {/* Kategori & Jurusan */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{asset.kategori}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                          {asset.jurusan}
                        </span>
                      </td>

                      {/* Lokasi Ruangan */}
                      <td className="py-3 px-4 text-slate-600 max-w-[180px]">
                        <span className="line-clamp-2">{asset.ruanganNama}</span>
                      </td>

                      {/* Jumlah */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900 text-sm">{asset.jumlah}</span>
                        <span className="text-[11px] text-slate-400 ml-1">{asset.satuan}</span>
                      </td>

                      {/* Kondisi */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            asset.kondisi === 'Baik'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : asset.kondisi === 'Rusak Ringan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {asset.kondisi === 'Baik' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {asset.kondisi !== 'Baik' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          <span>{asset.kondisi}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            asset.status === 'Tersedia'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : asset.status === 'Dipinjam'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Code Action */}
                          <button
                            onClick={() => onSelectAssetForQR(asset)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                            title="Generate & Cetak Stiker QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {isFullAccess && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(asset)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                                title="Edit Data Barang"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmId(asset.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="Hapus Barang"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Aset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {editingAsset ? 'Perbarui Data Aset' : 'Tambah Aset Inventaris Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Barang / Aset</label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Barang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PC Lab Core i7 / Mesin Las TIG"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Barang</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Alat Praktek">Alat Praktek</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Mebel">Mebel</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Mesin">Mesin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jurusan / Bidang</label>
                  <select
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Teknik Ketenagalistrikan">Teknik Ketenagalistrikan</option>
                    <option value="Teknik Kimia">Teknik Kimia</option>
                    <option value="Umum">Umum / Sarana Sekolah</option>
                    <option value="Kantor">Kantor & Tata Usaha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Ruangan / Bengkel</label>
                  <select
                    value={formData.ruanganId}
                    onChange={(e) => setFormData({ ...formData, ruanganId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.namaRuang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                      placeholder="Unit / Set / Pcs"
                      value={formData.satuan}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi Fisik</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as AssetCondition })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Baik">Baik (Berfungsi Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Ketersediaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                    <option value="Dihapuskan">Dihapuskan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Perolehan & Sumber Dana</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={formData.tahunPerolehan}
                      onChange={(e) => setFormData({ ...formData, tahunPerolehan: parseInt(e.target.value) || 2026 })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <select
                      value={formData.sumberDana}
                      onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value })}
                      className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                    >
                      <option value="BOS Kinerja">BOS Kinerja</option>
                      <option value="BOS Reguler">BOS Reguler</option>
                      <option value="DAK Fisik">DAK Fisik</option>
                      <option value="BPOPP">BPOPP</option>
                      <option value="Hibah">Hibah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Perolehan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hargaPerolehan}
                    onChange={(e) => setFormData({ ...formData, hargaPerolehan: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spesifikasi Teknis / Merek</label>
                <textarea
                  rows={2}
                  placeholder="Merek, tipe, kapasitas, serial number, atau deskripsi teknis..."
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  {editingAsset ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">Hapus Data Barang?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Data barang ini akan dihapus dari daftar inventaris SIM-SARPRAS.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteAsset(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
