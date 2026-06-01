import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderRepository } from '../../repositories/orderRepository';
import { orderService } from '../../services/orderService';

/**
 * Custom hook untuk memantau antrean pesanan masuk (Mencari Driver)
 * Dilengkapi dengan auto-polling dan Optimistic UI Updates saat driver mengambil order.
 */
export function useAvailableOrders() {
  const queryClient = useQueryClient();

  // 1. Kueri untuk mengambil antrean orderan aktif (polling setiap 5 detik)
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: orderRepository.fetchAvailableOrders,
    refetchInterval: 5000, // Sinkronisasi otomatis setiap 5 detik
    staleTime: 2000,       // Data dianggap usang setelah 2 detik
  });

  // 2. Mutasi untuk mengambil orderan (take order) secara transaksional
  const takeOrderMutation = useMutation({
    mutationFn: async ({ orderId, driverId }) => {
      return await orderService.takeOrderSecurely(orderId, driverId);
    },
    // Skenario Optimistic UI: langsung hapus pesanan dari UI lokal sebelum server menjawab
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries({ queryKey: ['availableOrders'] });
      
      // Simpan backup data lama untuk rollback jika gagal
      const previousOrders = queryClient.getQueryData(['availableOrders']);

      // Hapus item orderan terpilih secara instan (0ms perception)
      queryClient.setQueryData(['availableOrders'], (old) => 
        old ? old.filter((order) => order.id !== orderId) : []
      );

      return { previousOrders };
    },
    // Jika Supabase menolak (misal: order sudah diambil driver lain), kembalikan data semula
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['availableOrders'], context.previousOrders);
      }
    },
    // Selalu segarkan data asli dari database Supabase setelah selesai
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      queryClient.invalidateQueries({ queryKey: ['activeOrder'] });
    }
  });

  return {
    orders,
    isLoading,
    error,
    takeOrder: takeOrderMutation.mutate,
    isTaking: takeOrderMutation.isPending
  };
}

/**
 * Custom hook untuk memantau satu pesanan aktif milik pengguna (Customer atau Driver)
 */
export function useActiveOrder(role, userId) {
  const queryClient = useQueryClient();

  const { data: activeOrder = null, isLoading, error } = useQuery({
    queryKey: ['activeOrder', role, userId],
    queryFn: async () => {
      if (!userId) return null;
      if (role === 'driver') {
        return await orderRepository.fetchActiveOrderForDriver(userId);
      }
      return await orderRepository.fetchActiveOrderForCustomer(userId);
    },
    enabled: !!userId && !!role,
    refetchInterval: 7000, // Poll status pesanan setiap 7 detik
  });

  // Mutasi untuk memperbarui status pesanan (contoh: accepted -> on_the_way)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      return await orderService.updateOrderStatusSecurely(orderId, status);
    },
    // Optimistic Update: langsung ubah status visual di layar saat tombol diklik
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: ['activeOrder', role, userId] });
      const previousOrder = queryClient.getQueryData(['activeOrder', role, userId]);

      // Perbarui status lokal secara instan
      queryClient.setQueryData(['activeOrder', role, userId], (old) => 
        old ? { ...old, status } : null
      );

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(['activeOrder', role, userId], context.previousOrder);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrder', role, userId] });
    }
  });

  return {
    activeOrder,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
}
