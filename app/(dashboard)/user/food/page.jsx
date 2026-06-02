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

export default function FoodOrderPage() {
  const router = useRouter();

  const {
    user,
    isLoading,
    setIsLoading,
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
  } = useOrderForm('food');

  const onSubmit = async (data) => {
    setError('');

    if (!pickup) {
      setError('Silakan pilih lokasi restoran/kantin pada peta.');
      return;
    }
    if (!destination) {
      setError('Silakan pilih lokasi pengantaran makanan pada peta.');
      return;
    }

    setIsLoading(true);
    try {
      const targetTime = getParsedPickupTime();
      await orderService.createOrder({
        customerId: user.id,
        type: 'food',
        price,
        distance,
        notes: data.notes,
        pickup: {
          ...pickup,
          address: `Resto: ${data.restaurantName} (${pickup.address})`
        },
        destination,
        targetTime,
        serviceDetails: {
          whatsapp_number: data.whatsappNumber,
          restaurant_name: data.restaurantName,
          food_items: data.notes,
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
        title="Pesan"
        highlightTitle="KOMAH Food"
        description="Driver kami siap membelikan makanan kesukaanmu."
        icon="/icons/fast_food.png"
        iconBgClass="bg-orange/20"
      />

      {(error || errors.pickupTime || errors.whatsappNumber || errors.restaurantName || errors.notes) && (
        <div className="mb-4 p-4 bg-cancel/10 border border-cancel/30 rounded-xl text-danger text-[13px] font-label-mono space-y-1">
          {error && <div>{error}</div>}
          {errors.pickupTime && <div>* Jam Pengantaran: {errors.pickupTime.message}</div>}
          {errors.whatsappNumber && <div>* Nomor WhatsApp: {errors.whatsappNumber.message}</div>}
          {errors.restaurantName && <div>* Nama Resto: {errors.restaurantName.message}</div>}
          {errors.notes && <div>* Detail Menu: {errors.notes.message}</div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Nama Resto */}
            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nama Resto</label>
              <div className="relative flex items-center">
                <Image src="/icons/store.png" alt="store" width={23} height={23} className="absolute left-3" />
                <input 
                  type="text" 
                  placeholder="Contoh: Kantin Teknik (Mpok Siti)" 
                  {...register('restaurantName', { required: true })}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-container-high border rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:outline-none ${errors.restaurantName ? 'border-cancel' : 'border-outline-variant/50 focus:border-tertiary'}`} 
                />
              </div>
            </div>

            {/* Detail Pesanan */}
            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Detail Pesanan (Menu & Jumlah)</label>
              <textarea 
                required 
                rows="3" 
                placeholder="Contoh: 1x Nasi Goreng Ayam (Pedas)&#10;1x Es Teh Manis" 
                {...register('notes', { required: true })}
                className={`w-full p-4 bg-surface-container-high border rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:outline-none ${errors.notes ? 'border-cancel' : 'border-outline-variant/50 focus:border-tertiary'}`}
              ></textarea>
            </div>

            {/* Unified Dual Map Picker */}
            <MapPicker
              mode="dual"
              pickupLabel="Lokasi Restoran / Kantin"
              destinationLabel="Titik Pengantaran Makanan"
              onDualLocationSelect={handleDualLocationSelect}
            />

            {/* Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Pengantaran</label>
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
          </form>
        </div>

        <div className="space-y-6">
          <OrderSummaryCard 
            distance={distance}
            price={price}
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            disabled={!pickup || !destination}
            priceLabel="Biaya Antar"
            helperText="*Harga makanan dibayar terpisah sesuai nota kantin/resto ke driver."
            btnColorClass="bg-tertiary text-on-tertiary"
            hoverShadowClass="hover:shadow-[0_0_15px_rgba(240,192,82,0.4)]"
          />
        </div>
      </div>
    </div>
  );
}