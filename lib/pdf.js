import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Terapkan plugin jspdf-autotable ke kelas jsPDF secara eksplisit agar doc.autoTable dapat digunakan
applyPlugin(jsPDF);
import { formatRupiah, formatDate, ORDER_TYPES, ORDER_STATUS } from './constants';

/**
 * Generate struk/bukti order PDF untuk pelanggan.
 * @param {object} order - Data order lengkap dari Supabase
 */
export function generateOrderReceipt(order) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KOMAH', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ojek Kampus Hemat & Aman', 105, 27, { align: 'center' });

  // Divider
  doc.setDrawColor(200);
  doc.line(20, 32, 190, 32);

  // Order Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bukti Pesanan', 20, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const infoY = 52;
  const lineHeight = 7;
  const info = [
    ['No. Pesanan', order.order_number],
    ['Tanggal Order', formatDate(order.created_at)],
    ['Waktu Jemput', formatDate(order.pickup_time)],
    ['Tipe Layanan', ORDER_TYPES[order.type]?.label || order.type],
    ['Status', ORDER_STATUS[order.status]?.label || order.status],
    ['Jarak', order.distance_estimate ? `${order.distance_estimate} km` : '-'],
  ];

  info.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, infoY + i * lineHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, 70, infoY + i * lineHeight);
  });

  // Lokasi
  const lokasiY = infoY + info.length * lineHeight + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Lokasi', 20, lokasiY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Penjemputan: ${order.pickup_location || '-'}`, 20, lokasiY + lineHeight);
  if (order.destination_location) {
    doc.text(`Tujuan: ${order.destination_location}`, 20, lokasiY + lineHeight * 2);
  }

  // Service Details
  if (order.service_details && Object.keys(order.service_details).length > 0) {
    const detailY = lokasiY + lineHeight * 3 + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Detail Layanan', 20, detailY);
    doc.setFont('helvetica', 'normal');

    let currentY = detailY + lineHeight;
    Object.entries(order.service_details).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
      doc.text(`${label}: ${displayValue}`, 20, currentY);
      currentY += lineHeight;
    });
  }

  // Catatan
  if (order.notes) {
    const notesY = doc.internal.pageSize.height - 70;
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan:', 20, notesY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.notes, 20, notesY + lineHeight);
  }

  // Total
  const totalY = doc.internal.pageSize.height - 45;
  doc.setDrawColor(200);
  doc.line(20, totalY - 5, 190, totalY - 5);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Harga', 20, totalY);
  doc.text(formatRupiah(order.total_price), 190, totalY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Dokumen ini dibuat otomatis oleh sistem KOMAH.', 105, doc.internal.pageSize.height - 15, { align: 'center' });

  // Download
  doc.save(`KOMAH_Struk_${order.order_number}.pdf`);
}

/**
 * Generate laporan pendapatan PDF untuk driver.
 * @param {object[]} orders - Array data order completed
 * @param {string} period - Label periode ("Hari Ini", "Minggu Ini", "Bulan Ini")
 */
export function generateDriverReport(orders, period) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KOMAH', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Pendapatan Driver', 105, 27, { align: 'center' });

  // Divider
  doc.setDrawColor(200);
  doc.line(20, 32, 190, 32);

  // Period & Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Periode: ${period}`, 20, 42);

  const totalEarnings = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Trip: ${orders.length}`, 20, 52);
  doc.text(`Total Pendapatan: ${formatRupiah(totalEarnings)}`, 20, 59);

  // Table
  const tableData = orders.map((order, index) => [
    index + 1,
    order.order_number,
    formatDate(order.created_at),
    ORDER_TYPES[order.type]?.label || order.type,
    order.pickup_location || '-',
    formatRupiah(order.total_price),
  ]);

  doc.autoTable({
    startY: 68,
    head: [['#', 'No. Order', 'Tanggal', 'Layanan', 'Lokasi', 'Harga']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [47, 74, 112], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      5: { halign: 'right' },
    },
  });

  // Total row
  const finalY = doc.lastAutoTable.finalY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Pendapatan:', 20, finalY);
  doc.text(formatRupiah(totalEarnings), 190, finalY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text(
    `Dicetak pada: ${formatDate(new Date().toISOString())} — Dokumen ini dibuat otomatis oleh sistem KOMAH.`,
    105,
    doc.internal.pageSize.height - 15,
    { align: 'center' }
  );

  // Download
  doc.save(`KOMAH_Laporan_${period.replace(/\s/g, '_')}.pdf`);
}
