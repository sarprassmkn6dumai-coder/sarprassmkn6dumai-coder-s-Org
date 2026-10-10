import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { SchoolLogo } from './SchoolLogo';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  HelpCircle,
  X,
  Check,
  School,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Sparkles,
  Edit3,
  Save,
  RotateCcw,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenFullLoginPage?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onOpenFullLoginPage,
}) => {
  const [usersList, setUsersList] = useState<User[]>(() => StorageService.getUsers());
  const schoolProfile = StorageService.getSchoolProfile();

  // Find the designated Pengelola Aset Sekolah (admin_sarpras or matching id)
  const assetManagerUser = usersList.find((u) => u.role === 'admin_sarpras') || usersList[0];
  const isAdminAssetManager = currentUser.role === 'admin_sarpras';

  // Edit state for Pengelola Aset (Dapat diedit / berganti tiap semester khusus Admin / Pengelola Aset)
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [managerName, setManagerName] = useState(schoolProfile.pengelolaAset || assetManagerUser?.name || 'Rahmat Hidayat, A.Md.');
  const [managerNip, setManagerNip] = useState(schoolProfile.nipPengelolaAset || '19880421 201101 1 003');
  const [managerJabatan, setManagerJabatan] = useState(schoolProfile.jabatanPengelolaAset || assetManagerUser?.jabatan || 'Pengelola Aset & Koordinator Sarpras');
  const [managerSemester, setManagerSemester] = useState(schoolProfile.semesterAktif || 'Semester Ganjil TA 2026/2027');
  const [managerSK, setManagerSK] = useState(schoolProfile.skPengelolaAset || 'SK/421.5/SMKN6-DMI/2026/014');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAssetManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminAssetManager) return;
    if (!managerName.trim()) return;

    // Update in StorageService (synchronizes both User and SchoolProfile + Riwayat Semester)
    const updatedUser = StorageService.updateAssetManager({
      name: managerName.trim(),
      jabatan: managerJabatan.trim(),
      nip: managerNip.trim(),
      semester: managerSemester.trim(),
      nomorSK: managerSK.trim(),
    });

    // Refresh local users list & active user
    const updatedUsers = StorageService.getUsers();
    setUsersList(updatedUsers);
    onSelectUser(updatedUser);
    setIsEditingManager(false);
    setSaveSuccessMsg('Data Pengelola Aset Sekolah (Periode Semester) berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'publik') {
      setUsername('pengunjung');
      setPassword('');
      return;
    }
    const matched = usersList.find((u) => u.role === role) || usersList[0];
    setUsername(matched.username);
    setPassword('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedRole === 'publik') {
      const guest = StorageService.switchToPublicVisitor();
      onSelectUser(guest);
      setLoginMessage('Beralih ke Mode Pengunjung Publik (Read-Only)');
      setTimeout(() => {
        setLoginMessage(null);
        onClose();
      }, 500);
      return;
    }

    const matched = usersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.role === selectedRole
    );

    const validPass = matched?.password || 'admin123';
    if (password.trim() !== validPass && password.trim() !== 'admin123' && password.trim() !== '123456') {
      setErrorMessage('Kata sandi tidak sesuai. Hanya Admin / Pengelola Aset resmi yang dapat masuk ke mode kelola (Demo sandi: admin123).');
      return;
    }

    const userToLogin: User = matched || {
      id: 'usr-custom',
      name: username,
      username: username,
      role: selectedRole,
      jabatan:
        selectedRole === 'admin_sarpras'
          ? 'Administrator Sarpras & Pengelola Aset'
          : selectedRole === 'waka_sarpras'
          ? 'Waka Sarpras'
          : selectedRole === 'guru'
          ? 'Guru'
          : 'Siswa/Staf',
    };

    onSelectUser(userToLogin);
    setLoginMessage(`Berhasil masuk sebagai ${userToLogin.name} (${userToLogin.jabatan})`);
    setTimeout(() => {
      setLoginMessage(null);
      onClose();
    }, 600);
  };

  const handleSelectDemoUser = (user: User) => {
    setSelectedRole(user.role);
    setUsername(user.username);
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="login-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with Dark Navy */}
        <div className="bg-[#0F172A] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-1 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <SchoolLogo size="md" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Portal SIM-SARPRAS</h3>
              <p className="text-xs text-blue-300 font-medium">SMK Negeri 6 Dumai</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Sistem Informasi Manajemen Sarana dan Prasarana terintegrasi Google Sheets & Cloud Drive.
          </p>
        </div>

        {/* Single Editable Pengelola Aset Sekolah Card */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Pengelola Aset Sekolah (Tiap Semester)</span>
            </label>
            {isAdminAssetManager ? (
              !isEditingManager ? (
                <button
                  type="button"
                  onClick={() => setIsEditingManager(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Pengelola / Semester</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingManager(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                >
                  Batal
                </button>
              )
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0"
                title="Data Pengelola Aset Sekolah tidak dapat diedit oleh pengunjung/publik kecuali Admin / Pengelola Aset Sekolah itu sendiri"
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Terkunci bagi Publik</span>
              </span>
            )}
          </div>

          {saveSuccessMsg && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {isEditingManager && isAdminAssetManager ? (
            /* Quick Edit Form for Pengelola Aset (Khusus Admin / Pengelola Aset Sekolah) */
            <form
              onSubmit={handleSaveAssetManager}
              className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5 animate-in fade-in"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Pengelola Aset & Gelar:
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Contoh: Rahmat Hidayat, A.Md."
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Pengelola:
                  </label>
                  <input
                    type="text"
                    value={managerNip}
                    onChange={(e) => setManagerNip(e.target.value)}
                    placeholder="Contoh: 19880421 201101 1 003"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jabatan Resmi:
                  </label>
                  <input
                    type="text"
                    value={managerJabatan}
                    onChange={(e) => setManagerJabatan(e.target.value)}
                    placeholder="Contoh: Pengelola Aset & Sarpras"
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Periode Semester Penugasan:
                  </label>
                  <input
                    type="text"
                    list="semester-options-modal"
                    value={managerSemester}
                    onChange={(e) => setManagerSemester(e.target.value)}
                    placeholder="Contoh: Semester Ganjil TA 2026/2027"
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <datalist id="semester-options-modal">
                    <option value="Semester Ganjil TA 2026/2027" />
                    <option value="Semester Genap TA 2026/2027" />
                    <option value="Semester Ganjil TA 2027/2028" />
                    <option value="Semester Genap TA 2027/2028" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor SK Penugasan Semester (Opsional):
                </label>
                <input
                  type="text"
                  value={managerSK}
                  onChange={(e) => setManagerSK(e.target.value)}
                  placeholder="Contoh: SK/421.5/SMKN6-DMI/2026/014"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingManager(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white rounded-lg border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pejabat Semester</span>
                </button>
              </div>
            </form>
          ) : (
            /* Single Primary Card for Pengelola Aset Sekolah */
            <div className="p-3.5 rounded-xl border border-blue-300 bg-linear-to-r from-blue-50/90 to-indigo-50/70 shadow-xs space-y-2.5">
              <div
                onClick={() => handleSelectDemoUser(assetManagerUser)}
                className="flex items-start justify-between gap-2 cursor-pointer group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {managerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                        {managerName}
                      </span>
                      {isAdminAssetManager && (
                        <span className="text-[10px] font-semibold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                          Sedang Login (Akses Edit Aktif)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {managerJabatan} &bull; <span className="text-slate-500">NIP. {managerNip}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                        @{assetManagerUser.username}
                      </span>
                      <span>&bull;</span>
                      <span className="text-blue-700 font-semibold bg-blue-100/70 px-1.5 py-0.5 rounded">
                        {managerSemester}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    Pengelola Aset
                  </span>
                  <span className="text-[10px] text-blue-600 group-hover:underline">
                    Pilih akun &rarr;
                  </span>
                </div>
              </div>

              {!isAdminAssetManager && (
                <div className="pt-2 border-t border-blue-200/70 flex items-start gap-1.5 text-[11px] text-slate-600">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Data <strong>Pengelola Aset Sekolah</strong> (dapat berganti tiap semester) tidak dapat diedit oleh pengunjung/publik kecuali oleh <strong>Admin / Pengelola Aset Sekolah</strong> itu sendiri.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Input Section */}
        <form onSubmit={handleFormSubmit} className="p-6 pt-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilihan Hak Akses (Role)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="publik">Pengunjung Publik / Tamu (Akses Lihat Saja / Read-Only)</option>
              <option value="admin_sarpras">Admin / Pengelola Aset Sekolah (Akses Penuh Kelola Aset)</option>
              <option value="waka_sarpras">Waka Sarpras (Persetujuan & Monitoring)</option>
              <option value="guru">Guru / Kepala Bengkel (Lapor & Pinjam)</option>
              <option value="siswa">Siswa / Staf (Akses Terbatas)</option>
            </select>
          </div>

          {selectedRole !== 'publik' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username / NIP / NISN
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Masukkan NIP atau NISN (Contoh: admin)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan kata sandi (Demo: admin123)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Mode <strong>Pengunjung Publik</strong> memungkinkan Anda melihat katalog inventaris sarpras dan ruangan sekolah tanpa dapat mengedit atau menghapus data.
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loginMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {selectedRole === 'publik' ? 'Aktifkan Mode Pengunjung Publik' : 'Masuk ke SIM-SARPRAS'}
              </span>
            </button>
            {onOpenFullLoginPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullLoginPage();
                }}
                className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Buka Halaman Login & Registrasi Lengkap</span>
              </button>
            )}
          </div>
        </form>

        {/* Forgot Password Sub-Modal */}
        {showForgotPassword && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 flex flex-col justify-between z-20 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span>Bantuan Pemulihan Akun</span>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Untuk keamanan data aset sekolah, reset kata sandi NIP/NISN dilakukan melalui bagian Sarana dan Prasarana SMKN 6 Dumai.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                <p>
                  <strong>Kontak Waka Sarpras:</strong> Bambang Trianto, S.T., M.Kom.
                </p>
                <p>
                  <strong>Ruang:</strong> Kantor Sarpras SMKN 6 Dumai, Gd. Utama Lt. 1
                </p>
                <p>
                  <strong>Email:</strong> sarpras@smkn6dumai.sch.id
                </p>
                <p>
                  <strong>Nomor Layanan:</strong> 0812-7654-3210 (WhatsApp)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
