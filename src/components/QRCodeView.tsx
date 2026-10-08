import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { AssetItem, ActiveTab } from '../types';
import {
  QrCode,
  Camera,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  ArrowRight,
  RefreshCw,
  Upload,
  Layers,
  StopCircle,
  Play,
  Share2,
} from 'lucide-react';

interface QRCodeViewProps {
  assets: AssetItem[];
  selectedAssetForQR: AssetItem | null;
  onSelectAsset: (asset: AssetItem | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onPreloadDamageReport: (asset: AssetItem) => void;
  onPreloadLoan: (asset: AssetItem) => void;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  assets,
  selectedAssetForQR,
  onSelectAsset,
  setActiveTab,
  onPreloadDamageReport,
  onPreloadLoan,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'generator' | 'scanner'>('generator');

  // Generator State
  const [selectedAsset, setSelectedAsset] = useState<AssetItem>(selectedAssetForQR || assets[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchQrUrls, setBatchQrUrls] = useState<{ [id: string]: string }>({});

  // Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<AssetItem | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Update selected asset when props change
  useEffect(() => {
    if (selectedAssetForQR) {
      setSelectedAsset(selectedAssetForQR);
      setActiveTabMode('generator');
    }
  }, [selectedAssetForQR]);

  // Generate QR for single selected asset
  useEffect(() => {
    if (!selectedAsset) return;
    const qrPayload = JSON.stringify({
      app: 'SIM-SARPRAS-SMKN6-DUMAI',
      kode: selectedAsset.kode,
      id: selectedAsset.id,
      nama: selectedAsset.nama,
    });

    QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [selectedAsset]);

  // Generate Batch QRs
  useEffect(() => {
    if (!isBatchMode || batchSelectedIds.length === 0) return;

    const generateBatch = async () => {
      const urls: { [id: string]: string } = {};
      for (const id of batchSelectedIds) {
        const item = assets.find((a) => a.id === id);
        if (item) {
          const payload = JSON.stringify({
            app: 'SIM-SARPRAS-SMKN6-DUMAI',
            kode: item.kode,
            id: item.id,
            nama: item.nama,
          });
          urls[id] = await QRCode.toDataURL(payload, { width: 180, margin: 1 });
        }
      }
      setBatchQrUrls(urls);
    };

    generateBatch();
  }, [isBatchMode, batchSelectedIds, assets]);

  // Handle Camera QR Scanning
  const startScanner = async () => {
    setCameraError(null);
    setScannedResult(null);
    setScannedAsset(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tickScanner);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(`Kamera tidak dapat diakses (${msg}). Anda dapat mengunggah gambar QR atau menggunakan tombol uji coba scan.`);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsScanning(false);
  };

  const tickScanner = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleScanPayload(code.data);
            stopScanner();
            return;
          }
        }
      }
    }
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tickScanner);
    }
  };

  // Process scanned text (JSON or plain kode)
  const handleScanPayload = (rawData: string) => {
    setScannedResult(rawData);
    let matched: AssetItem | undefined;

    try {
      const parsed = JSON.parse(rawData);
      if (parsed.kode) {
        matched = assets.find((a) => a.kode === parsed.kode || a.id === parsed.id);
      }
    } catch {
      matched = assets.find((a) => a.kode === rawData.trim() || a.id === rawData.trim());
    }

    if (!matched) {
      // Fallback partial search
      matched = assets.find((a) => rawData.includes(a.kode));
    }

    if (matched) {
      setScannedAsset(matched);
    }
  };

  // Upload QR Image File Scan Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code) {
            handleScanPayload(code.data);
          } else {
            alert('Tidak ditemukan QR Code valid dalam gambar yang diunggah.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">QR Code Aset & Scanner</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencetakan stiker identitas barcode QR aset dan pemindai fisik berbasis kamera perangkat.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => {
              setActiveTabMode('generator');
              stopScanner();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabMode === 'generator'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Stiker QR</span>
          </button>
          <button
            onClick={() => setActiveTabMode('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabMode === 'scanner'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Pemindai</span>
          </button>
        </div>
      </div>

      {/* MODE 1: QR CODE GENERATOR & PRINT BADGE */}
      {activeTabMode === 'generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Asset Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Pilih Aset untuk Dibuatkan QR</h3>
                <button
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {isBatchMode ? 'Mode Tunggal' : 'Cetak Banyak (Batch)'}
                </button>
              </div>

              {!isBatchMode ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Daftar Barang Tersedia:</label>
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {assets.map((item) => {
                      const isSelected = selectedAsset.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAsset(item)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 truncate">{item.nama}</span>
                            <span className="font-mono text-[10px] text-blue-600 font-semibold">
                              {item.kode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.ruanganNama}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Pilih beberapa item:</span>
                    <button
                      onClick={() => setBatchSelectedIds(assets.map((a) => a.id))}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Pilih Semua ({assets.length})
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {assets.map((item) => {
                      const checked = batchSelectedIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 text-xs hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBatchSelectedIds([...batchSelectedIds, item.id]);
                              } else {
                                setBatchSelectedIds(batchSelectedIds.filter((id) => id !== item.id));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 block truncate">{item.nama}</span>
                            <span className="font-mono text-[10px] text-slate-400">{item.kode}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right 2 Cols: Stiker Preview & Print Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Format Label Stiker Inventaris Resmi</h3>
                    <p className="text-xs text-slate-400">Siap cetak ke kertas stiker label thermal atau vinyl anti-air</p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Label Sekarang</span>
                  </button>
                </div>

                {/* THE OFFICIAL PRINTABLE LABEL BADGE */}
                {!isBatchMode ? (
                  <div
                    id="printable-qr-sticker"
                    className="w-full max-w-md bg-white border-2 border-slate-900 rounded-xl p-4 shadow-md text-slate-900 font-sans relative overflow-hidden"
                  >
                    {/* Header Label */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900">
                      <div className="w-10 h-10 bg-[#0F172A] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                        6D
                      </div>
                      <div className="leading-tight">
                        <h4 className="font-extrabold text-xs tracking-wider uppercase">SMK NEGERI 6 DUMAI</h4>
                        <p className="text-[10px] font-semibold text-slate-600">
                          LABEL ASET SARANA & PRASARANA
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                          TA {selectedAsset.tahunPerolehan}
                        </span>
                      </div>
                    </div>

                    {/* Body Badge with QR and Asset details */}
                    <div className="flex items-center gap-4 py-3.5">
                      <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-lg shadow-inner">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Asset QR Code"
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-slate-100 animate-pulse rounded" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1 text-xs">
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase">Nama Barang</span>
                          <p className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-2">
                            {selectedAsset.nama}
                          </p>
                        </div>

                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase">Kode Register</span>
                          <p className="font-mono font-bold text-blue-900 text-xs tracking-wide">
                            {selectedAsset.kode}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                          <div>
                            <span className="text-slate-400 block">Ruangan:</span>
                            <span className="font-semibold truncate block">{selectedAsset.ruanganNama}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Kondisi:</span>
                            <span className="font-semibold text-emerald-700">{selectedAsset.kondisi}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                      <span>Dilarang merusak atau memindahkan label</span>
                      <span className="font-mono">sim-sarpras.smkn6dumai</span>
                    </div>
                  </div>
                ) : (
                  /* Batch Printable Grid */
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-2">
                    {batchSelectedIds.map((id) => {
                      const item = assets.find((a) => a.id === id);
                      if (!item) return null;
                      const url = batchQrUrls[id];

                      return (
                        <div
                          key={id}
                          className="border border-slate-900 rounded-lg p-2.5 bg-white flex items-center gap-3 text-xs"
                        >
                          {url ? (
                            <img src={url} alt={item.kode} className="w-16 h-16 shrink-0" />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 animate-pulse rounded" />
                          )}
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-[9px] font-bold text-slate-500">SMKN 6 DUMAI</span>
                            <p className="font-bold text-slate-900 text-[11px] truncate">{item.nama}</p>
                            <p className="font-mono text-[10px] text-blue-700 font-semibold">{item.kode}</p>
                            <p className="text-[10px] text-slate-500 truncate">{item.ruanganNama}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CAMERA QR SCANNER */}
      {activeTabMode === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Video Viewport & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pemindai QR Code Kamera</h3>
                <p className="text-xs text-slate-400">Arahkan kamera ke stiker QR aset sekolah</p>
              </div>

              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Matikan Kamera</span>
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Play className="w-4 h-4" />
                  <span>Aktifkan Kamera</span>
                </button>
              )}
            </div>

            {/* Video Viewfinder Container */}
            <div className="relative w-full aspect-square max-w-[340px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Target Overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-400 rounded-xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-blue-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-blue-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-blue-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-blue-400" />
                    <div className="w-full h-0.5 bg-blue-400 animate-pulse mt-24 shadow-sm" />
                  </div>
                </div>
              )}

              {!isScanning && (
                <div className="p-6 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs">Kamera dalam keadaan tidak aktif.</p>
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    Mulai Memindai
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Fallback Upload & Quick Simulation */}
            <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 cursor-pointer font-semibold">
                <Upload className="w-4 h-4" />
                <span>Unggah Gambar QR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Quick simulation buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Uji Scan Demo:</span>
                <button
                  onClick={() => handleScanPayload(assets[0]?.kode || '')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono text-[10px]"
                >
                  {assets[0]?.kode.slice(-7)}
                </button>
                <button
                  onClick={() => handleScanPayload(assets[2]?.kode || '')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono text-[10px]"
                >
                  {assets[2]?.kode.slice(-7)}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Scanned Result Card & Instant Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Hasil Pemindaian Aset</h3>
                {scannedAsset && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Aset Ditemukan
                  </span>
                )}
              </div>

              {scannedAsset ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs text-blue-800 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                          {scannedAsset.kode}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-1">
                          {scannedAsset.nama}
                        </h4>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          scannedAsset.kondisi === 'Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {scannedAsset.kondisi}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ruangan / Bengkel:</span>
                        <span className="font-semibold text-slate-800">{scannedAsset.ruanganNama}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Jurusan:</span>
                        <span className="font-semibold text-slate-800">{scannedAsset.jurusan}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Status Ketersediaan:</span>
                        <span className="font-semibold text-blue-700">{scannedAsset.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Jumlah Terdaftar:</span>
                        <span className="font-semibold text-slate-800">
                          {scannedAsset.jumlah} {scannedAsset.satuan}
                        </span>
                      </div>
                    </div>

                    {scannedAsset.spesifikasi && (
                      <div className="pt-2 border-t border-blue-200/60 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Spesifikasi: </span>
                        {scannedAsset.spesifikasi}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons for the scanned asset */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        onPreloadDamageReport(scannedAsset);
                        setActiveTab('laporan-kerusakan');
                      }}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Ajukan Laporan Kerusakan untuk Aset Ini</span>
                    </button>

                    <button
                      onClick={() => {
                        onPreloadLoan(scannedAsset);
                        setActiveTab('peminjaman');
                      }}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Ajukan Peminjaman Aset Ini</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs">Belum ada QR Code yang dipindai.</p>
                  <p className="text-[11px] text-slate-400">
                    Nyalakan kamera atau klik salah satu tombol uji demo di sebelah kiri untuk melihat detail aset.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
