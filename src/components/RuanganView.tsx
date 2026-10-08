import React, { useState } from 'react';
import { RoomItem, AssetItem, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { KopSurat } from './KopSurat';
import {
  Building2,
  Plus,
  Search,
  UserCheck,
  Users,
  Maximize2,
  Package,
  Layers,
  X,
  Edit2,
  CheckCircle2,
  Printer,
  FileText,
} from 'lucide-react';

interface RuanganViewProps {
  rooms: RoomItem[];
  assets: AssetItem[];
  userRole: UserRole;
  onAddRoom: (room: Omit<RoomItem, 'id'>) => void;
  onUpdateRoom: (room: RoomItem) => void;
  onSelectAssetForQR: (asset: AssetItem) => void;
}

export const RuanganView: React.FC<RuanganViewProps> = ({
  rooms,
  assets,
  userRole,
  onAddRoom,
  onUpdateRoom,
  onSelectAssetForQR,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('Semua');

  // Selected Room for detail modal (to see all assets inside)
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [isPrintingKIR, setIsPrintingKIR] = useState(false);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [formData, setFormData] = useState({
    namaRuang: '',
    kodeRuang: '',
    jurusan: 'Teknik Ketenagalistrikan',
    penanggungJawab: '',
    nipPJ: '',
    kapasitas: 32,
    luasMeter: 72,
    kondisi: 'Baik' as 'Baik' | 'Rusak Ringan' | 'Perlu Renovasi',
    keterangan: '',
    fotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      namaRuang: '',
      kodeRuang: `RNG-SMK6-${String(rooms.length + 1).padStart(2, '0')}`,
      jurusan: 'Teknik Ketenagalistrikan',
      penanggungJawab: '',
      nipPJ: '',
      kapasitas: 32,
      luasMeter: 72,
      kondisi: 'Baik',
      keterangan: '',
      fotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: RoomItem) => {
    setEditingRoom(r);
    setFormData({
      namaRuang: r.namaRuang,
      kodeRuang: r.kodeRuang,
      jurusan: r.jurusan,
      penanggungJawab: r.penanggungJawab,
      nipPJ: r.nipPJ || '',
      kapasitas: r.kapasitas,
      luasMeter: r.luasMeter || 72,
      kondisi: (r.kondisi as any) || 'Baik',
      keterangan: r.keterangan || '',
      fotoUrl: r.fotoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      onUpdateRoom({
        ...editingRoom,
        ...formData,
      });
    } else {
      onAddRoom({
        ...formData,
        kategori: 'Bengkel Kejuruan',
        kontakPJ: '0812-3456-7890',
        kondisiRuang: 'Baik',
      });
    }
    setIsModalOpen(false);
  };

  const filteredRooms = rooms.filter((r) => {
    const matchJurusan = filterJurusan === 'Semua' || r.jurusan === filterJurusan;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (r.namaRuang || '').toLowerCase().includes(q) ||
      (r.kodeRuang || '').toLowerCase().includes(q) ||
      (r.penanggungJawab || '').toLowerCase().includes(q);
    return matchJurusan && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Ruangan, Lab & Bengkel Kejuruan
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {rooms.length} Ruangan Terdata
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar denah fasilitas, kapasitas ruangan, Kepala Bengkel / Toolman, dan rincian inventaris per ruangan.
          </p>
        </div>

        {isFullAccess && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruangan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama ruangan, PJ, kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'Teknik Ketenagalistrikan', 'Teknik Kimia', 'Umum', 'Kantor'].map((jur) => (
            <button
              key={jur}
              onClick={() => setFilterJurusan(jur)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterJurusan === jur
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {jur}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const roomAssets = assets.filter((a) => a.ruanganId === room.id);
          const totalUnit = roomAssets.reduce((sum, a) => sum + a.jumlah, 0);

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-blue-400 transition-all group"
            >
              {/* Room Image Banner */}
              <div className="h-40 relative bg-slate-900 overflow-hidden">
                <img
                  src={room.fotoUrl}
                  alt={room.namaRuang}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {room.kodeRuang}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      room.kondisi === 'Baik'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {room.kondisi}
                  </span>
                  {isFullAccess && (
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="p-1 bg-white/80 hover:bg-white text-slate-800 rounded-lg backdrop-blur-xs transition-colors"
                      title="Edit Ruangan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold block">
                    {room.jurusan}
                  </span>
                  <h3 className="font-bold text-base leading-tight truncate">{room.namaRuang}</h3>
                </div>
              </div>

              {/* Room Body Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Penanggung Jawab:</span>
                    </span>
                    <span className="font-bold text-slate-900">{room.penanggungJawab}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block">Kapasitas:</span>
                      <span className="font-bold text-slate-800">{room.kapasitas} Siswa / Orang</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block">Luas Ruangan:</span>
                      <span className="font-bold text-slate-800">{room.luasMeter} m²</span>
                    </div>
                  </div>

                  {room.keterangan && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      "{room.keterangan}"
                    </p>
                  )}
                </div>

                {/* Bottom Action: View Assets */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold">{roomAssets.length} Jenis Aset</span>
                    <span className="text-slate-400">({totalUnit} Unit)</span>
                  </div>

                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Inventaris</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL RUANGAN & INVENTARIS MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-300">{selectedRoom.kodeRuang}</span>
                <h3 className="font-bold text-base">{selectedRoom.namaRuang}</h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Header Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Penanggung Jawab</span>
                  <span className="font-bold text-slate-900">{selectedRoom.penanggungJawab}</span>
                  <span className="text-[10px] text-slate-400 block">{selectedRoom.nipPJ}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jurusan</span>
                  <span className="font-bold text-slate-900">{selectedRoom.jurusan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kapasitas & Luas</span>
                  <span className="font-bold text-slate-900">
                    {selectedRoom.kapasitas} orang ({selectedRoom.luasMeter} m²)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kondisi Fisik</span>
                  <span className="font-bold text-emerald-700">{selectedRoom.kondisi}</span>
                </div>
              </div>

              {/* Assets list in this room */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                  <span>Daftar Aset & Peralatan di Ruangan Ini:</span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {assets.filter((a) => a.ruanganId === selectedRoom.id).length} Barang Terpasang
                  </span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Barang</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Jumlah</th>
                        <th className="py-2.5 px-3">Kondisi</th>
                        <th className="py-2.5 px-3 text-right">QR Label</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assets.filter((a) => a.ruanganId === selectedRoom.id).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            Belum ada aset terdaftar di ruangan ini.
                          </td>
                        </tr>
                      ) : (
                        assets
                          .filter((a) => a.ruanganId === selectedRoom.id)
                          .map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">{a.kode}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{a.nama}</td>
                              <td className="py-2.5 px-3 text-slate-600">{a.kategori}</td>
                              <td className="py-2.5 px-3 text-center font-bold">
                                {a.jumlah} {a.satuan}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    a.kondisi === 'Baik'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {a.kondisi}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedRoom(null);
                                    onSelectAssetForQR(a);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                >
                                  Cetak Label
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsPrintingKIR(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Inventaris Ruangan (KIR)</span>
              </button>

              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT RESMI KARTU INVENTARIS RUANGAN (KIR) DENGAN KOP SURAT */}
      {isPrintingKIR && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in">
            {/* Top Bar (Hidden in Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Cetak KIR Resmi</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedRoom.namaRuang} &bull; Kode: {selectedRoom.kodeRuang}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak KIR Sekarang</span>
                </button>
                <button
                  onClick={() => setIsPrintingKIR(false)}
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

              {/* JUDUL LEMBAR KIR */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-black uppercase text-black underline decoration-2 underline-offset-4">
                  KARTU INVENTARIS RUANGAN (KIR)
                </h2>
                <p className="text-xs font-bold text-black mt-1 font-mono">
                  Kode Ruangan: {selectedRoom.kodeRuang} &bull; Tahun Ajaran 2024/2025
                </p>
              </div>

              {/* METADATA RUANGAN */}
              <div className="border border-black p-3 my-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-600 block">Nama Ruang/Bengkel:</span>
                  <span className="font-bold text-black">{selectedRoom.namaRuang}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Kategori Ruangan:</span>
                  <span className="font-bold text-black">{selectedRoom.kategori || 'Bengkel / Lab'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Jurusan / Program:</span>
                  <span className="font-bold text-black">{selectedRoom.jurusan}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Penanggung Jawab:</span>
                  <span className="font-bold text-black">{selectedRoom.penanggungJawab}</span>
                </div>
              </div>

              {/* TABEL ASET DALAM RUANGAN */}
              <table className="w-full border-collapse border border-black text-xs text-left my-4">
                <thead>
                  <tr className="bg-slate-100 text-black font-bold">
                    <th className="border border-black p-2 text-center w-10">No</th>
                    <th className="border border-black p-2">Kode Barang</th>
                    <th className="border border-black p-2">Nama Barang & Spesifikasi</th>
                    <th className="border border-black p-2 text-center">Jumlah</th>
                    <th className="border border-black p-2 text-center">Kondisi</th>
                    <th className="border border-black p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter((a) => a.ruanganId === selectedRoom.id).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-black p-4 text-center text-slate-500 italic">
                        Tidak ada barang / peralatan yang terdaftar di ruangan ini.
                      </td>
                    </tr>
                  ) : (
                    assets
                      .filter((a) => a.ruanganId === selectedRoom.id)
                      .map((a, idx) => (
                        <tr key={a.id}>
                          <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black p-2 font-mono font-bold">{a.kode}</td>
                          <td className="border border-black p-2">
                            <span className="font-bold">{a.nama}</span>
                            {a.spesifikasi && <span className="text-slate-600 block text-[11px]">{a.spesifikasi}</span>}
                          </td>
                          <td className="border border-black p-2 text-center font-bold">
                            {a.jumlah} {a.satuan}
                          </td>
                          <td className="border border-black p-2 text-center">{a.kondisi}</td>
                          <td className="border border-black p-2 text-center">{a.status}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              {/* TANDA TANGAN RESMI */}
              {(() => {
                const sp = StorageService.getSchoolProfile();
                return (
                  <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                    <div className="space-y-16">
                      <div>
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala SMK Negeri 6 Dumai</p>
                      </div>
                      <div>
                        <p className="font-bold underline text-sm">{sp.kepalaSekolah || 'Drs. H. Syahrul, M.Pd.'}</p>
                        <p className="text-[11px] text-slate-600">NIP. {sp.nipKepalaSekolah || '19680512 199403 1 005'}</p>
                      </div>
                    </div>

                    <div className="space-y-16">
                      <div>
                        <p>Dumai, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                        <p className="font-bold">Penanggung Jawab Ruangan,</p>
                      </div>
                      <div>
                        <p className="font-bold underline text-sm">{selectedRoom.penanggungJawab}</p>
                        <p className="text-[11px] text-slate-600">Guru / Ka. Bengkel / Laboran</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer (Hidden in Print) */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                KIR siap dicetak dan dilaminasi untuk ditempel di pintu / dinding ruangan.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintingKIR(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak KIR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL TAMBAH/EDIT RUANGAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingRoom ? 'Edit Data Ruangan / Bengkel' : 'Tambah Ruangan / Bengkel Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Ruangan</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeRuang}
                    onChange={(e) => setFormData({ ...formData, kodeRuang: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
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
                    <option value="Umum">Umum</option>
                    <option value="Kantor">Kantor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ruangan / Bengkel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bengkel Instalasi Tenaga Listrik / Lab Kimia Analisis"
                  value={formData.namaRuang}
                  onChange={(e) => setFormData({ ...formData, namaRuang: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penanggung Jawab (PJ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Ka. Bengkel / Toolman"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / NUPTK PJ</label>
                  <input
                    type="text"
                    value={formData.nipPJ}
                    onChange={(e) => setFormData({ ...formData, nipPJ: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 30 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Luas (m²)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.luasMeter}
                    onChange={(e) => setFormData({ ...formData, luasMeter: parseInt(e.target.value) || 72 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi Fisik</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kondisi: e.target.value as 'Baik' | 'Rusak Ringan' | 'Perlu Renovasi',
                      })
                    }
                    className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Perlu Renovasi">Perlu Renovasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Ruangan</label>
                <input
                  type="text"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono text-[11px]"
                />
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
                  {editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
