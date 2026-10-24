import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPinPickerProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  height?: string;
}

export const MapPinPicker: React.FC<MapPinPickerProps> = ({
  lat,
  lng,
  onChange,
  height = '300px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const initialLat = lat || 28.6139;
      const initialLng = lng || 77.2090;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange({ lat: position.lat, lng: position.lng });
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Click on the map or drag the pin to set venue coordinates</span>
        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      </div>
    </div>
  );
};
