import { useMemo, useState } from "react";
import {
  Layers,
  LocateFixed,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cameras as cameraData } from "./data/cameras.js";
import CameraSidebar from "./components/CameraSidebar.jsx";
import CameraPlayer from "./components/CameraPlayer.jsx";
import MapView from "./components/MapView.jsx";

export default function App() {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("Semua Wilayah");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [selectedCamera, setSelectedCamera] = useState(
    () =>
      cameraData.find(
        (camera) => camera.streamUrl || camera.embedUrl
      ) ||
      cameraData[0] ||
      null
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPlayer, setShowPlayer] = useState(true);
  const [mapStyle, setMapStyle] = useState("standard");

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  const mapCameras = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cameraData.filter((camera) => {
      const searchableText = [
        camera.name,
        camera.location,
        camera.area,
        camera.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !query || searchableText.includes(query);

      const matchesArea =
        area === "Semua Wilayah" || camera.area === area;

      const matchesStatus =
        statusFilter === "Semua" ||
        camera.status === statusFilter.toLowerCase();

      return matchesQuery && matchesArea && matchesStatus;
    });
  }, [search, area, statusFilter]);

  const selectCamera = (camera) => {
    if (!camera) return;

    setSelectedCamera(camera);
    setShowPlayer(true);
  };

  const selectAvailableCamera = () => {
    const camera =
      cameraData.find(
        (item) => item.streamUrl || item.embedUrl
      ) || cameraData[0];

    if (camera) {
      selectCamera(camera);
    }
  };

  return (
    <main className="app-shell map-only">
      <div
        className={`workspace ${
          sidebarOpen
            ? "workspace-sidebar-open"
            : "workspace-sidebar-closed"
        }`}
      >
        {/* Sidebar CCTV */}
        <CameraSidebar
          cameras={cameraData}
          selectedCamera={selectedCamera}
          onSelect={selectCamera}
          search={search}
          setSearch={setSearch}
          area={area}
          setArea={setArea}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sidebarOpen={sidebarOpen}
        />

        {/* Tombol panah: sejajar dengan sidebar dan map-stage */}
        <button
          type="button"
          className={`sidebar-edge-toggle ${
            sidebarOpen ? "is-open" : "is-closed"
          }`}
          onClick={toggleSidebar}
          aria-label={
            sidebarOpen ? "Tutup sidebar" : "Buka sidebar"
          }
          aria-expanded={sidebarOpen}
          aria-controls="camera-sidebar"
          title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={17} />
          ) : (
            <ChevronRight size={17} />
          )}
        </button>

        {/* Peta utama */}
        <section className="map-stage">
          <MapView
            cameras={mapCameras}
            selectedCamera={selectedCamera}
            onSelect={selectCamera}
            mapStyle={mapStyle}
          />

          {/* Filter wilayah */}
          <div className="map-top-filters">
            {[
              {
                label: "Semua",
                value: "Semua Wilayah",
              },
              {
                label: "Kota Bogor",
                value: "Kota Bogor",
              },
              {
                label: "Kabupaten Bogor",
                value: "Kabupaten Bogor",
              },
            ].map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={`map-filter ${
                  area === filter.value ? "active" : ""
                }`}
                onClick={() => setArea(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Kontrol peta */}
          <div className="map-controls">
            <button
              type="button"
              onClick={() =>
                setMapStyle((previous) =>
                  previous === "standard" ? "hot" : "standard"
                )
              }
              title="Ganti tampilan peta"
              aria-label="Ganti tampilan peta"
            >
              <Layers size={18} />
              <span>
                {mapStyle === "standard"
                  ? "Peta standar"
                  : "Peta detail"}
              </span>
            </button>

            <button
              type="button"
              onClick={selectAvailableCamera}
              title="Pilih kamera yang tersedia"
              aria-label="Pilih kamera yang tersedia"
            >
              <LocateFixed size={18} />
            </button>
          </div>

          {/* Legenda peta */}
          <div className="map-legend">
            <span>
              <i className="legend-pin" />
              Kawasan CCTV (perkiraan)
            </span>
            <span>
              <i className="legend-ring" />
              Dipilih
            </span>
          </div>

          {/* Informasi peta */}
          <div className="map-bottom-note">
            <Activity size={13} />
            <span>PETA WILAYAH BOGOR</span>
            <span>·</span>
            <span>{mapCameras.length} TITIK</span>
          </div>

          {/* Pemutar CCTV */}
          {showPlayer && selectedCamera && (
            <CameraPlayer
              camera={selectedCamera}
              cameras={cameraData}
              onClose={() => setShowPlayer(false)}
              onSelectNearby={selectCamera}
            />
          )}
        </section>
      </div>
    </main>
  );
}