import React, { useState } from 'react';
import { SarprasDocument, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { KopSurat } from './KopSurat';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Download,
  FolderArchive,
  Eye,
  X,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  Printer,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface DokumenViewProps {
  documents: SarprasDocument[];
  userRole: UserRole;
  onAddDocument: (doc: Omit<SarprasDocument, 'id'>) => void;
}

export const DokumenView: React.FC<DokumenViewProps> = ({
  documents,
  userRole,
  onAddDocument,
}) => {
  const isFullAccess = userRole === 'admin_sarpras' || userRole === 'waka_sarpras';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocForPrint, setSelectedDocForPrint] = useState<SarprasDocument | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    nomorDokumen: '',
    kategori: 'BAST' as 'BAST' | 'SOP' | 'Manual Book' | 'KIR' | 'Surat Tugas' | 'Lainnya',
    tanggalDokumen: new Date().toISOString().slice(0, 10),
    fileUrl: 'https://drive.google.com',
    fileSize: '1.2 MB',
    keterangan: '',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDocument(formData);
    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchCat = filterKategori === 'Semua' || doc.kategori === filterKategori;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (doc.judul || '').toLowerCase().includes(q) ||
      (doc.nomorDokumen || '').toLowerCase().includes(q) ||
      (doc.keterangan || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Dokumen, BAST & Arsip Sarpras
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {documents.length} Dokumen Digital
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyimpanan digital Berita Acara Serah Terima (BAST), SOP Laboratorium & Bengkel, Manual Book Mesin, dan KIR.
          </p>
        </div>

        {isFullAccess && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah / Tambah Dokumen</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nomor, judul dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['Semua', 'BAST', 'SOP', 'Manual Book', 'KIR', 'Surat Tugas'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterKategori(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterKategori === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      doc.kategori === 'BAST'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.kategori === 'SOP'
                        ? 'bg-blue-100 text-blue-800'
                        : doc.kategori === 'Manual Book'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.kategori}
                  </span>
                  <span className="text-[11px] text-slate-400">{doc.tanggalDokumen}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                    {doc.judul}
                  </h3>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">{doc.nomorDokumen}</p>
                </div>

                {doc.keterangan && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {doc.keterangan}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 font-mono text-[11px]">{doc.fileSize}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedDocForPrint(doc)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors cursor-pointer"
                    title="Pratinjau & Cetak Dokumen Resmi dengan Kop Surat"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Cetak Surat</span>
                  </button>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-colors"
                  >
                    <span>Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM MODAL UNGGAH DOKUMEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Tambah Arsip / Dokumen Sarpras</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BAST Pengadaan Komputer BOS Kinerja 2026"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Surat / Arsip</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 005/BAST/SMK.6/2026"
                    value={formData.nomorDokumen}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Dokumen</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kategori: e.target.value as any,
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="BAST">BAST (Berita Acara Serah Terima)</option>
                    <option value="SOP">SOP Laboratorium & Bengkel</option>
                    <option value="Manual Book">Manual Book Mesin/Alat</option>
                    <option value="KIR">KIR (Kartu Inventaris Ruangan)</option>
                    <option value="Surat Tugas">Surat Tugas / SPK</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Dokumen</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalDokumen}
                    onChange={(e) => setFormData({ ...formData, tanggalDokumen: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ukuran File / Format</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2.4 MB (PDF)"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Tautan Google Drive / Cloud File
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pihak kedua, rekanan, atau ruang lingkup dokumen..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
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
                  Simpan Arsip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL CETAK DOKUMEN RESMI DENGAN KOP SURAT */}
      {selectedDocForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in">
            {/* Modal Top Bar (Hidden in Print) */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Cetak Surat Resmi</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedDocForPrint.nomorDokumen} &bull; {selectedDocForPrint.kategori}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedDocForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL SHEET */}
            <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto text-slate-900 print:overflow-visible print:max-h-none print:p-0 print:m-0">
              {/* KOP SURAT RESMI */}
              <KopSurat size="md" className="mb-4" />

              {/* JUDUL DOKUMEN */}
              <div className="text-center my-4 font-serif">
                <h2 className="text-base sm:text-lg font-black uppercase text-black underline decoration-2 underline-offset-4">
                  {selectedDocForPrint.kategori === 'BAST'
                    ? 'BERITA ACARA SERAH TERIMA (BAST)'
                    : selectedDocForPrint.kategori === 'SOP'
                    ? 'STANDAR OPERASIONAL PROSEDUR (SOP)'
                    : selectedDocForPrint.kategori === 'Surat Tugas'
                    ? 'SURAT TUGAS / SURAT PERINTAH KERJA'
                    : selectedDocForPrint.kategori === 'KIR'
                    ? 'KARTU INVENTARIS RUANGAN (KIR)'
                    : 'SURAT DOKUMEN KEDINASAN SARPRAS'}
                </h2>
                <p className="text-xs font-bold text-black mt-1 font-mono">
                  Nomor : {selectedDocForPrint.nomorDokumen}
                </p>
              </div>

              {/* ISI DOKUMEN */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif mt-6">
                <p>
                  Pada hari ini, tanggal{' '}
                  <span className="font-bold underline">
                    {new Date(selectedDocForPrint.tanggalDokumen).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  , bertempat di <strong>SMK Negeri 6 Dumai</strong>, telah dilaksanakan administrasi
                  penerbitan dokumen kedinasan sarana dan prasarana dengan rincian sebagai berikut:
                </p>

                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 print:bg-transparent print:border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Perihal / Judul</span>
                    <span className="col-span-2 font-bold text-slate-900">{selectedDocForPrint.judul}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Kategori Dokumen</span>
                    <span className="col-span-2 font-semibold text-blue-900">
                      {selectedDocForPrint.kategori}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Tanggal Pengesahan</span>
                    <span className="col-span-2 font-mono">{selectedDocForPrint.tanggalDokumen}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Keterangan / Uraian</span>
                    <span className="col-span-2 text-slate-800">
                      {selectedDocForPrint.keterangan ||
                        'Dokumen sah telah diverifikasi oleh unit Sarana & Prasarana SMK Negeri 6 Dumai sesuai ketentuan yang berlaku.'}
                    </span>
                  </div>
                </div>

                <p>
                  Demikian berkas surat / dokumen ini diterbitkan untuk dipergunakan sebagaimana mestinya dan menjadi
                  arsip sah inventaris sarana prasarana sekolah.
                </p>

                {/* AREA TANDA TANGAN RESMI */}
                {(() => {
                  const sp = StorageService.getSchoolProfile();
                  return (
                    <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-serif">
                      <div className="space-y-16">
                        <div>
                          <p>Pihak Kedua / Rekanan / Pelaksana,</p>
                        </div>
                        <div>
                          <p className="font-bold underline text-sm">...........................................</p>
                          <p className="text-[11px] text-slate-600">Nama Terang & Cap Instansi</p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <div>
                          <p>Dumai, {selectedDocForPrint.tanggalDokumen}</p>
                          <p className="font-bold">Pengelola Sarpras / Aset Sekolah,</p>
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
                Format surat resmi dilengkapi Kop Surat Pemprov Riau & SMKN 6 Dumai.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDocForPrint(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
