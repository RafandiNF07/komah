'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '@/lib/constants';
import { calculateRoute } from '@/lib/osrm';

// Fix Leaflet marker icons under Next.js
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

function MapRefitter({ pickup, destination }) {
  const map = useMap();
  const pickupLat = pickup?.lat;
  const pickupLng = pickup?.lng;
  const destinationLat = destination?.lat;
  const destinationLng = destination?.lng;

  useEffect(() => {
    if (pickupLat && pickupLng && destinationLat && destinationLng) {
      const bounds = L.latLngBounds([
        [pickupLat, pickupLng],
        [destinationLat, destinationLng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (pickupLat && pickupLng) {
      map.setView([pickupLat, pickupLng], 16);
    }
  }, [pickupLat, pickupLng, destinationLat, destinationLng, map]);
  return null;
}

export default function OrderMap({ pickup, destination }) {
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const pickupLat = pickup?.lat;
  const pickupLng = pickup?.lng;
  const destinationLat = destination?.lat;
  const destinationLng = destination?.lng;

  useEffect(() => {
    if (!pickupLat || !pickupLng) return;

    const fetchRoute = async () => {
      if (pickupLat && pickupLng && destinationLat && destinationLng) {
        setLoadingRoute(true);
        try {
          const route = await calculateRoute(
            pickupLat,
            pickupLng,
            destinationLat,
            destinationLng
          );
          setRouteGeometry(route.geometry);
        } catch (err) {
          console.error('Error fetching route in OrderMap:', err);
        } finally {
          setLoadingRoute(false);
        }
      } else {
        setRouteGeometry([]);
      }
    };

    fetchRoute();
  }, [pickupLat, pickupLng, destinationLat, destinationLng]);

  if (!pickup) {
    return (
      <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-2 border border-outline-variant/30 rounded-2xl">
        <p className="font-body-sm text-[13px] text-text-secondary">Lokasi tidak tersedia.</p>
      </div>
    );
  }

  const center = [pickup.lat, pickup.lng];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md min-h-[300px]">
      {loadingRoute && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-2">
          <Image src="/icons/loading.png" alt="loading" width={24} height={24} className="animate-spin" />
          <span className="text-[11px] font-label-mono text-white font-bold">Menghitung Rute...</span>
        </div>
      )}
      
      <MapContainer
        center={center}
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
        
        <MapRefitter pickup={pickup} destination={destination} />
        
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
        
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
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
  );
}
