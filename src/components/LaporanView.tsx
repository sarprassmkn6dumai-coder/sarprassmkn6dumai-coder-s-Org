import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { KopSurat } from './KopSurat';
import {
  AssetItem,
  DamageReport,
  MaintenanceRecord,
  LoanItem,
  BudgetAllocation,
  RoomItem,
} from '../types';
import { StorageService } from '../services/storage';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building2,
  Package,
  Wrench,
  AlertTriangle,
  Share2,
  DollarSign,
  FileCheck,
  UserCheck,
  Edit3,
  Save,
  CheckCircle2,
  X,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

interface LaporanViewProps {
  assets: AssetItem[];
  damageReports: DamageReport[];
  maintenanceRecords: MaintenanceRecord[];
  loans: LoanItem[];
  budgets: BudgetAllocation[];
  rooms: RoomItem[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  assets,
  damageReports,
  maintenanceRecords,
  loans,
  budgets,
  rooms,
}) => {
  const [reportType, setReportType] = useState<
    'inventaris' | 'kerusakan' | 'pemeliharaan' | 'peminjaman' | 'anggaran'
  >('inventaris');

  const [filterJurusan, setFilterJurusan] = useState('Semua');

  // Data Utama Pejabat Penandatangan Resmi (Tersimpan di Storage)
  const [profile, setProfile] = useState(() => StorageService.getSchoolProfile());
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState<string>(
    () => profile.kepalaSekolah || 'Drs. H. Syahrul, M.Pd.'
  );
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState<string>(
    () => profile.nipKepalaSekolah || '19680512 199403 1 005'
  );
  const [namaWakaSarpras, setNamaWakaSarpras] = useState<string>(
    () => profile.wakaSarpras || 'Bambang Trianto, S.T., M.Kom.'
  );
  const [nipWakaSarpras, setNipWakaSarpras] = useState<string>(
    () => profile.nipWakaSarpras || '19790815 200801 1 012'
  );
  const [kotaDokumen, setKotaDokumen] = useState<string>('Dumai');
  const [tanggalDokumen, setTanggalDokumen] = useState<string>(() =>
    new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDirectEdit, setIsDirectEdit] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSaveSignatures = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const current = StorageService.getSchoolProfile();
    const updated = {
      ...current,
      kepalaSekolah: namaKepalaSekolah.trim() || 'Drs. H. Syahrul, M.Pd.',
      nipKepalaSekolah: nipKepalaSekolah.trim() || '-',
      wakaSarpras: namaWakaSarpras.trim() || 'Bambang Trianto, S.T., M.Kom.',
      nipWakaSarpras: nipWakaSarpras.trim() || '-',
    };
    StorageService.saveSchoolProfile(updated);
    setProfile(updated);
    setSaveSuccessMsg('Data utama pejabat penandatangan berhasil disimpan secara permanen!');
    setIsEditModalOpen(false);
    setIsDirectEdit(false);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  const handleResetDefaultSignatures = () => {
    setNamaKepalaSekolah('Drs. H. Syahrul, M.Pd.');
    setNipKepalaSekolah('19680512 199403 1 005');
    setNamaWakaSarpras('Bambang Trianto, S.T., M.Kom.');
    setNipWakaSarpras('19790815 200801 1 012');
    setKotaDokumen('Dumai');
    setTanggalDokumen(new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }));
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV based on selected report
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = '';

    if (reportType === 'inventaris') {
      fileName = 'Buku_Inventaris_SMKN6_Dumai';
      headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Ruangan', 'Jurusan', 'Jumlah', 'Satuan', 'Kondisi', 'Status', 'Tahun', 'Harga'];
      rows = assets.map((a, i) => [
        i + 1,
        `"${a.kode}"`,
        `"${a.nama}"`,
        `"${a.kategori}"`,
        `"${a.ruanganNama}"`,
        `"${a.jurusan}"`,
        a.jumlah,
        `"${a.satuan}"`,
        `"${a.kondisi}"`,
        `"${a.status}"`,
        a.tahunPerolehan,
        a.hargaPerolehan,
      ]);
    } else if (reportType === 'kerusakan') {
      fileName = 'Rekap_Kerusakan_Sarpras_SMKN6';
      headers = ['No', 'Tiket', 'Barang', 'Lokasi', 'Pelapor', 'Urgensi', 'Status', 'Tgl Lapor', 'Teknisi'];
      rows = damageReports.map((d, i) => [
        i + 1,
        `"${d.tiket}"`,
        `"${d.assetNama}"`,
        `"${d.lokasiRuangan}"`,
        `"${d.pelaporNama}"`,
        `"${d.urgensi}"`,
        `"${d.status}"`,
        d.tanggalLapor,
        `"${d.teknisiNama || '-'}"`,
      ]);
    } else if (reportType === 'pemeliharaan') {
      fileName = 'Rekap_Pemeliharaan_Sarpras_SMKN6';
      headers = ['No', 'Kode Aset', 'Nama Aset', 'Lokasi', 'Perawatan', 'Jadwal', 'Teknisi', 'Biaya', 'Status'];
      rows = maintenanceRecords.map((m, i) => [
        i + 1,
        `"${m.kodeAset}"`,
        `"${m.namaAset}"`,
        `"${m.lokasiRuangan}"`,
        `"${m.jenisPerawatan}"`,
        m.jadwalTanggal,
        `"${m.teknisiPIC}"`,
        m.biaya,
        `"${m.status}"`,
      ]);
    } else if (reportType === 'peminjaman') {
      fileName = 'Rekap_Peminjaman_Sarpras_SMKN6';
      headers = ['No', 'Kode Pinjam', 'Item', 'Tipe', 'Peminjam', 'Tgl Pinjam', 'Rencana Kembali', 'Status'];
      rows = loans.map((l, i) => [
        i + 1,
        `"${l.kodePinjam}"`,
        `"${l.itemNama}"`,
        `"${l.tipe}"`,
        `"${l.peminjamNama}"`,
        l.tanggalPinjam,
        l.rencanaKembali,
        `"${l.status}"`,
      ]);
    } else {
      fileName = 'Rekap_Anggaran_Sarpras_SMKN6';
      headers = ['No', 'Sumber Dana', 'Pagu', 'Realisasi', 'Sisa', 'Persentase'];
      rows = budgets.map((b, i) => [
        i + 1,
        `"${b.sumberDana}"`,
        b.pagu,
        b.realisasi,
        b.sisa,
        `${Math.round((b.realisasi / b.pagu) * 100)}%`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Cetak Laporan & Rekapitulasi Resmi
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Format Standar Diknas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak buku inventaris tahunan, laporan kerusakan, rekap pemeliharaan dan serapan anggaran sarpras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs transition-colors cursor-pointer print:hidden"
            title="Ubah Nama & NIP Kepala Sekolah serta Waka Sarpras"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Edit Data Penandatangan</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel/CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center justify-between shadow-xs print:hidden animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg('')}
            className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Select Report Type Pills */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-100 rounded-2xl">
        {[
          { id: 'inventaris', label: 'Buku Inventaris Barang', icon: Package },
          { id: 'kerusakan', label: 'Laporan Kerusakan', icon: AlertTriangle },
          { id: 'pemeliharaan', label: 'Jadwal & Biaya Servis', icon: Wrench },
          { id: 'peminjaman', label: 'Sirkulasi Peminjaman', icon: Share2 },
          { id: 'anggaran', label: 'Penyerapan Anggaran', icon: DollarSign },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = reportType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* THE OFFICIAL PRINTABLE PAPER DOCUMENT VIEWPORT */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 max-w-5xl mx-auto text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
        {/* KOP SURAT RESMI PEMERINTAH PROVINSI RIAU - SMKN 6 DUMAI */}
        <KopSurat size="lg" className="mb-4" />

        {/* JUDUL LAPORAN */}
        <div className="text-center my-6">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase underline decoration-2 underline-offset-4">
            {reportType === 'inventaris' && 'BUKU INDUK INVENTARIS SARANA & PRASARANA SEKOLAH'}
            {reportType === 'kerusakan' && 'REKAPITULASI PENANGANAN LAPORAN KERUSAKAN FASILITAS'}
            {reportType === 'pemeliharaan' && 'LOG PERAWATAN BERKALA & BIAYA PEMELIHARAAN ALAT'}
            {reportType === 'peminjaman' && 'DAFTAR REKAPITULASI SIRKULASI PEMINJAMAN SARPRAS'}
            {reportType === 'anggaran' && 'LAPORAN PENYERAPAN ALOKASI ANGGARAN SARPRAS T.A 2026'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Periode: Semester Ganjil/Genap T.A. 2025/2026 &bull; Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </p>
        </div>

        {/* TABEL DATA SESUAI TIPE */}
        <div className="overflow-x-auto text-xs my-6">
          {reportType === 'inventaris' && (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-[11px]">
                  <th className="border border-slate-300 p-2 text-center">No</th>
                  <th className="border border-slate-300 p-2">Kode Barang</th>
                  <th className="border border-slate-300 p-2">Nama Barang & Spek</th>
                  <th className="border border-slate-300 p-2">Kategori</th>
                  <th className="border border-slate-300 p-2">Lokasi Ruang</th>
                  <th className="border border-slate-300 p-2 text-center">Jml</th>
                  <th className="border border-slate-300 p-2">Kondisi</th>
                  <th className="border border-slate-300 p-2 text-right">Harga (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {assets.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono font-semibold text-blue-900">
                      {item.kode}
                    </td>
                    <td className="border border-slate-300 p-2 font-semibold">
                      {item.nama}
                      {item.spesifikasi && (
                        <span className="block text-[10px] text-slate-500 font-normal italic">
                          {item.spesifikasi}
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2">{item.kategori}</td>
                    <td className="border border-slate-300 p-2">{item.ruanganNama}</td>
                    <td className="border border-slate-300 p-2 text-center">
                      {item.jumlah} {item.satuan}
                    </td>
                    <td className="border border-slate-300 p-2 font-semibold">{item.kondisi}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {item.hargaPerolehan.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'kerusakan' && (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-[11px]">
                  <th className="border border-slate-300 p-2 text-center">No</th>
                  <th className="border border-slate-300 p-2">Tiket</th>
                  <th className="border border-slate-300 p-2">Nama Barang & Kerusakan</th>
                  <th className="border border-slate-300 p-2">Lokasi</th>
                  <th className="border border-slate-300 p-2">Pelapor</th>
                  <th className="border border-slate-300 p-2">Urgensi</th>
                  <th className="border border-slate-300 p-2">Status</th>
                  <th className="border border-slate-300 p-2">Teknisi / Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {damageReports.map((rep, idx) => (
                  <tr key={rep.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                      {rep.tiket}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-semibold block">{rep.assetNama}</span>
                      <span className="text-[10px] text-slate-500 italic">"{rep.deskripsi}"</span>
                    </td>
                    <td className="border border-slate-300 p-2">{rep.lokasiRuangan}</td>
                    <td className="border border-slate-300 p-2">{rep.pelaporNama}</td>
                    <td className="border border-slate-300 p-2 font-semibold">{rep.urgensi}</td>
                    <td className="border border-slate-300 p-2 font-bold">{rep.status}</td>
                    <td className="border border-slate-300 p-2">
                      {rep.tindakLanjut ? `${rep.teknisiNama}: ${rep.tindakLanjut}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'pemeliharaan' && (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-[11px]">
                  <th className="border border-slate-300 p-2 text-center">No</th>
                  <th className="border border-slate-300 p-2">Nama Aset & Kode</th>
                  <th className="border border-slate-300 p-2">Lokasi</th>
                  <th className="border border-slate-300 p-2">Jenis Perawatan</th>
                  <th className="border border-slate-300 p-2">Tanggal</th>
                  <th className="border border-slate-300 p-2">Teknisi PIC</th>
                  <th className="border border-slate-300 p-2 text-right">Biaya (Rp)</th>
                  <th className="border border-slate-300 p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {maintenanceRecords.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-semibold block">{m.namaAset}</span>
                      <span className="font-mono text-[10px] text-blue-900">{m.kodeAset}</span>
                    </td>
                    <td className="border border-slate-300 p-2">{m.lokasiRuangan}</td>
                    <td className="border border-slate-300 p-2">{m.jenisPerawatan}</td>
                    <td className="border border-slate-300 p-2">{m.jadwalTanggal}</td>
                    <td className="border border-slate-300 p-2">{m.teknisiPIC}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                      {m.biaya.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'peminjaman' && (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-[11px]">
                  <th className="border border-slate-300 p-2 text-center">No</th>
                  <th className="border border-slate-300 p-2">Kode Pinjam</th>
                  <th className="border border-slate-300 p-2">Barang / Ruangan</th>
                  <th className="border border-slate-300 p-2">Peminjam</th>
                  <th className="border border-slate-300 p-2">Tgl Pinjam - Kembali</th>
                  <th className="border border-slate-300 p-2">Keperluan</th>
                  <th className="border border-slate-300 p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {loans.map((l, idx) => (
                  <tr key={l.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                      {l.kodePinjam}
                    </td>
                    <td className="border border-slate-300 p-2 font-semibold">
                      {l.itemNama} ({l.jumlah} {l.satuan})
                    </td>
                    <td className="border border-slate-300 p-2">
                      {l.peminjamNama} ({l.peminjamRole})
                    </td>
                    <td className="border border-slate-300 p-2">
                      {l.tanggalPinjam} s/d {l.rencanaKembali}
                    </td>
                    <td className="border border-slate-300 p-2 italic">"{l.keperluan}"</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'anggaran' && (
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-[11px]">
                  <th className="border border-slate-300 p-2 text-center">No</th>
                  <th className="border border-slate-300 p-2">Sumber Anggaran</th>
                  <th className="border border-slate-300 p-2 text-right">Pagu Alokasi (Rp)</th>
                  <th className="border border-slate-300 p-2 text-right">Realisasi Serapan (Rp)</th>
                  <th className="border border-slate-300 p-2 text-right">Sisa Saldo (Rp)</th>
                  <th className="border border-slate-300 p-2 text-center">Persentase Serapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {budgets.map((b, idx) => (
                  <tr key={b.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-bold">{b.sumberDana}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {b.pagu.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-semibold text-blue-800">
                      {b.realisasi.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-semibold text-emerald-800">
                      {b.sisa.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {Math.round((b.realisasi / b.pagu) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* LEMBAR PENGESAHAN / TANDA TANGAN RESMI */}
        <div className="pt-10">
          {/* Action Bar Khusus Data Penandatangan (Hidden saat Print) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6 print:hidden">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Lembar Pengesahan & Tanda Tangan Resmi
                </p>
                <p className="text-[11px] text-slate-500">
                  Data pejabat penandatangan dapat diedit secara langsung atau via formulir resmi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDirectEdit(!isDirectEdit)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isDirectEdit
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isDirectEdit ? 'Selesai Edit' : 'Edit Langsung di Lembar'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Formulir Pejabat</span>
              </button>
            </div>
          </div>

          {/* MODE EDIT LANGSUNG DI LEMBAR (SCREEN ONLY) */}
          {isDirectEdit ? (
            <div className="space-y-4 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. KEPALA SEKOLAH */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Pejabat 1: Kepala Sekolah
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                      Mengetahui
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap Kepala Sekolah (beserta gelar):
                    </label>
                    <input
                      type="text"
                      value={namaKepalaSekolah}
                      onChange={(e) => setNamaKepalaSekolah(e.target.value)}
                      placeholder="Contoh: Drs. H. Syahrul, M.Pd."
                      className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      NIP Kepala Sekolah:
                    </label>
                    <input
                      type="text"
                      value={nipKepalaSekolah}
                      onChange={(e) => setNipKepalaSekolah(e.target.value)}
                      placeholder="Contoh: 19680512 199403 1 005"
                      className="w-full text-xs font-mono px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* 2. WAKA SARPRAS */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Pejabat 2: Waka Sarana & Prasarana
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                      Penanggung Jawab
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap Waka Sarpras (beserta gelar):
                    </label>
                    <input
                      type="text"
                      value={namaWakaSarpras}
                      onChange={(e) => setNamaWakaSarpras(e.target.value)}
                      placeholder="Contoh: Bambang Trianto, S.T., M.Kom."
                      className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      NIP Waka Bidang Sarpras:
                    </label>
                    <input
                      type="text"
                      value={nipWakaSarpras}
                      onChange={(e) => setNipWakaSarpras(e.target.value)}
                      placeholder="Contoh: 19790815 200801 1 012"
                      className="w-full text-xs font-mono px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Kota Tempat:</label>
                      <input
                        type="text"
                        value={kotaDokumen}
                        onChange={(e) => setKotaDokumen(e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Tanggal Cetak:</label>
                      <input
                        type="text"
                        value={tanggalDokumen}
                        onChange={(e) => setTanggalDokumen(e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action save inline */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetDefaultSignatures}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl bg-white hover:bg-slate-50"
                >
                  Reset Standar SMKN 6
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignatures}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Permanen</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* TAMPILAN RESMI FORMAT LEMBAR PENGESAHAN DOKUMEN (SCREEN & PRINT READY) */}
          <div
            className={`grid grid-cols-2 pt-6 text-xs text-center text-slate-900 ${
              isDirectEdit ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            {/* SISI KIRI: KEPALA SEKOLAH */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer group"
              title="Klik untuk mengubah nama / NIP Kepala Sekolah"
            >
              <p className="text-slate-700">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala SMK Negeri 6 Dumai</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                  (Klik untuk edit data)
                </span>
              </div>
              <p className="font-extrabold underline uppercase tracking-wide text-slate-950">
                {namaKepalaSekolah || 'Drs. H. Syahrul, M.Pd.'}
              </p>
              <p className="text-[10px] text-slate-700 font-medium">
                NIP. {nipKepalaSekolah || '19680512 199403 1 005'}
              </p>
            </div>

            {/* SISI KANAN: WAKA SARANA DAN PRASARANA */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer group"
              title="Klik untuk mengubah nama / NIP Waka Sarpras"
            >
              <p className="text-slate-700">
                {kotaDokumen}, {tanggalDokumen}
              </p>
              <p className="font-bold text-slate-900">Waka Bidang Sarana & Prasarana</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                  (Klik untuk edit data)
                </span>
              </div>
              <p className="font-extrabold underline uppercase tracking-wide text-slate-950">
                {namaWakaSarpras || 'Bambang Trianto, S.T., M.Kom.'}
              </p>
              <p className="text-[10px] text-slate-700 font-medium">
                NIP. {nipWakaSarpras || '19790815 200801 1 012'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT DATA UTAMA PEJABAT PENANDATANGAN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    Edit Data Utama Penandatangan Dokumen Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pusat Cetak Laporan & Rekapitulasi SMKN 6 Dumai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSignatures} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                Data yang Anda perbarui di sini akan langsung tercetak pada lembar pengesahan di seluruh format laporan (Inventaris, Kerusakan, Pemeliharaan, Peminjaman, dan Anggaran) dan disimpan di sistem.
              </div>

              {/* BAGIAN 1: KEPALA SEKOLAH */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Data Kepala Sekolah
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    Mengetahui
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kepala Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKepalaSekolah}
                    onChange={(e) => setNamaKepalaSekolah(e.target.value)}
                    placeholder="Contoh: Drs. H. Syahrul, M.Pd."
                    className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Kepala Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nipKepalaSekolah}
                    onChange={(e) => setNipKepalaSekolah(e.target.value)}
                    placeholder="Contoh: 19680512 199403 1 005"
                    className="w-full text-xs font-mono px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* BAGIAN 2: WAKA SARANA DAN PRASARANA */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Data Waka Bidang Sarana & Prasarana
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    Penanggung Jawab Sarpras
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Waka Bidang Sarpras <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaWakaSarpras}
                    onChange={(e) => setNamaWakaSarpras(e.target.value)}
                    placeholder="Contoh: Bambang Trianto, S.T., M.Kom."
                    className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Waka Bidang Sarpras <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nipWakaSarpras}
                    onChange={(e) => setNipWakaSarpras(e.target.value)}
                    placeholder="Contoh: 19790815 200801 1 012"
                    className="w-full text-xs font-mono px-3 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* BAGIAN 3: TITIK DAN TANGGAL PENGESAHAN */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kota Penandatanganan
                  </label>
                  <input
                    type="text"
                    value={kotaDokumen}
                    onChange={(e) => setKotaDokumen(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tanggal Dokumen
                  </label>
                  <input
                    type="text"
                    value={tanggalDokumen}
                    onChange={(e) => setTanggalDokumen(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResetDefaultSignatures}
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan Default SMKN 6</span>
                </button>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Utama</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
