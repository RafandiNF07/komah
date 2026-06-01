'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '@/lib/constants';
import { calculateRoute } from '@/lib/osrm';

// Fix Leaflet default icon issue dengan Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pickupIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Reverse geocoding menggunakan Nominatim (OpenStreetMap).
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'id' } }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Komponen internal untuk menangani klik pada peta.
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

/**
 * Komponen internal untuk melakukan auto-zoom & fit bounds.
 */
function MapRefitter({ pickup, destination, geometry }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], map.getZoom());
    } else if (destination) {
      map.setView([destination.lat, destination.lng], map.getZoom());
    }
  }, [pickup, destination, map]);
  return null;
}

/**
 * MapPicker - Komponen peta untuk memilih lokasi.
 * Mendukung mode tunggal (single) dan mode ganda (dual) dengan gambar rute.
 */
export default function MapPicker({
  mode = 'single',
  // Props untuk Single Mode
  label,
  onLocationSelect,
  markerType = 'pickup',
  placeholder = 'Klik peta untuk memilih lokasi',
  initialPosition = null,

  // Props untuk Dual Mode
  pickupLabel = 'Titik Penjemputan',
  destinationLabel = 'Titik Tujuan',
  onDualLocationSelect,
  initialPickup = null,
  initialDestination = null,
}) {
  const [position, setPosition] = useState(initialPosition);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Dual mode states
  const [pickup, setPickup] = useState(initialPickup);
  const [destination, setDestination] = useState(initialDestination);
  const [activeSelect, setActiveSelect] = useState('pickup'); // 'pickup' atau 'destination'
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const icon = markerType === 'pickup' ? pickupIcon : destinationIcon;

  // Sync initial values asynchronously to prevent cascading renders
  useEffect(() => {
    if (initialPickup) {
      const timer = setTimeout(() => {
        setPickup(prev => {
          if (!prev || prev.lat !== initialPickup.lat || prev.lng !== initialPickup.lng) {
            return initialPickup;
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPickup]);

  useEffect(() => {
    if (initialDestination) {
      const timer = setTimeout(() => {
        setDestination(prev => {
          if (!prev || prev.lat !== initialDestination.lat || prev.lng !== initialDestination.lng) {
            return initialDestination;
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialDestination]);

  // Dual mode route calculation
  useEffect(() => {
    if (mode !== 'dual') return;

    const updateRoute = async () => {
      if (pickup && destination) {
        setCalculatingRoute(true);
        try {
          const route = await calculateRoute(
            pickup.lat,
            pickup.lng,
            destination.lat,
            destination.lng
          );
          setRouteGeometry(route.geometry);
          onDualLocationSelect?.({
            pickup,
            destination,
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
          });
        } catch (err) {
          console.error('Error calculating route in MapPicker:', err);
        } finally {
          setCalculatingRoute(false);
        }
      } else {
        setRouteGeometry([]);
      }
    };

    updateRoute();
  }, [pickup, destination, mode, onDualLocationSelect]);

  const handleMapClick = useCallback(async (latlng) => {
    const { lat, lng } = latlng;
    setLoadingAddress(true);
    const resolvedAddress = await reverseGeocode(lat, lng);
    setLoadingAddress(false);

    if (mode === 'single') {
      setPosition([lat, lng]);
      setAddress(resolvedAddress);
      onLocationSelect?.({ lat, lng, address: resolvedAddress });
    } else {
      if (activeSelect === 'pickup') {
        const newPickup = { lat, lng, address: resolvedAddress };
        setPickup(newPickup);
        if (!destination) {
          setActiveSelect('destination');
        }
      } else {
        const newDestination = { lat, lng, address: resolvedAddress };
        setDestination(newDestination);
        if (!pickup) {
          setActiveSelect('pickup');
        }
      }
    }
  }, [mode, activeSelect, pickup, destination, onLocationSelect]);

  const handleGetCurrentLocation = useCallback((targetType = activeSelect) => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung di browser ini.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLoadingAddress(true);
        const resolvedAddress = await reverseGeocode(latitude, longitude);
        setLoadingAddress(false);
        setGettingLocation(false);

        const newLocation = { lat: latitude, lng: longitude, address: resolvedAddress };

        if (mode === 'single') {
          setPosition([latitude, longitude]);
          setAddress(resolvedAddress);
          onLocationSelect?.(newLocation);
        } else {
          if (targetType === 'pickup') {
            setPickup(newLocation);
            if (!destination) setActiveSelect('destination');
          } else {
            setDestination(newLocation);
            if (!pickup) setActiveSelect('pickup');
          }
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diberikan.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [mode, activeSelect, pickup, destination, onLocationSelect]);

  const handleMarkerDragEnd = useCallback(async (type, event) => {
    const marker = event.target;
    const pos = marker.getLatLng();
    const { lat, lng } = pos;

    setLoadingAddress(true);
    const resolvedAddress = await reverseGeocode(lat, lng);
    setLoadingAddress(false);

    const newLocation = { lat, lng, address: resolvedAddress };

    if (mode === 'single') {
      setPosition([lat, lng]);
      setAddress(resolvedAddress);
      onLocationSelect?.(newLocation);
    } else {
      if (type === 'pickup') {
        setPickup(newLocation);
      } else {
        setDestination(newLocation);
      }
    }
  }, [mode, onLocationSelect]);

  // =========================================================================
  // DUAL MODE RENDER
  // =========================================================================
  if (mode === 'dual') {
    return (
      <div className="space-y-4">
        {/* Dual Input Panels */}
        <div className="space-y-3 bg-surface-container-high/40 p-4 rounded-2xl border border-outline-variant/30">
          {/* Pickup Input Card */}
          <div
            onClick={() => setActiveSelect('pickup')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
              activeSelect === 'pickup'
                ? 'border-tertiary bg-tertiary/10 shadow-md'
                : 'border-outline-variant/50 hover:border-outline-variant bg-surface-container-low/50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0 border border-success/30">
              <Image src="/icons/jemput1.png" alt="pickup" width={18} height={18} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-mono text-[10px] text-text-secondary uppercase tracking-wider">{pickupLabel}</p>
              <p className="font-body-sm text-[13px] text-text-primary truncate font-medium mt-0.5">
                {loadingAddress && activeSelect === 'pickup' ? (
                  <span className="text-text-secondary animate-pulse">Memuat alamat...</span>
                ) : pickup ? (
                  pickup.address
                ) : (
                  'Pilih titik penjemputan di peta...'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGetCurrentLocation('pickup');
              }}
              disabled={gettingLocation}
              className="p-2 hover:bg-surface-container rounded-xl text-text-secondary shrink-0 transition-colors"
              title="Gunakan lokasi saat ini"
            >
              <Image src="/icons/gps.png" alt="gps" width={18} height={18} className="object-contain" />
            </button>
          </div>

          {/* Destination Input Card */}
          <div
            onClick={() => setActiveSelect('destination')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
              activeSelect === 'destination'
                ? 'border-tertiary bg-tertiary/10 shadow-md'
                : 'border-outline-variant/50 hover:border-outline-variant bg-surface-container-low/50'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center shrink-0 border border-danger/25">
              <Image src="/icons/tujuan.png" alt="destination" width={18} height={18} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-mono text-[10px] text-text-secondary uppercase tracking-wider">{destinationLabel}</p>
              <p className="font-body-sm text-[13px] text-text-primary truncate font-medium mt-0.5">
                {loadingAddress && activeSelect === 'destination' ? (
                  <span className="text-text-secondary animate-pulse">Memuat alamat...</span>
                ) : destination ? (
                  destination.address
                ) : (
                  'Pilih titik tujuan di peta...'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGetCurrentLocation('destination');
              }}
              disabled={gettingLocation}
              className="p-2 hover:bg-surface-container rounded-xl text-text-secondary shrink-0 transition-colors"
              title="Gunakan lokasi saat ini"
            >
              <Image src="/icons/gps.png" alt="gps" width={18} height={18} className="object-contain" />
            </button>
          </div>
        </div>

        {/* Map Display Panel */}
        <div className="rounded-2xl overflow-hidden border border-outline-variant/30 h-[280px] relative shadow-lg">
          {calculatingRoute && (
            <div className="absolute inset-0 bg-surface-container/60 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-2">
              <Image src="/icons/loading.png" alt="loading" width={24} height={24} className="animate-spin" />
              <span className="text-[11px] font-label-mono text-text-secondary font-bold">Menghitung rute...</span>
            </div>
          )}
          <MapContainer
            center={pickup ? [pickup.lat, pickup.lng] : MAP_CONFIG.DEFAULT_CENTER}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            minZoom={MAP_CONFIG.MIN_ZOOM}
            maxZoom={MAP_CONFIG.MAX_ZOOM}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution={MAP_CONFIG.TILE_ATTRIBUTION}
              url={MAP_CONFIG.TILE_URL}
            />
            <MapClickHandler onMapClick={handleMapClick} />
            <MapRefitter pickup={pickup} destination={destination} geometry={routeGeometry} />

            {pickup && (
              <Marker
                position={[pickup.lat, pickup.lng]}
                icon={pickupIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => handleMarkerDragEnd('pickup', e),
                }}
              />
            )}

            {destination && (
              <Marker
                position={[destination.lat, destination.lng]}
                icon={destinationIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => handleMarkerDragEnd('destination', e),
                }}
              />
            )}

            {routeGeometry.length > 0 && (
              <Polyline
                positions={routeGeometry}
                color="#F0C052"
                weight={5}
                opacity={0.85}
              />
            )}
          </MapContainer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SINGLE MODE RENDER
  // =========================================================================
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="text-sm font-medium text-text-primary flex items-center gap-2">
        <Image 
          src={markerType === 'pickup' ? '/icons/jemput1.png' : '/icons/tujuan.png'} 
          alt={markerType === 'pickup' ? 'Jemput' : 'Tujuan'} 
          width={18} 
          height={18} 
          className="object-contain" 
        />
        {label}
      </label>

      {/* Address Display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm min-h-[44px] flex items-center">
          {loadingAddress ? (
            <span className="text-text-secondary animate-pulse">Memuat alamat...</span>
          ) : address ? (
            <span className="text-text-primary line-clamp-2">{address}</span>
          ) : (
            <span className="text-text-secondary">{placeholder}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleGetCurrentLocation(markerType)}
          disabled={gettingLocation}
          className="flex-shrink-0 bg-secondary-container text-on-secondary-container rounded-xl p-3 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center min-w-[44px] min-h-[44px]"
          title="Gunakan lokasi saat ini"
        >
          {gettingLocation ? (
            <Image 
              src="/icons/loading.png" 
              alt="loading" 
              width={20} 
              height={20} 
              className="animate-spin object-contain" 
            />
          ) : (
            <Image 
              src="/icons/gps.png" 
              alt="gps" 
              width={20} 
              height={20} 
              className="object-contain" 
            />
          )}
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-outline-variant h-[220px]">
        <MapContainer
          center={position || MAP_CONFIG.DEFAULT_CENTER}
          zoom={MAP_CONFIG.DEFAULT_ZOOM}
          minZoom={MAP_CONFIG.MIN_ZOOM}
          maxZoom={MAP_CONFIG.MAX_ZOOM}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution={MAP_CONFIG.TILE_ATTRIBUTION}
            url={MAP_CONFIG.TILE_URL}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {position && (
            <Marker 
              position={position} 
              icon={icon} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleMarkerDragEnd(markerType, e),
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
