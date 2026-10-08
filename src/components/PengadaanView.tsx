import React, { useState } from 'react';
import { VendorItem, ProcurementOrder, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { KopSurat } from './KopSurat';
import {
  Truck,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileCheck,
  CheckCircle2,
  Clock,
  X,
  Layers,
  Printer,
  FileText,
} from 'lucide-react';

interface PengadaanViewProps {
  vendors: VendorItem[];
  orders: ProcurementOrder[];
  userRole: UserRole;
  onAddVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  onAddOrder: (order: Omit<ProcurementOrder, 'id' | 'nomorSPK'>) => void;
  onUpdateOrderStatus: (
    orderId: string,
    status: 'Perencanaan' | 'SPK Terbit' | 'Pengiriman' | 'Selesai BAST'
  ) => void;
}

export const PengadaanView: React.FC<PengadaanViewProps> = ({
  vendors,
  orders,
  userRole,
  onAddVendor,
  onAddOrder,
  onUpdateOrderStatus,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'vendors'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ProcurementOrder | null>(null);

  // Form Order State
  const [orderForm, setOrderForm] = useState({
    judulPengadaan: '',
    vendorId: vendors[0]?.id || '',
    vendorNama: vendors[0]?.namaCV || '',
    sumberDana: 'BOS Kinerja',
    totalNilai: 15000000,
    tanggalSPK: new Date().toISOString().slice(0, 10),
    estimasiSelesai: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'SPK Terbit' as 'Perencanaan' | 'SPK Terbit' | 'Pengiriman' | 'Selesai BAST',
    catatan: '',
  });

  // Form Vendor State
  const [vendorForm, setVendorForm] = useState({
    namaCV: '',
    kategori: 'Peralatan Bengkel & Mesin',
    kontakPIC: '',
    telepon: '',
    email: '',
    alamat: 'Kota Dumai, Riau',
    rating: 5,
  });

  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    const v = vendors.find((item) => item.id === vId);
    if (v) {
      setOrderForm({
        ...orderForm,
        vendorId: v.id,
        vendorNama: v.namaCV,
      });
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder(orderForm);
    setIsOrderModalOpen(false);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVendor(vendorForm);
    setIsVendorModalOpen(false);
  };

  const filteredOrders = orders.filter((o) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (o.judulPengadaan || '').toLowerCase().includes(q) ||
      (o.nomorSPK || '').toLowerCase().includes(q) ||
      (o.vendorNama || '').toLowerCase().includes(q)
    );
  });

  const filteredVendors = vendors.filter((v) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (v.namaCV || '').toLowerCase().includes(q) ||
      (v.kategori || '').toLowerCase().includes(q) ||
      (v.kontakPIC || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengadaan Barang & Vendor Rekanan
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {orders.length} Paket Pengadaan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen Surat Perintah Kerja (SPK), riwayat vendor supplier rekanan, dan pelacakan BAST penerimaan.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'orders'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar SPK & Pesanan
            </button>
            <button
              onClick={() => setActiveSubTab('vendors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'vendors'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Database Vendor ({vendors.length})
            </button>
          </div>

          {isFullAccess && (
            <button
              onClick={() => {
                if (activeSubTab === 'orders') setIsOrderModalOpen(true);
                else setIsVendorModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeSubTab === 'orders' ? 'Buat SPK Baru' : 'Tambah Vendor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: ORDERS / SPK */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari SPK, pengadaan, vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">No. SPK & Tanggal</th>
                    <th className="py-3 px-4">Paket Pekerjaan / Pengadaan</th>
                    <th className="py-3 px-4">Vendor Pelaksana</th>
                    <th className="py-3 px-4">Sumber Dana</th>
                    <th className="py-3 px-4">Nilai Kontrak (Rp)</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4 text-center">Cetak SPK</th>
                    {isFullAccess && <th className="py-3 px-4 text-right">Ubah Status</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada paket pengadaan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-700 text-xs block">
                            {ord.nomorSPK}
                          </span>
                          <span className="text-[10px] text-slate-400">{ord.tanggalSPK}</span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900 max-w-[240px]">
                          <div>{ord.judulPengadaan}</div>
                          {ord.catatan && (
                            <p className="text-[11px] font-normal text-slate-500 italic mt-0.5 line-clamp-1">
                              "{ord.catatan}"
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ord.vendorNama}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {ord.sumberDana}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          Rp {ord.totalNilai.toLocaleString('id-ID')}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.status === 'Selesai BAST'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Pengiriman'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedOrderForPrint(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Pratinjau & Cetak Surat Perintah Kerja (SPK)"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Surat SPK</span>
                          </button>
                        </td>

                        {isFullAccess && (
                          <td className="py-3 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(
                                  ord.id,
                                  e.target.value as any
                                )
                              }
                              className="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
                            >
                              <option value="Perencanaan">Perencanaan</option>
                              <option value="SPK Terbit">SPK Terbit</option>
                              <option value="Pengiriman">Pengiriman</option>
                              <option value="Selesai BAST">Selesai BAST</option>
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
        </div>
      )}

      {/* SUBTAB 2: VENDORS */}
      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    {vendor.kategori}
                  </span>
                  <span className="text-amber-500 font-bold text-xs">★ {vendor.rating}.0</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{vendor.namaCV}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">PIC: {vendor.kontakPIC}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vendor.telepon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{vendor.alamat}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Rekanan Resmi SMKN 6</span>
                <span className="font-semibold text-emerald-600">Terverifikasi</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL SPK BARU */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Terbitkan SPK Pengadaan Baru</h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Paket Pengadaan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengadaan Modul PLC Ketenagalistrikan & Alat Kimia"
                  value={orderForm.judulPengadaan}
                  onChange={(e) => setOrderForm({ ...orderForm, judulPengadaan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor Rekanan
                  </label>
                  <select
                    value={orderForm.vendorId}
                    onChange={handleVendorSelect}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.namaCV}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sumber Anggaran
                  </label>
                  <select
                    value={orderForm.sumberDana}
                    onChange={(e) => setOrderForm({ ...orderForm, sumberDana: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="BOS Kinerja">BOS Kinerja</option>
                    <option value="BOS Reguler">BOS Reguler</option>
                    <option value="DAK Fisik">DAK Fisik</option>
                    <option value="BPOPP">BPOPP</option>
                    <option value="Komite/Hibah">Komite / Hibah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Nilai Kontrak (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={orderForm.totalNilai}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, totalNilai: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit SPK
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.tanggalSPK}
                    onChange={(e) => setOrderForm({ ...orderForm, tanggalSPK: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Spesifikasi Pengadaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail barang pesanan, waktu batas pengiriman, atau garansi..."
                  value={orderForm.catatan}
                  onChange={(e) => setOrderForm({ ...orderForm, catatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Terbitkan SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL VENDOR BARU */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Vendor Rekanan Baru</h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / CV / PT
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CV. Riau Karya Mandiri"
                  value={vendorForm.namaCV}
                  onChange={(e) => setVendorForm({ ...vendorForm, namaCV: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pengadaan
                  </label>
                  <select
                    value={vendorForm.kategori}
                    onChange={(e) => setVendorForm({ ...vendorForm, kategori: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Peralatan Bengkel & Mesin">Peralatan Bengkel & Mesin</option>
                    <option value="Komputer & Jaringan">Komputer & Jaringan</option>
                    <option value="Mebel & Interior">Mebel & Interior</option>
                    <option value="Bahan Praktik & Otomotif">Bahan Praktik & Otomotif</option>
                    <option value="Alat Listrik & Las">Alat Listrik & Las</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kontak PIC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Sales / Direktur"
                    value={vendorForm.kontakPIC}
                    onChange={(e) => setVendorForm({ ...vendorForm, kontakPIC: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={vendorForm.telepon}
                    onChange={(e) => setVendorForm({ ...vendorForm, telepon: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Kantor</label>
                  <input
                    type="email"
                    required
                    placeholder="info@vendor.com"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Kantor / Workshop</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat lengkap vendor di Kota Dumai / Pekanbaru..."
                  value={vendorForm.alamat}
                  onChange={(e) => setVendorForm({ ...vendorForm, alamat: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Daftarkan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL CETAK SPK RESMI DENGAN KOP SURAT */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in">
            {/* Top Bar (Hidden in Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Cetak Surat Perintah Kerja (SPK)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedOrderForPrint.nomorSPK} &bull; {selectedOrderForPrint.vendorNama}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak SPK Sekarang</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
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

              {/* JUDUL SPK */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-black uppercase text-black underline decoration-2 underline-offset-4">
                  SURAT PERINTAH KERJA (SPK)
                </h2>
                <p className="text-xs font-bold text-black mt-1 font-mono">
                  Nomor : {selectedOrderForPrint.nomorSPK}
                </p>
              </div>

              {/* ISI SPK */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed mt-5">
                <p>
                  Yang bertanda tangan di bawah ini, Pejabat Pengadaan / Kuasa Pengguna Anggaran Sarana dan Prasarana{' '}
                  <strong>SMK Negeri 6 Dumai</strong>, dengan ini memberikan perintah kerja pengadaan barang/jasa kepada:
                </p>

                {(() => {
                  const vendorDetail = vendors.find((v) => v.id === selectedOrderForPrint.vendorId);
                  return (
                    <div className="border border-black p-4 space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold text-slate-700">Nama Rekanan / Penyedia</span>
                        <span className="col-span-2 font-bold text-black">
                          {selectedOrderForPrint.vendorNama}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold text-slate-700">Pimpinan / PIC</span>
                        <span className="col-span-2 text-black">
                          {vendorDetail?.kontakPIC || 'Pimpinan Perusahaan'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold text-slate-700">Nomor Telepon / Kontak</span>
                        <span className="col-span-2 font-mono text-black">
                          {vendorDetail?.telepon || '-'} {vendorDetail?.email ? `(${vendorDetail.email})` : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-bold text-slate-700">Alamat Perusahaan</span>
                        <span className="col-span-2 text-black">
                          {vendorDetail?.alamat || 'Kota Dumai, Provinsi Riau'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <p>Untuk melaksanakan pekerjaan pengadaan sarana dan prasarana dengan rincian klausul sebagai berikut:</p>

                <div className="border border-black p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Paket Pengadaan</span>
                    <span className="col-span-2 font-bold text-black">
                      {selectedOrderForPrint.judulPengadaan}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Sumber Dana</span>
                    <span className="col-span-2 font-bold text-blue-900">
                      {selectedOrderForPrint.sumberDana}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Total Nilai Kontrak</span>
                    <span className="col-span-2 font-mono font-bold text-black text-sm">
                      Rp {selectedOrderForPrint.totalNilai.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Tanggal Terbit SPK</span>
                    <span className="col-span-2 font-mono text-black">
                      {selectedOrderForPrint.tanggalSPK}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Catatan & Ketentuan Teknis</span>
                    <span className="col-span-2 text-black italic">
                      {selectedOrderForPrint.catatan ||
                        'Barang harus dalam kondisi 100% baru, bergaransi resmi, serta memenuhi standar spesifikasi teknis sekolah.'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold">Ketentuan Tambahan:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-800">
                    <li>Penyedia sanggup menyelesaikan pengiriman dan instalasi tepat waktu.</li>
                    <li>
                      Pemeriksaan kelayakan dan uji fungsi dilakukan bersama Tim Sarpras SMK Negeri 6 Dumai.
                    </li>
                    <li>
                      Pembayaran akan direalisasikan setelah Berita Acara Serah Terima (BAST) disahkan.
                    </li>
                  </ol>
                </div>

                {/* TANDA TANGAN RESMI */}
                {(() => {
                  const sp = StorageService.getSchoolProfile();
                  return (
                    <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                      <div className="space-y-16">
                        <div>
                          <p>Untuk dan atas nama Penyedia / Rekanan,</p>
                          <p className="font-bold">{selectedOrderForPrint.vendorNama}</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">...........................................</p>
                          <p className="text-[11px] text-slate-600">Direktur / Pimpinan Cabang</p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <div>
                          <p>Dumai, {selectedOrderForPrint.tanggalSPK}</p>
                          <p className="font-bold">Pejabat Pembuat Komitmen / Waka Sarpras,</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">
                            {sp.wakaSarpras || 'Bambang Trianto, S.T., M.Kom.'}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            NIP. {sp.nipWakaSarpras || '19790815 200801 1 012'}
                          </p>
                        </div>
                      </div>

                      {/* Mengetahui Kepala Sekolah (Center Bottom) */}
                      <div className="col-span-2 pt-6 space-y-16">
                        <div>
                          <p>Mengetahui & Menyetujui,</p>
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
                Dokumen SPK resmi dengan Kop Surat Pemerintah Provinsi Riau & SMKN 6 Dumai.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat SPK</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
