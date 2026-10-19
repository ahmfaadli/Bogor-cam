
import {
  Search,
  X,
  Video,
  ChevronDown,
  ArrowDownUp,
} from "lucide-react";

export default function CameraSidebar({
  cameras = [],
  selectedCamera,
  onSelect,
  search,
  setSearch,
  area,
  setArea,
  statusFilter,
  setStatusFilter,
  sidebarOpen,
}) {
  const visibleCameras = cameras.filter((camera) => {
    const query = (search || "").trim().toLowerCase();

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

    return (
      matchesQuery &&
      matchesArea &&
      matchesStatus
    );
  });

  return (
    <aside
      id="camera-sidebar"
      className={`sidebar ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
      aria-hidden={!sidebarOpen}
    >
      {/* Pencarian kamera */}
      <div className="search-wrap">
        <Search
          size={18}
          className="search-action"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari CCTV Bogor"
          aria-label="Cari kamera CCTV"
          tabIndex={sidebarOpen ? 0 : -1}
        />

        {search && (
          <button
            type="button"
            className="clear-search"
            onClick={() => setSearch("")}
            aria-label="Hapus pencarian"
            tabIndex={sidebarOpen ? 0 : -1}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Filter status */}
      <div className="filter-row">
        {[
          { label: "Semua", value: "Semua" },
          { label: "Online", value: "online" },
          { label: "Offline", value: "offline" },
        ].map((filter) => (
          <button
            type="button"
            key={filter.value}
            className={`status-filter ${
              statusFilter === filter.value ? "active" : ""
            } ${
              filter.value !== "Semua" ? filter.value : ""
            }`}
            onClick={() => setStatusFilter(filter.value)}
            tabIndex={sidebarOpen ? 0 : -1}
          >
            {filter.label}
          </button>
        ))}

        <button
          type="button"
          className="sort-button"
          onClick={() => {
            if (visibleCameras.length > 0) {
              onSelect(visibleCameras[0]);
            }
          }}
          title="Pilih kamera pertama dalam daftar"
          tabIndex={sidebarOpen ? 0 : -1}
        >
          <span>Terbaru</span>
          <ArrowDownUp size={14} />
        </button>
      </div>

      {/* Jumlah kamera dan filter wilayah */}
      <div className="sidebar-meta">
        <span>
          Menampilkan <b>{visibleCameras.length}</b> dari{" "}
          {cameras.length} kamera
        </span>
      </div>

      {/* Judul daftar kamera */}
      <div className="list-heading">
        DAFTAR KAMERA
      </div>

      {/* Daftar kamera */}
      <div className="camera-list">
        {visibleCameras.map((camera, index) => {
          const isSelected =
            selectedCamera?.id === camera.id;

          const isOnline = camera.status === "online";

          return (
            <button
              type="button"
              key={camera.id ?? `${camera.name}-${index}`}
              className={`camera-row ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => onSelect(camera)}
              aria-pressed={isSelected}
              tabIndex={sidebarOpen ? 0 : -1}
            >
              <div className="camera-row-top">
                <span className="camera-name">
                  {camera.name || "Kamera CCTV"}
                </span>

                <span className="camera-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="camera-row-meta">
                <span>
                  {camera.updated ||
                    camera.location ||
                    "Sumber CCTV"}
                </span>

                <span
                  className={`status-dot status-${
                    camera.status || "offline"
                  }`}
                />

                <span
                  className={`status-text status-text-${
                    camera.status || "offline"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="camera-row-bottom">
                <span>
                  <Video size={12} />
                  {camera.source || "Sumber CCTV"}
                </span>

                <span>
                  {camera.views ?? 0} ditonton
                </span>
              </div>
            </button>
          );
        })}

        {visibleCameras.length === 0 && (
          <div className="empty-list">
            Tidak ada kamera yang cocok dengan pencarian
            atau filter.
          </div>
        )}
      </div>

      {/* Footer sidebar */}
      <div className="sidebar-foot">
        <span className="live-pulse" />
        SUMBER PUBLIK · BOGOR

        <span className="foot-count">
          {visibleCameras.length} CAM
        </span>
      </div>
    </aside>
  );
}
