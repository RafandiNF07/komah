'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useOrderForm } from '@/lib/hooks/useOrderForm';
import { orderService } from '@/lib/services/orderService';
import { PRICING } from '@/lib/constants';
import { OrderHeader } from '@/components/order/OrderHeader';
import { OrderSummaryCard } from '@/components/order/OrderSummaryCard';
import { translateError } from '@/lib/errors/errorHandler';

// Import MapPicker dynamically to prevent SSR/Leaflet window not found error
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function HelperOrderPage() {
  const router = useRouter();

  const {
    user,
    isLoading,
    setIsLoading,
    pickup,
    setPickup,
    error,
    setError,
    register,
    handleSubmit,
    errors,
    handleTimeChange,
    getParsedPickupTime
  } = useOrderForm('helper');

  const onSubmit = async (data) => {
    setError('');

    if (!pickup) {
      setError('Silakan pilih lokasi pengerjaan pada peta.');
      return;
    }

    setIsLoading(true);
    try {
      const targetTime = getParsedPickupTime();
      await orderService.createOrder({
        customerId: user.id,
        type: 'helper',
        price: PRICING.HELPER_MIN_PRICE,
        distance: 0,
        notes: data.notes,
        pickup,
        destination: null,
        targetTime,
        serviceDetails: {
          whatsapp_number: data.whatsappNumber,
          task_description: data.notes,
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
        title="Jasa"
        highlightTitle="Helper"
        description="Bantuan tenaga cepat di sekitar area kampus."
        icon="/icons/helper.png"
        iconBgClass="bg-success/15"
      />

      {(error || errors.pickupTime || errors.whatsappNumber || errors.notes) && (
        <div className="mb-4 p-4 bg-cancel/10 border border-cancel/30 rounded-xl text-danger text-[13px] font-label-mono space-y-1">
          {error && <div>{error}</div>}
          {errors.pickupTime && <div>* Jam Pengerjaan: {errors.pickupTime.message}</div>}
          {errors.whatsappNumber && <div>* Nomor WhatsApp: {errors.whatsappNumber.message}</div>}
          {errors.notes && <div>* Deskripsi Bantuan: {errors.notes.message}</div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Map Picker untuk Lokasi Pengerjaan */}
            <MapPicker
              label="Lokasi Pengerjaan"
              placeholder="Pilih lokasi pengerjaan bantuan pada peta atau gunakan lokasi saat ini"
              markerType="pickup"
              onLocationSelect={(loc) => setPickup(loc)}
            />

            {/* Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Pengerjaan</label>
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
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nomor WhatsApp Anda</label>
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

            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Deskripsi Bantuan yang Dibutuhkan</label>
              <textarea 
                required 
                rows="4" 
                placeholder="Contoh: Butuh 1 orang untuk bantu angkat 2 kotak buku dari lantai 1 ke lantai 3. Waktu pengerjaan sekitar 15 menit." 
                {...register('notes', { required: true })}
                className={`w-full p-4 bg-surface-container-high border rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:outline-none ${errors.notes ? 'border-cancel' : 'border-outline-variant/50 focus:border-tertiary'}`}
              ></textarea>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <OrderSummaryCard 
            distance={0}
            price={PRICING.HELPER_MIN_PRICE}
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            disabled={!pickup}
            showDistance={false}
            priceLabel="Biaya Minimum"
            helperText="*Harga akhir dapat dinegosiasikan langsung dengan Helper tergantung tingkat kesulitan."
            btnColorClass="bg-success text-surface-container"
            hoverShadowClass="hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          />
        </div>
      </div>
    </div>
  );
}