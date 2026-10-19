
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  X,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Video,
  Radio,
} from "lucide-react";

export default function CameraPlayer({
  camera,
  onClose,
  onSelectNearby,
  cameras = [],
}) {
  const videoRef = useRef(null);

  const [playbackError, setPlaybackError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const isYouTube = camera?.streamProvider === "youtube";
  const streamUrl = camera?.streamUrl;
  const embedUrl = camera?.embedUrl;

  useEffect(() => {
    const video = videoRef.current;

    setPlaybackError(false);

    // Jangan menjalankan HLS untuk sumber YouTube.
    if (!streamUrl || !video || isYouTube) {
      return undefined;
    }

    let hls;

    const handleNativeError = () => setPlaybackError(true);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlaybackError(false);

        video.play().catch(() => {
          // Browser dapat membatasi autoplay.
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        setPlaybackError(true);

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.src = streamUrl;
      video.addEventListener("error", handleNativeError);

      video.play().catch(() => {
        // Pengguna bisa menekan tombol play.
      });
    } else {
      setPlaybackError(true);
    }

    return () => {
      if (hls) hls.destroy();

      video.removeEventListener("error", handleNativeError);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [streamUrl, isYouTube]);

  if (!camera) return null;

  const nearby = cameras
    .filter(
      (item) =>
        item.id !== camera.id &&
        item.area === camera.area
    )
    .slice(0, 3);

  const sourceLink =
    camera.officialUrl || camera.sourceUrl || "#";

  const hasPlayableSource = Boolean(streamUrl || embedUrl);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Gagal menyalin tautan:", error);
    }
  };

  const placeholderTitle =
    camera.streamProvider === "dynamic-token"
      ? "Stream memakai token dinamis"
      : "Stream langsung belum tersedia";

  const placeholderDescription =
    camera.streamProvider === "dynamic-token"
      ? "Sumber ini menggunakan token dinamis untuk playlist dan segmen video. Tautan dari DevTools mungkin kedaluwarsa. Buka halaman sumber untuk mencoba melihat siaran."
      : "URL stream langsung untuk kamera ini belum ditambahkan. Jika URL HLS resmi tersedia, video dapat diputar langsung di BogorCam.";

  return (
    <section
      className="camera-detail"
      aria-label="Detail kamera"
    >
      <div className="detail-video">
        {isYouTube && embedUrl ? (
          <iframe
            key={camera.id}
            src={embedUrl}
            title={camera.name}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              minHeight: "240px",
              aspectRatio: "16 / 9",
              border: 0,
            }}
          />
        ) : streamUrl ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            aria-label={`Pemutar ${camera.name}`}
          />
        ) : embedUrl ? (
          <iframe
            key={camera.id}
            src={embedUrl}
            title={camera.name}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="eager"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              minHeight: "240px",
              aspectRatio: "16 / 9",
              border: 0,
            }}
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-grid" />

            <div className="placeholder-icon">
              <Video size={30} />
            </div>

            <span className="placeholder-label">
              SUMBER CCTV RESMI
            </span>

            <strong>{placeholderTitle}</strong>
            <p>{placeholderDescription}</p>

            <a
              className="source-link"
              href={sourceLink}
              target="_blank"
              rel="noreferrer"
            >
              Buka portal resmi
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {playbackError && (
          <div className="playback-error" role="alert">
            Stream gagal diputar. Periksa URL stream,
            koneksi jaringan, dan izin CORS.
          </div>
        )}

        <button
          className="detail-close"
          onClick={onClose}
          aria-label="Tutup detail"
          type="button"
        >
          <X size={22} />
        </button>

        <div className="video-chip">
          <span />
          {hasPlayableSource ? "LIVE" : "SUMBER RESMI"}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-title-row">
          <div>
            <h2>{camera.name}</h2>
            <p>{camera.location}</p>
          </div>

          <span className="latency-pill">
            <Radio size={12} />
            {camera.status === "online"
              ? "Stream tersedia"
              : "Belum diverifikasi"}
            <ChevronIcon />
          </span>
        </div>

        <div className="detail-byline">
          <div className="agency-mark">B</div>

          <div>
            <small>{camera.updated}</small>
            <strong>{camera.source}</strong>
          </div>

          <div className="detail-actions">
            <button
              className={liked ? "liked" : ""}
              onClick={() => setLiked((value) => !value)}
              aria-label="Sukai"
              aria-pressed={liked}
              type="button"
            >
              <Heart size={20} />
            </button>

            <button
              className={saved ? "saved" : ""}
              onClick={() => setSaved((value) => !value)}
              aria-label="Simpan"
              aria-pressed={saved}
              type="button"
            >
              <Bookmark size={19} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Salin tautan"
              title={copied ? "Tautan disalin" : "Salin tautan"}
              type="button"
            >
              <Share2 size={19} />
            </button>
          </div>
        </div>

        <div className="view-count">
          <span>{camera.views ?? 0}x ditonton</span>
          <i>•</i>
          <span>
            {camera.status === "online"
              ? "Status sumber online"
              : "Status belum diverifikasi"}
          </span>
        </div>

        <h3>Kamera lainnya di sekitar</h3>

        <div className="nearby-grid">
          {nearby.length > 0 ? (
            nearby.map((item, index) => (
              <button
                key={item.id}
                className="nearby-card"
                onClick={() => onSelectNearby?.(item)}
                type="button"
              >
                <div
                  className={`nearby-preview nearby-preview-${index}`}
                >
                  <Video size={21} />

                  <span>
                    {item.status === "online" ? "LIVE" : "NO SIGNAL"}
                  </span>
                </div>

                <strong>{item.name}</strong>
              </button>
            ))
          ) : (
            <p className="no-nearby">
              Belum ada kamera lain di area ini.
            </p>
          )}
        </div>

        <a
          className="source-link"
          href={sourceLink}
          target="_blank"
          rel="noreferrer"
        >
          Buka halaman sumber jika penyematan diblokir
          <ExternalLink size={13} />
        </a>

        <p className="source-disclaimer">
          Titik peta menunjukkan kawasan perkiraan, bukan
          koordinat pemasangan kamera yang telah diverifikasi.
        </p>
      </div>
    </section>
  );
}

function ChevronIcon() {
  return <span className="tiny-chevron"></span>;
}