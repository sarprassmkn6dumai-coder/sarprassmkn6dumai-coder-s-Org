import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { SchoolLogo } from './SchoolLogo';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  User as UserIcon,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  School,
  Sparkles,
  HelpCircle,
  X,
  Phone,
  BookOpen,
  Cpu,
  FlaskConical,
  Zap,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('admin_sarpras');
  const [regJurusan, setRegJurusan] = useState('Teknik Ketenagalistrikan');
  const [regJabatan, setRegJabatan] = useState('Administrator Sarpras');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback & Modal
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Quick switch role preset for register
  const handleRolePreset = (role: UserRole) => {
    setRegRole(role);
    if (role === 'admin_sarpras') {
      setRegJabatan('Administrator Sarpras & Pengelola Aset');
    } else if (role === 'waka_sarpras') {
      setRegJabatan('Waka Bidang Sarana & Prasarana');
    } else if (role === 'guru') {
      setRegJabatan('Guru Produktif / Kepala Bengkel');
    } else {
      setRegJabatan('Siswa / Staf Pengguna Sarpras');
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!account.trim()) {
      setErrorMessage('Harap masukkan username, NIP/NISN, atau email.');
      return;
    }
    if (!password) {
      setErrorMessage('Harap masukkan kata sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = StorageService.loginUser(account, password);
      setIsLoading(false);
      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.message);
      }
    }, 450);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Username atau NIP/NISN akun wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
        role: regRole,
        jabatan: regJabatan || (regRole === 'admin_sarpras' ? 'Admin Sarpras' : 'Staf'),
        jurusan: regJurusan,
      };

      const res = StorageService.registerUser(newUser);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMessage('Pendaftaran berhasil! Akun langsung diaktifkan.');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Banner Accent */}
      <div className="w-full bg-[#0B1E48] text-white py-2 px-4 border-b border-blue-900/60 text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-blue-200">
            <span className="flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-amber-400" />
              NPSN: <strong className="text-white">69972998</strong> • Akreditasi A (Unggul)
            </span>
            <span className="hidden md:inline text-blue-300">|</span>
            <span className="hidden md:inline">Jl. M.Yusuf-Jl. Swadaya Rt.02 Kel.Teluk Makmur Kec. Medang Kampai, Kota Dumai, Riau</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200">
            <span>Tahun Ajaran 2025/2026</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-amber-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Bantuan Sarpras
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container with Blue & White Archetype */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT PANEL: Deep Royal Blue Brand & School Identity (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0F296D] via-[#0A1D56] to-[#041033] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Geometric Background Watermarks */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            
            {/* Watermark Hexagon Outline */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5 pointer-events-none">
              <SchoolLogo size="2xl" className="w-full h-full" showShadow={false} />
            </div>

            {/* Top School Brand Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                  <SchoolLogo size="lg" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                    Pemerintah Provinsi Riau
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                    SMK NEGERI 6 DUMAI
                  </h1>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>SIM-SARPRAS TERPADU</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  Sistem Informasi Manajemen Sarana & Prasarana
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                  Platform digitalisasi inventaris aset, pencatatan QR Code, pelaporan kerusakan real-time, jadwal pemeliharaan, serta integrasi Google Sheets.
                </p>
              </div>

              {/* Major / Department Badges */}
              <div className="mt-6 pt-6 border-t border-white/15 space-y-2">
                <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                  Program Keahlian Unggulan:
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                    <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Teknik Ketenagalistrikan</span>
                      <span className="text-[10px] text-blue-200">Sistem Tenaga, Instalasi 3-Fasa, PLC & Otomasi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                    <FlaskConical className="w-4 h-4 text-cyan-300 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Teknik Kimia</span>
                      <span className="text-[10px] text-blue-200">Kimia Analisis, Operasi Teknik & Laboratorium Kimia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Security Notice */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2 text-blue-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-tight">Akses resmi terproteksi untuk Pengelola, Pendidik & Staf SMKN 6 Dumai.</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Pure Crisp White Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Switch Mode Tabs (Masuk vs Daftar) */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mode === 'login'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mode === 'register'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                  <School className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-600">SMKN 6 Dumai</span>
                </div>
              </div>

              {/* Status Alert Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* VIEW 1: LOGIN FORM */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Selamat Datang di Portal Sarpras
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Silakan masukkan akun admin atau NIP/NISN dan kata sandi Anda.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Akun / Username / NIP / Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <input
                        type="text"
                        required
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        placeholder="Contoh: admin atau 19790815..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900 placeholder-slate-400 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4 text-blue-600" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun"
                        className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900 placeholder-slate-400 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600 font-medium">Ingat Sesi di Perangkat Ini</span>
                    </label>
                  </div>

                  <div className="pt-3 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Masuk ke Dashboard SIM-SARPRAS</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>

                    {onContinueAsGuest && (
                      <button
                        type="button"
                        onClick={onContinueAsGuest}
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>Masuk Langsung ke Dashboard (Publik / Tamu)</span>
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* VIEW 2: REGISTRATION FORM ("BISA DI DAFTAR") */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Registrasi Akun Baru SIM-SARPRAS
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftarkan akun administrator, waka, guru kejuruan, atau staf sekolah.
                    </p>
                  </div>

                  {/* Role Selector Badges */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Hak Akses / Peran
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRolePreset('admin_sarpras')}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                          regRole === 'admin_sarpras'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Admin Sarpras
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRolePreset('waka_sarpras')}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                          regRole === 'waka_sarpras'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Waka Sarpras
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRolePreset('guru')}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                          regRole === 'guru'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Guru / Ka. Bengkel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRolePreset('siswa')}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                          regRole === 'siswa'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Staf / Siswa
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap & Gelar
                      </label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Contoh: Rahmat Hidayat, S.T."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Username / NIP / NISN Akun
                      </label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="Contoh: admin.sarpras / 1982..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jurusan / Bidang Kerja
                      </label>
                      <select
                        value={regJurusan}
                        onChange={(e) => setRegJurusan(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="Teknik Ketenagalistrikan">Teknik Ketenagalistrikan</option>
                        <option value="Teknik Kimia">Teknik Kimia</option>
                        <option value="Sarpras / Umum">Sarpras & Tata Usaha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Resmi (Opsional)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nama@smkn6dumai.sch.id"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Buat Kata Sandi
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Konfirmasi Kata Sandi
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Daftarkan Akun Baru & Langsung Masuk</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Institutional Assurance */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>© 2026 Sarpras SMK Negeri 6 Dumai. All rights reserved.</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">Versi Web 3.0</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  Panduan Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Modal / Forgot Password Info */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Bantuan Akses Akun Sarpras</h4>
                <p className="text-xs text-slate-500">SMK Negeri 6 Kota Dumai</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Akun administrator dan guru diberikan oleh <strong>Bagian Sarana & Prasarana</strong>. Jika Anda lupa kata sandi atau ingin mengaktifkan akun baru, Anda dapat mendaftar langsung melalui tab <em>"Daftar Akun Baru"</em> atau menghubungi tim teknis sarpras:
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-800">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Waka Sarpras:</strong> Bambang Trianto, S.T., M.Kom.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Layanan WhatsApp:</strong> 0812-7654-3210</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Email:</strong> sarpras@smkn6dumai.sch.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Lokasi:</strong> Gedung Utama Lantai 1, SMKN 6 Dumai</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
