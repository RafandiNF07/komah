'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useOrderForm } from '@/lib/hooks/useOrderForm';
import { orderService } from '@/lib/services/orderService';
import { OrderHeader } from '@/components/order/OrderHeader';
import { OrderSummaryCard } from '@/components/order/OrderSummaryCard';
import { translateError } from '@/lib/errors/errorHandler';

// Import MapPicker dynamically to prevent SSR/Leaflet window not found error
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function RideOrderPage() {
  const router = useRouter();
  
  const {
    user,
    isLoading,
    setIsLoading,
    pickupTime,
    whatsappNumber,
    notes,
    pickup,
    destination,
    distance,
    price,
    error,
    setError,
    register,
    handleSubmit,
    errors,
    handleTimeChange,
    handleDualLocationSelect,
    getParsedPickupTime
  } = useOrderForm('bike');

  const onSubmit = async (data) => {
    setError('');

    if (!pickup) {
      setError('Silakan pilih titik penjemputan pada peta.');
      return;
    }
    if (!destination) {
      setError('Silakan pilih titik tujuan pada peta.');
      return;
    }

    setIsLoading(true);
    try {
      const targetTime = getParsedPickupTime();
      await orderService.createOrder({
        customerId: user.id,
        type: 'bike',
        price,
        distance,
        notes: data.notes,
        pickup,
        destination,
        targetTime,
        serviceDetails: {
          whatsapp_number: data.whatsappNumber,
        }
      });

      router.push('/user/history?success=true');
    } catch (err) {
      const appError = translateError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[850px] mx-auto pb-4">
      <OrderHeader 
        title="Buat Pesanan"
        highlightTitle="Antar/Jemput"
        description="Pesan ojek kampus dengan mudah dan cepat."
        icon="/icons/bike.png"
        iconBgClass="bg-tertiary/20"
      />

      {(error || errors.pickupTime || errors.whatsappNumber) && (
        <div className="mb-4 p-4 bg-cancel/10 border border-cancel/30 rounded-xl text-danger text-[13px] font-label-mono space-y-1">
          {error && <div>{error}</div>}
          {errors.pickupTime && <div>* Jam Penjemputan: {errors.pickupTime.message}</div>}
          {errors.whatsappNumber && <div>* Nomor WhatsApp: {errors.whatsappNumber.message}</div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Unified Dual Map Picker */}
            <MapPicker
              mode="dual"
              pickupLabel="Titik Penjemputan"
              destinationLabel="Titik Tujuan"
              onDualLocationSelect={handleDualLocationSelect}
            />

            {/* Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Penjemputan</label>
                <div className="relative flex items-center">
                  <Image src="/icons/time.png" alt="time" width={20} height={20} className="absolute left-4" />
                  <input 
                    type="text" 
                    placeholder="08:30" 
                    maxLength="5"
                    {...register('pickupTime', { onChange: handleTimeChange })}
                    className={`w-full pl-11 pr-4 py-3 bg-surface-container-high border rounded-xl text-primary placeholder:text-outline/50 font-body-md text-[14px] focus:outline-none ${errors.pickupTime ? 'border-cancel' : 'border-outline-variant/50 focus:border-tertiary'}`} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nomor WhatsApp</label>
                <div className="relative flex items-center">
                  <Image src="/icons/whatsapp1.png" alt="whatsapp" width={20} height={20} className="absolute left-4" />
                  <input 
                    type="tel" 
                    placeholder="Contoh: 08123456789" 
                    {...register('whatsappNumber')}
                    className={`w-full pl-11 pr-4 py-3 bg-surface-container-high border rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:outline-none ${errors.whatsappNumber ? 'border-cancel' : 'border-outline-variant/50 focus:border-tertiary'}`} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Catatan Tambahan (Opsional)</label>
              <textarea 
                rows="2" 
                placeholder="Contoh: Saya pakai jaket hitam, tunggu di depan pagar." 
                {...register('notes')}
                className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <OrderSummaryCard 
            distance={distance}
            price={price}
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            disabled={!pickup || !destination}
            btnColorClass="bg-tertiary text-on-tertiary"
            hoverShadowClass="hover:shadow-[0_0_15px_rgba(240,192,82,0.4)]"
          />
        </div>
      </div>
    </div>
  );
}