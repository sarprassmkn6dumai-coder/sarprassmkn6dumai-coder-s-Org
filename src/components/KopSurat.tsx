import React from 'react';

interface KopSuratProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLeftLogo?: boolean;
  showRightLogo?: boolean;
  customAddress?: string;
  customPhone?: string;
  customEmail?: string;
  customWebsite?: string;
  customNpsn?: string;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  className = '',
  size = 'md',
  showLeftLogo = true,
  showRightLogo = true,
  customAddress,
  customPhone,
  customEmail,
  customWebsite,
  customNpsn,
}) => {
  const address =
    customAddress || 'JL. Swadaya, Kel. Teluk Makmur, Kec. Medang Kampai Dumai – Riau 28825';
  const phone = customPhone || '085265298697';
  const email = customEmail || 'smkn6dumai2023@gmail.com';
  const website = customWebsite || 'https://smkn6dumai.sch.id';
  const npsn = customNpsn || '69972998';

  const logoSizeClass =
    size === 'sm'
      ? 'w-12 h-14 sm:w-14 sm:h-16'
      : size === 'lg'
      ? 'w-20 h-24 sm:w-24 sm:h-28'
      : 'w-16 h-20 sm:w-20 sm:h-24';

  return (
    <header
      className={`w-full text-black select-none font-serif ${className}`}
      style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
    >
      {/* Logos and Center Headings */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-1 sm:px-2">
        {/* Left Logo: Lambang Provinsi Riau */}
        {showLeftLogo ? (
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/logo-riau.svg"
              alt="Lambang Provinsi Riau"
              className={`${logoSizeClass} object-contain`}
              loading="eager"
            />
          </div>
        ) : (
          <div className={`${logoSizeClass} shrink-0 opacity-0`} />
        )}

        {/* Center Typography matching official government standard */}
        <div className="flex-1 text-center leading-tight">
          <h3
            className={`font-bold uppercase tracking-wider text-black ${
              size === 'sm'
                ? 'text-xs sm:text-sm'
                : size === 'lg'
                ? 'text-sm sm:text-lg'
                : 'text-xs sm:text-base'
            }`}
          >
            PEMERINTAH PROVINSI RIAU
          </h3>
          <h2
            className={`font-bold uppercase tracking-wider text-black ${
              size === 'sm'
                ? 'text-sm sm:text-base'
                : size === 'lg'
                ? 'text-base sm:text-xl'
                : 'text-sm sm:text-lg'
            }`}
          >
            DINAS PENDIDIKAN
          </h2>
          <h1
            className={`font-black uppercase tracking-normal text-black ${
              size === 'sm'
                ? 'text-base sm:text-lg'
                : size === 'lg'
                ? 'text-xl sm:text-3xl'
                : 'text-lg sm:text-2xl'
            }`}
          >
            SMK NEGERI 6 DUMAI
          </h1>

          <p
            className={`text-black font-normal mt-0.5 sm:mt-1 ${
              size === 'sm'
                ? 'text-[10px] sm:text-xs'
                : size === 'lg'
                ? 'text-xs sm:text-sm'
                : 'text-[11px] sm:text-xs'
            }`}
          >
            {address}
          </p>

          <p
            className={`text-black font-normal tracking-tight mt-0.5 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-0.5 ${
              size === 'sm'
                ? 'text-[9px] sm:text-[10px]'
                : size === 'lg'
                ? 'text-xs'
                : 'text-[10px] sm:text-[11px]'
            }`}
          >
            <span>
              <strong>Website :</strong>{' '}
              <span className="underline decoration-slate-400">{website}</span>
            </span>
            <span>
              <strong>No HP.</strong> {phone}
            </span>
            <span>
              <strong>Email:</strong> {email}
            </span>
            <span>
              <strong>NPSN :</strong> {npsn}
            </span>
          </p>
        </div>

        {/* Right Logo: Lambang SMK Negeri 6 Dumai */}
        {showRightLogo ? (
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/logo-smkn6.svg"
              alt="Logo SMK Negeri 6 Dumai"
              className={`${logoSizeClass} object-contain`}
              loading="eager"
            />
          </div>
        ) : (
          <div className={`${logoSizeClass} shrink-0 opacity-0`} />
        )}
      </div>

      {/* Official Government Double Border Divider (Garis Pembatas Kop Surat) */}
      <div className="mt-2.5 pb-[2px] border-b-[3px] border-black">
        <div className="border-b border-black"></div>
      </div>
    </header>
  );
};
