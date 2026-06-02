import * as z from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  phoneNumber: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  licensePlate: z.string().optional(),
  vehicleType: z.string().optional(),
});

export const orderSchema = z.object({
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam harus HH:MM (contoh: 08:30)'),
  whatsappNumber: z.string().min(10, 'Nomor WhatsApp tidak valid (minimal 10 digit)'),
  notes: z.string().optional(),
  recipientName: z.string().optional(),
  restaurantName: z.string().optional(),
});
