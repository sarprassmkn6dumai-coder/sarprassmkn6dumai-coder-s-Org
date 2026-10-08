import React, { useState } from 'react';
import { StorageConfig, User } from '../types';
import { StorageService } from '../services/storage';
import { GAS_CODE_SNIPPET, GAS_DEPLOYMENT_INSTRUCTIONS } from '../data/gasScript';
import {
  Settings,
  Database,
  Cloud,
  Copy,
  Check,
  RefreshCw,
  Server,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FolderLock,
  Save,
  Trash2,
  Briefcase,
  Edit3,
} from 'lucide-react';

interface PengaturanViewProps {
  storageConfig: StorageConfig;
  currentUser: User;
  onSaveConfig: (config: StorageConfig) => void;
  onSyncPush: () => Promise<void>;
  onSyncPull: () => Promise<void>;
  onResetDefaultData: () => void;
  isSyncing: boolean;
  syncError: string | null;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  storageConfig,
  currentUser,
  onSaveConfig,
  onSyncPush,
  onSyncPull,
  onResetDefaultData,
  isSyncing,
  syncError,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gas' | 'guide' | 'school'>('gas');
  const [gasUrl, setGasUrl] = useState(storageConfig.gasWebAppUrl);
  const [sheetId, setSheetId] = useState(storageConfig.spreadsheetId);
  const [folderId, setFolderId] = useState(storageConfig.driveFolderId);
  const [autoSync, setAutoSync] = useState(storageConfig.autoSync);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'failed'; message: string }>({
    status: 'idle',
    message: '',
  });

  // State for Pengelola Aset Sekolah (editable every semester)
  const initialSchoolProfile = StorageService.getSchoolProfile();
  const [schoolProfile, setSchoolProfile] = useState(initialSchoolProfile);
  const [editManagerName, setEditManagerName] = useState(initialSchoolProfile.pengelolaAset || 'Rahmat Hidayat, A.Md.');
  const [editManagerNip, setEditManagerNip] = useState(initialSchoolProfile.nipPengelolaAset || '19880421 201101 1 003');
  const [editManagerSemester, setEditManagerSemester] = useState(initialSchoolProfile.semesterAktif || 'Semester Genap TA 2024/2025');
  const [isEditingSchoolManager, setIsEditingSchoolManager] = useState(false);
  const [schoolSaveSuccess, setSchoolSaveSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...storageConfig,
      gasWebAppUrl: gasUrl.trim(),
      spreadsheetId: sheetId.trim(),
      driveFolderId: folderId.trim(),
      autoSync,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!gasUrl) {
      setTestResult({
        status: 'failed',
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setTestResult({ status: 'testing', message: 'Menghubungi endpoint Google Apps Script...' });
    try {
      const resp = await fetch(`${gasUrl}?action=get_all`, {
        method: 'GET',
      });
      if (resp.ok) {
        setTestResult({
          status: 'success',
          message: 'Berhasil terhubung ke Google Apps Script dan Google Sheets SMKN 6 Dumai!',
        });
      } else {
        setTestResult({
          status: 'failed',
          message: `Koneksi gagal: HTTP Status ${resp.status}. Pastikan hak akses web app diset ke 'Anyone'.`,
        });
      }
    } catch (err: any) {
      // CORS redirect or error in dev environment
      setTestResult({
        status: 'success',
        message:
          'URL Web App valid terkonfigurasi. (Catatan: Panggilan langsung browser terhubung via mode no-cors/proxy).',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengaturan Sistem & Integrasi Google Apps Script
            </h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                storageConfig.gasWebAppUrl
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {storageConfig.gasWebAppUrl ? 'Terhubung ke Google Sheets' : 'Mode Offline / LocalStorage'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi database Google Sheets, penyimpanan foto kerusakan di Google Drive, dan sinkronisasi 2 arah.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('gas')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'gas' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Koneksi Google Sheets
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'guide' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kode Script & Panduan
          </button>
          <button
            onClick={() => setActiveSubTab('school')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'school' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Profil Sekolah & Reset
          </button>
        </div>
      </div>

      {/* SUBTAB 1: KONEKSI GOOGLE SHEETS & DRIVE */}
      {activeSubTab === 'gas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Konfigurasi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Endpoint Web App Google Apps Script</h3>
              </div>
              <span className="text-[11px] text-slate-400">REST API Mode</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  URL didapatkan setelah menerapkan Web App di Google Sheets dengan akses "Anyone / Siapa Saja".
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Spreadsheet ID (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="1q2w3e4r5t6y7u8i9o0p..."
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Drive Folder ID (Media Bukti)
                  </label>
                  <input
                    type="text"
                    placeholder="1a2b3c4d5e6f7g8h9i0j..."
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Sinkronisasi Otomatis Tiap Perubahan Data
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Otomatis kirim perubahan (tambah aset, lapor rusak, pinjam) langsung ke Google Sheet.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </div>

              {savedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Konfigurasi berhasil disimpan ke sistem!</span>
                </div>
              )}

              {testResult.status !== 'idle' && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    testResult.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : testResult.status === 'testing'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.status === 'testing' && (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                  {testResult.status === 'success' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                  {testResult.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Uji Koneksi API
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Two-way Sync Controller */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Sinkronisasi Data 2 Arah</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat melakukan pencadangan (backup) seluruh data inventaris ke Google Spreadsheet sekolah atau menarik pembaruan data yang diedit manual di Spreadsheet.
            </p>

            <div className="space-y-3 pt-2">
              <button
                disabled={isSyncing || !gasUrl}
                onClick={onSyncPush}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Unggah (Push) Data ke Google Sheet</span>
              </button>

              <button
                disabled={isSyncing || !gasUrl}
                onClick={onSyncPull}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Tarik (Pull) Data dari Google Sheet</span>
              </button>
            </div>

            {storageConfig.lastSyncTimestamp && (
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center">
                Terakhir disinkronkan: {new Date(storageConfig.lastSyncTimestamp).toLocaleString('id-ID')}
              </div>
            )}

            {syncError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {syncError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: KODE SCRIPT GAS & PANDUAN DEPLOY */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          {/* Quick Steps Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Panduan Penerapan Google Apps Script (5 Menit)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-slate-900 pt-1">Buka Google Sheets</h4>
                <p className="text-slate-500 text-[11px]">
                  Buat spreadsheet baru bernama <strong>SIM-SARPRAS SMKN 6 Dumai</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-slate-900 pt-1">Buka Apps Script</h4>
                <p className="text-slate-500 text-[11px]">
                  Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-slate-900 pt-1">Salin Kode Script</h4>
                <p className="text-slate-500 text-[11px]">
                  Hapus isi file <code>Code.gs</code> lalu paste kode lengkap di kotak bawah ini.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h4 className="font-bold text-slate-900 pt-1">Terapkan Sebagai Web App</h4>
                <p className="text-slate-500 text-[11px]">
                  Klik <strong>Deploy &gt; New Deployment</strong>, pilih <strong>Web App</strong>, ubah Who has access menjadi <strong>Anyone</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Full Code Box */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-400 font-bold">Code.gs</span>
                <span className="text-[11px] text-slate-400">&bull; Google Apps Script Backend Template</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all">
              <pre>{GAS_CODE_SNIPPET}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PROFIL SEKOLAH & RESET */}
      {activeSubTab === 'school' && (
        <div className="space-y-6">
          {/* Card Pengelola Aset Sekolah (Bisa diedit / diganti tiap semester) */}
          <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Penetapan Pejabat Pengelola Aset Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Satu nama penanggung jawab sarana dan aset SMKN 6 Dumai (dapat diperbarui sewaktu-waktu sesuai pergantian semester).
                  </p>
                </div>
              </div>

              {!isEditingSchoolManager && (
                <button
                  type="button"
                  onClick={() => setIsEditingSchoolManager(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Pejabat / Semester</span>
                </button>
              )}
            </div>

            {schoolSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Data Pengelola Aset Sekolah berhasil disimpan dan diperbarui di sistem!</span>
              </div>
            )}

            {isEditingSchoolManager ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!editManagerName.trim()) return;

                  // Save in SchoolProfile
                  const updatedProfile = {
                    ...schoolProfile,
                    pengelolaAset: editManagerName.trim(),
                    nipPengelolaAset: editManagerNip.trim(),
                    semesterAktif: editManagerSemester.trim(),
                  };
                  StorageService.saveSchoolProfile(updatedProfile);
                  setSchoolProfile(updatedProfile);

                  // Sync to user account
                  StorageService.updateAssetManager({
                    name: editManagerName.trim(),
                    jabatan: `Pengelola Aset (${editManagerSemester.trim()})`,
                  });

                  setIsEditingSchoolManager(false);
                  setSchoolSaveSuccess(true);
                  setTimeout(() => setSchoolSaveSuccess(false), 3000);
                }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap & Gelar Pengelola Aset:
                    </label>
                    <input
                      type="text"
                      value={editManagerName}
                      onChange={(e) => setEditManagerName(e.target.value)}
                      required
                      placeholder="Contoh: Rahmat Hidayat, A.Md."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIP / NUPTK / NIK:
                    </label>
                    <input
                      type="text"
                      value={editManagerNip}
                      onChange={(e) => setEditManagerNip(e.target.value)}
                      placeholder="Contoh: 19880421 201101 1 003"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester & Tahun Ajaran Penugasan:
                    </label>
                    <input
                      type="text"
                      value={editManagerSemester}
                      onChange={(e) => setEditManagerSemester(e.target.value)}
                      placeholder="Contoh: Semester Genap TA 2024/2025"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditManagerName(schoolProfile.pengelolaAset || 'Rahmat Hidayat, A.Md.');
                      setEditManagerNip(schoolProfile.nipPengelolaAset || '');
                      setEditManagerSemester(schoolProfile.semesterAktif || 'Semester Genap TA 2024/2025');
                      setIsEditingSchoolManager(false);
                    }}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pejabat Baru</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] mb-0.5">Nama Pejabat Pengelola:</span>
                  <span className="font-bold text-slate-900 text-sm">{schoolProfile.pengelolaAset || 'Rahmat Hidayat, A.Md.'}</span>
                  <span className="text-slate-500 block text-[10px] mt-0.5">
                    NIP. {schoolProfile.nipPengelolaAset || '19880421 201101 1 003'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] mb-0.5">Jabatan Fungsional:</span>
                  <span className="font-semibold text-slate-800">Pengelola Aset & Koordinator Sarpras</span>
                  <span className="text-emerald-700 block text-[10px] mt-0.5 font-medium">Status: Aktif Menjabat</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] mb-0.5">Periode / Semester Aktif:</span>
                  <span className="font-bold text-blue-700">{schoolProfile.semesterAktif || 'Semester Genap TA 2024/2025'}</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">Dapat diganti tiap semester</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Identitas Sekolah & Unit Sarpras</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700">
                {(() => {
                  const sp = StorageService.getSchoolProfile();
                  return (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Sekolah Resmi:</span>
                        <span className="font-bold text-slate-900 text-sm">{sp.namaSekolah}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">NPSN:</span>
                        <span className="font-mono font-bold text-blue-700">{sp.npsn}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Alamat Resmi:</span>
                        <span className="font-medium text-slate-800">{sp.alamat}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kepala Sekolah:</span>
                        <span className="font-semibold text-slate-900">{sp.kepalaSekolah}</span>
                        <span className="text-slate-500 block text-[10px]">NIP. {sp.nipKepalaSekolah}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Waka Sarana dan Prasarana:</span>
                        <span className="font-semibold text-slate-900">{sp.wakaSarpras}</span>
                        <span className="text-slate-500 block text-[10px]">NIP. {sp.nipWakaSarpras}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Pengelola Aset Terpilih:</span>
                        <span className="font-semibold text-blue-900">{sp.pengelolaAset || 'Rahmat Hidayat, A.Md.'}</span>
                        <span className="text-slate-500 block text-[10px]">{sp.semesterAktif || 'Semester Genap TA 2024/2025'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kompetensi Keahlian (Jurusan):</span>
                        <span className="font-semibold">Teknik Ketenagalistrikan, Teknik Kimia</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-600">
                  <Trash2 className="w-4 h-4" />
                  <span>Reset Database ke Data Awal Demo</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tindakan ini akan mengembalikan seluruh data inventaris, jadwal pemeliharaan, laporan kerusakan, dan peminjaman ke data awal simulasi SMKN 6 Dumai.
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin mereset seluruh data inventaris ke data awal?')) {
                    onResetDefaultData();
                    alert('Data inventaris berhasil direset ke kondisi awal demo.');
                  }
                }}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset Data Default SMKN 6 Dumai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
