import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '@/lib/hooks/useProfile';
import { calculatePrice } from '@/lib/pricing';
import { orderSchema } from '@/lib/validators/schemas';

export function useOrderForm(serviceType) {
  const { profile, user, loading: loadingProfile } = useProfile();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Location states
  const [pickup, setPickup] = useState(null); // { lat, lng, address }
  const [destination, setDestination] = useState(null); // { lat, lng, address }
  
  // Pricing states
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');

  // React Hook Form initialization
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pickupTime: '',
      whatsappNumber: '',
      notes: '',
      recipientName: '',
      restaurantName: '',
    }
  });

  // Watch form fields
  const pickupTime = watch('pickupTime');
  const whatsappNumber = watch('whatsappNumber');
  const notes = watch('notes');

  // Autofill WhatsApp number when profile loaded
  useEffect(() => {
    if (profile) {
      setValue('whatsappNumber', profile.phone_number || '');
    }
  }, [profile, setValue]);

  // Handle dual location select for bike, delivery, and food
  const handleDualLocationSelect = useCallback(({ pickup, destination, distance }) => {
    setPickup(pickup);
    setDestination(destination);
    setDistance(distance);
    setPrice(calculatePrice(distance, serviceType));
  }, [serviceType]);

  // Handle single location select for helper
  const handleSingleLocationSelect = useCallback((loc) => {
    setPickup(loc);
    setPrice(calculatePrice(0, serviceType));
  }, [serviceType]);

  // Format and limit time input to HH:MM automatically
  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length >= 1) {
      if (parseInt(value[0]) > 2) value = '2';
    }
    if (value.length >= 2) {
      if (parseInt(value[0]) === 2 && parseInt(value[1]) > 3) {
        value = '23';
      }
    }
    if (value.length >= 3) {
      if (parseInt(value[2]) > 5) {
        value = value.slice(0, 2) + '5';
      }
    }
    if (value.length >= 3) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }
    setValue('pickupTime', value);
  };

  /**
   * Helper untuk mengonversi format HH:MM ke tipe TIMESTAMPTZ ISO Date
   */
  const getParsedPickupTime = () => {
    if (!pickupTime) return null;
    const [hours, minutes] = pickupTime.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours || 0, minutes || 0, 0, 0);
    if (targetTime < new Date()) {
      targetTime.setDate(targetTime.getDate() + 1); // Assume tomorrow if time has passed
    }
    return targetTime;
  };

  return {
    user,
    profile,
    loadingProfile,
    isLoading,
    setIsLoading,
    pickupTime,
    whatsappNumber,
    notes,
    pickup,
    setPickup,
    destination,
    setDestination,
    distance,
    setDistance,
    price,
    setPrice,
    error,
    setError,
    register,
    handleSubmit,
    setValue,
    errors,
    handleTimeChange,
    handleDualLocationSelect,
    handleSingleLocationSelect,
    getParsedPickupTime
  };
}
