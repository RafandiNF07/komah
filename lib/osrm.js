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
  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
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
    console.error('OSRM calculateRoute error:', error);
    throw error;
  }
}
