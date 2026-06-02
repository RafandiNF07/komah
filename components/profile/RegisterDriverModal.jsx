import Image from 'next/image';

export default function RegisterDriverModal({
  show,
  onClose,
  onSubmit,
  vehicleType,
  setVehicleType,
  licensePlate,
  setLicensePlate,
  isLoading
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/50 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in relative">
        <h3 className="font-headline-md text-[20px] font-bold text-text-primary mb-2 flex items-center gap-2">
          <Image src="/icons/drivers.png" alt="driver" width={24} height={24} />
          Daftar Sebagai Mitra Driver
        </h3>
        <p className="font-body-sm text-[13px] text-text-secondary mb-5 leading-relaxed">
          Lengkapi data kendaraan Anda di bawah ini untuk mengaktifkan akun driver dan mulai menerima pesanan.
        </p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Jenis Kendaraan</label>
            <input 
              type="text" 
              placeholder="Contoh: Honda Beat, Yamaha Mio"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] focus:border-tertiary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Plat Nomor Kendaraan</label>
            <input 
              type="text" 
              placeholder="Contoh: AB 1234 CD"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] focus:border-tertiary focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-close text-primary font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all font-label-mono text-[13px] disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-tertiary/30 transition-all font-label-mono text-[13px] disabled:opacity-50"
            >
              {isLoading ? 'Mendaftar...' : 'Daftar & Beralih'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
