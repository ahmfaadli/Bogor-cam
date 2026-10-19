
import {
  Video,
  MapPin,
  ExternalLink,
  Maximize2,
} from "lucide-react";

export default function CameraCard({ camera, onSelect }) {
  const hasStream = Boolean(camera.streamUrl || camera.embedUrl);

  return (
    <article className="camera-card">
      <button
        className="camera-screen"
        onClick={onSelect}
        aria-label={`Buka ${camera.name}`}
      >
        {camera.streamUrl ? (
          <video
            className="card-video"
            src={camera.streamUrl}
            muted
            playsInline
            preload="none"
          />
        ) : (
          <div className="camera-placeholder">
            <div className="camera-placeholder-icon">
              <Video size={32} />
            </div>
            <span className="placeholder-title">
              {hasStream ? "EMBED TERSEDIA" : "LIVE FEED BELUM TERSEDIA"}
            </span>
          </div>
        )}

        <span className="screen-badge">
          <span className={hasStream ? "live-dot" : "pending-dot"} />
          {hasStream ? "STREAM" : "BELUM TERVERIFIKASI"}
        </span>

        <span className="expand-button">
          <Maximize2 size={16} />
        </span>
      </button>

      <div className="camera-card-body">
        <div className="camera-tags">
          <span>{camera.area}</span>
          <span className="source-tag">{camera.source}</span>
        </div>

        <h3>{camera.name}</h3>

        <p className="camera-location">
          <MapPin size={15} />
          {camera.location}
        </p>

        <div className="camera-actions">
          <button className="watch-button" onClick={onSelect}>
            Lihat kamera
          </button>

          <a
            className="external-button"
            href={camera.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka sumber resmi"
            aria-label={`Buka sumber resmi ${camera.name}`}
          >
            <ExternalLink size={17} />
          </a>
        </div>
      </div>
    </article>
  );
}
