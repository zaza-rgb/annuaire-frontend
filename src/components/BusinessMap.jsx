import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Épingles dessinées en CSS (évite les problèmes d'images de Leaflet avec Vite)
const pinIcon = L.divIcon({
  className: 'map-pin',
  html: '<div class="pin-body"><span>✦</span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});
const mePinIcon = L.divIcon({
  className: 'map-pin',
  html: '<div class="me-body"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Ajuste le zoom pour voir tous les marqueurs
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export default function BusinessMap({ businesses, categoryName, userPosition }) {
  const { t } = useTranslation();

  const located = useMemo(
    () =>
      businesses
        .map((b) => ({ ...b, lat: Number(b.latitude), lng: Number(b.longitude) }))
        .filter((b) => b.latitude != null && b.longitude != null && !Number.isNaN(b.lat) && !Number.isNaN(b.lng)),
    [businesses]
  );

  const points = useMemo(() => {
    const list = located.map((b) => [b.lat, b.lng]);
    if (userPosition) list.push([userPosition.lat, userPosition.lng]);
    return list;
  }, [located, userPosition]);

  return (
    <div className="map-wrap">
      <MapContainer center={[-14.2, -51.9]} zoom={4} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={mePinIcon}>
            <Popup>{t('map.you_are_here')}</Popup>
          </Marker>
        )}

        {located.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={pinIcon}>
            <Popup>
              <strong className="popup-title">{b.name}</strong>
              <div className="popup-meta">
                {[categoryName(b.category_id), b.city].filter(Boolean).join(' · ')}
              </div>
              <Link to={`/businesses/${b.id}`}>{t('map.view_business')} ↗</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {located.length < businesses.length && (
        <p className="map-note">
          {t('map.not_located', { n: businesses.length - located.length })}
        </p>
      )}
    </div>
  );
}