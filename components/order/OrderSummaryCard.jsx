import Image from 'next/image';

export function OrderSummaryCard({ 
  distance, 
  price, 
  isLoading, 
  onSubmit, 
  disabled, 
  btnColorClass = 'bg-tertiary text-on-tertiary',
  hoverShadowClass = 'hover:shadow-[0_0_15px_rgba(240,192,82,0.4)]',
  priceLabel = 'Estimasi Harga',
  helperText = null,
  showDistance = true,
  submitLabel = 'Pesan Sekarang'
}) {
  return (
    <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full sticky top-24">
      <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ringkasan Pesanan</h3>
      
      <div className="space-y-3 flex-1">
        {showDistance && (
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-text-secondary font-body-sm">Jarak Estimasi</span>
            <span className="text-text-primary font-medium">
              {distance > 0 ? `${distance} km` : '-'}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-text-secondary font-body-sm">Pembayaran</span>
          <span className="text-tertiary font-label-mono bg-tertiary/10 px-2 py-0.5 rounded text-[12px]">Tunai (Cash)</span>
        </div>
        {helperText && (
          <p className="text-[12px] text-text-secondary mt-2 border-t border-outline-variant/30 pt-2">
            {helperText}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-outline-variant/30">
        <div className="flex justify-between items-end mb-4">
          <span className="text-text-primary font-headline-sm text-[14px]">{priceLabel}</span>
          <span className="text-[18px] font-bold text-tertiary font-label-mono">
            {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : '-'}
          </span>
        </div>
        
        <button 
          onClick={onSubmit} 
          disabled={disabled || isLoading} 
          className={`w-full py-3.5 ${btnColorClass} font-bold rounded-xl shadow-lg transition-all duration-300 font-headline-sm text-[16px] flex justify-center items-center gap-2 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : `hover:-translate-y-1 ${hoverShadowClass} active:scale-95`}`}
        >
          {isLoading ? (
            <>
              <Image 
                src="/icons/loading.png" 
                alt="loading" 
                width={20} 
                height={20} 
                className="animate-spin object-contain" 
              />
              Mencari Driver...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}
