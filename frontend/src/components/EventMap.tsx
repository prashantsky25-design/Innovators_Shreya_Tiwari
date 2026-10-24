import React, { useEffect, useRef } from 'react';
import { EventItem } from '../types/index.js';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix standard Leaflet default marker icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom styled SVG pin for EventSphere
const createCustomPin = (color: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; items-center: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
        <div style="width: 10px; height: 10px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg); margin: auto;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface EventMapProps {
  events: EventItem[];
  userLocation?: [number, number] | null;
  radiusKm?: number;
  height?: string;
}

export const EventMap: React.FC<EventMapProps> = ({
  events,
  userLocation,
  radiusKm,
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around NCR / New Delhi or userLocation
      const defaultCenter: [number, number] = userLocation || [28.6139, 77.2090];

      const map = L.map(mapContainerRef.current).setView(defaultCenter, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    // Add user location circle & marker if available
    if (userLocation) {
      const userMarker = L.circleMarker(userLocation, {
        radius: 8,
        fillColor: '#0ea5e9',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      }).bindPopup('<strong>Your Current Location</strong>');
      markersLayer.addLayer(userMarker);
      bounds.extend(userLocation);

      if (radiusKm) {
        const radiusCircle = L.circle(userLocation, {
          radius: radiusKm * 1000,
          color: '#6366f1',
          fillColor: '#818cf8',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '4 4',
        });
        markersLayer.addLayer(radiusCircle);
        bounds.extend(radiusCircle.getBounds());
      }
    }

    // Add event markers
    events.forEach((ev) => {
      if (ev.location && ev.location.coordinates && ev.location.coordinates.length === 2) {
        const [lng, lat] = ev.location.coordinates;
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const latLng: [number, number] = [lat, lng];

          const marker = L.marker(latLng, {
            icon: createCustomPin(ev.domain === 'AI/ML' ? '#6366f1' : ev.domain === 'Hackathons' ? '#f59e0b' : '#10b981'),
          });

          const popupContent = document.createElement('div');
          popupContent.className = 'p-1';
          popupContent.innerHTML = `
            <div style="font-family: inherit; width: 220px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6366f1;">${ev.domain}</span>
              <h4 style="font-size: 13px; font-weight: 700; margin: 2px 0 4px; color: #0f172a; line-height: 1.3;">${ev.title}</h4>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px;">📍 ${ev.venueName}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 11px; font-weight: 600; color: ${ev.remainingSeats <= 5 ? '#ef4444' : '#10b981'};">
                  ${ev.remainingSeats} spots left
                </span>
                <a href="/events/${ev.slug}" style="font-size: 11px; background: #4f46e5; color: white; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  View Event
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayer.addLayer(marker);
          bounds.extend(latLng);
        }
      }
    });

    if (events.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [events, userLocation, radiusKm]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
};
