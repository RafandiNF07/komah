import Image from 'next/image';

export function OrderHeader({ title, highlightTitle, description, icon, iconBgClass }) {
  return (
    <div className="mb-6">
      <button 
        onClick={() => window.history.back()} 
        className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors mb-4 group font-body-sm w-fit"
      >
        <Image 
          src="/icons/back.png" 
          alt="kembali" 
          width={20} 
          height={20} 
          className="transition-all duration-200 group-hover:-translate-x-1 opacity-70 group-hover:opacity-100" 
        />
        <span className="font-medium text-[14px]">Kembali</span>
      </button>

      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClass}`}>
          <Image
            src={icon} 
            alt="service icon"
            width={30}
            height={30}
            className="object-contain" 
          />
        </div>
        <div>
          <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
            {title} <span className="text-tertiary">{highlightTitle}</span>
          </h1>
          <p className="font-body-sm text-[14px] text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}
