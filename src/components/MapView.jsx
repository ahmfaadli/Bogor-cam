import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.divIcon({
  className: "bogor-marker-wrap",
  html: '<div class="bogor-marker"><span></span></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

function MapFocus({ camera }) {
  const map = useMap();
  const firstRender = useRef(true);
  useEffect(() => {
    // Mulai dengan gambaran wilayah yang lebih luas; zoom ke kamera hanya
    // ketika pengguna memilih titik dari daftar atau marker peta.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (camera && Number.isFinite(camera.latitude) && Number.isFinite(camera.longitude)) {
      map.flyTo([camera.latitude, camera.longitude], 14, { duration: 0.75 });
    }
  }, [camera, map]);
  return null;
}

export default function MapView({ cameras, selectedCamera, onSelect, mapStyle }) {
  return (
    <MapContainer
      center={[-6.585, 106.875]}
      zoom={10}
      minZoom={9}
      maxZoom={19}
      zoomControl={false}
      scrollWheelZoom
      className="map-canvas"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapStyle === "standard" ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"}
        maxZoom={19}
      />
      <MapFocus camera={selectedCamera} />
      {cameras.filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)).map((camera) => (
        <Marker
          key={camera.id}
          position={[camera.latitude, camera.longitude]}
          icon={markerIcon}
          eventHandlers={{ click: () => onSelect(camera) }}
        >
          <Popup className="bogor-popup">
            <strong>{camera.name}</strong>
            <span>{camera.location}</span>
            <span>{camera.streamUrl ? "Stream HLS tersedia" : "Stream belum diverifikasi"}</span>
            <button onClick={() => onSelect(camera)}>Buka detail kamera</button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
