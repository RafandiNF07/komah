import { OSRM_BASE_URL } from './constants';

/**
 * Menghitung rute antara dua titik menggunakan OSRM API.
 * @param {number} pickupLat - Latitude titik penjemputan
 * @param {number} pickupLng - Longitude titik penjemputan
 * @param {number} destLat - Latitude titik tujuan
 * @param {number} destLng - Longitude titik tujuan
 * @returns {Promise<{distance: number, duration: number, geometry: [number, number][]}>} distance dalam km, duration dalam menit, geometry untuk polyline
 */
export async function calculateRoute(pickupLat, pickupLng, destLat, destLng) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // Batas waktu 4 detik

  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Tidak dapat menemukan rute antara kedua lokasi.');
    }

    const route = data.routes[0];
    
    // Map GeoJSON [lng, lat] to Leaflet [lat, lng]
    const coordinates = route.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];

    return {
      distance: parseFloat((route.distance / 1000).toFixed(2)), // meter → km
      duration: Math.ceil(route.duration / 60), // detik → menit
      geometry: coordinates,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('OSRM calculateRoute error, using Haversine fallback:', error);
    
    // Fallback Darurat: Gunakan jarak garis lurus matematika jika OSRM mati
    const fallbackDistance = calculateHaversineDistance(pickupLat, pickupLng, destLat, destLng);
    
    return {
      distance: fallbackDistance,
      duration: Math.ceil(fallbackDistance * 3), // Estimasi kasar 3 menit per kilometer
      geometry: [[pickupLat, pickupLng], [destLat, destLng]], // Hubungkan dua titik langsung
      isFallback: true
    };
  }
}

/**
 * Menghitung jarak garis lurus antara dua titik koordinat (Formula Haversine).
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}
