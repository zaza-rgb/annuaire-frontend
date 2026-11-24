import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// Carte où le commerçant clique pour placer son commerce (ligne 20 de la checklist).
// Props :
//   latitude, longitude : valeurs actuelles ('' ou null si pas de position)
//   onChange(lat, lng)  : appelé au clic, avec des nombres (ou '' et '' pour effacer)
// Un CircleMarker évite le problème classique des icônes Leaflet avec Vite.

function ClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

const round = (n) => Math.round(n * 1e6) / 1e6;

export default function LocationPicker({ latitude, longitude, onChange }) {
  const { t } = useTranslation();
  const lat = latitude === '' || latitude == null ? NaN : Number(latitude);
  const lng = longitude === '' || longitude == null ? NaN : Number(longitude);
  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng);

  // Le centre de départ n'est lu qu'au premier affichage : le Brésil, ou la position déjà choisie
  const center = hasPosition ? [lat, lng] : [-14.235, -51.925];
  const zoom = hasPosition ? 14 : 4;

  const pick = (la, ln) => onChange(round(la), round(ln));

  const useMyPosition = () => {
    if (!navigator.geolocation) {
      window.alert(t('merchant.form.geoError'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => pick(pos.coords.latitude, pos.coords.longitude),
      () => window.alert(t('merchant.form.geoError'))
    );
  };

  return (
    <div className="m-map">
      <div className="m-map-box">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />
          {hasPosition && (
            <CircleMarker
              center={[lat, lng]}
              radius={10}
              pathOptions={{ color: '#7a3b00', fillColor: '#e08a1e', fillOpacity: 0.9, weight: 2 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="m-map-actions">
        <button type="button" className="btn btn-light" onClick={useMyPosition}>
          {t('merchant.form.useMyPosition')}
        </button>
        {hasPosition && (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => onChange('', '')}>
              {t('merchant.form.clearPosition')}
            </button>
            <small className="m-muted">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </small>
          </>
        )}
      </div>
    </div>
  );
}
