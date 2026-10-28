
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
  onStatusChange,
}) {
  const videoRef = useRef(null);
  const statusCallbackRef = useRef(onStatusChange);

  const [playbackError, setPlaybackError] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(
    camera?.status || "unverified"
  );
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  statusCallbackRef.current = onStatusChange;

  const isYouTube = camera?.streamProvider === "youtube";
  const streamUrl = camera?.streamUrl;
  const embedUrl = camera?.embedUrl;

  useEffect(() => {
    setPlaybackStatus(camera?.status || "unverified");
    setPlaybackError(false);
  }, [camera?.id, camera?.status]);

  useEffect(() => {
    const video = videoRef.current;

    let hls = null;
    let disposed = false;
    let healthCheckId = null;
    let lastCurrentTime = 0;
    let stalledChecks = 0;

    const reportStatus = (status, message) => {
      if (disposed) return;

      setPlaybackStatus(status);

      statusCallbackRef.current?.(
        camera?.id,
        status,
        message
      );
    };

    const markOffline = (message) => {
      setPlaybackError(true);
      reportStatus("offline", message);
    };

    const markOnline = () => {
      setPlaybackError(false);
      stalledChecks = 0;
      lastCurrentTime = video?.currentTime || 0;

      reportStatus("online", "Stream berhasil mengirim video");
    };

    if (!camera || !streamUrl || !video || isYouTube) {
      if (camera && !isYouTube) {
        reportStatus(
          "unverified",
          "URL stream belum tersedia"
        );
      }

      return () => {
        disposed = true;
      };
    }

    reportStatus("checking", "Sedang memeriksa stream");

    const handlePlaying = () => {
      markOnline();
    };

    const handleWaiting = () => {
      // Buffering singkat belum tentu berarti kamera offline.
      stalledChecks = 0;
      lastCurrentTime = video.currentTime;
    };

    const handleNativeError = () => {
      markOffline("Browser gagal memuat stream CCTV");
    };

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("error", handleNativeError);

    // Periksa apakah video yang sedang diputar masih bergerak.
    healthCheckId = window.setInterval(() => {
      if (disposed || video.paused || video.ended) return;

      if (video.currentTime > lastCurrentTime + 0.1) {
        lastCurrentTime = video.currentTime;
        stalledChecks = 0;

        if (
          video.readyState >=
          HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          markOnline();
        }
      } else {
        stalledChecks += 1;

        // Tiga pemeriksaan berturut-turut tanpa perkembangan video.
        if (stalledChecks >= 3) {
          markOffline(
            "Video tidak menerima perkembangan data"
          );
        }
      }
    }, 5000);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 15000,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Playlist berhasil dibaca belum berarti video aktif.
        // Status Online baru ditetapkan setelah video berjalan.
        video.play().catch(() => {
          // Autoplay mungkin dibatasi oleh browser.
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          markOffline(
            "Stream tidak dapat diakses. Periksa URL atau server CCTV."
          );

          // Jangan terus mencoba URL playlist yang gagal ditemukan.
          if (
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
          ) {
            hls.stopLoad();
          }

          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          markOffline("Terjadi gangguan pada media stream");
          hls.recoverMediaError();
          return;
        }

        markOffline("Stream gagal dimuat");
        hls.destroy();
        hls = null;
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // Dukungan HLS bawaan browser, misalnya Safari.
      video.src = streamUrl;

      video.play().catch(() => {
        // Pengguna dapat menekan tombol Play secara manual.
      });
    } else {
      markOffline("Browser tidak mendukung pemutaran HLS");
    }

    return () => {
      disposed = true;

      if (healthCheckId !== null) {
        window.clearInterval(healthCheckId);
      }

      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("error", handleNativeError);

      if (hls) {
        hls.destroy();
      }

      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [camera?.id, streamUrl, isYouTube]);

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
      await navigator.clipboard.writeText(
        window.location.href
      );

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

  const statusLabel =
    playbackStatus === "online"
      ? "Stream tersedia"
      : playbackStatus === "offline"
        ? "Offline"
        : playbackStatus === "checking"
          ? "Memeriksa stream"
          : "Belum diverifikasi";

  const statusDescription =
    playbackStatus === "online"
      ? "Status sumber online"
      : playbackStatus === "offline"
        ? "Status sumber offline"
        : playbackStatus === "checking"
          ? "Sedang memeriksa sumber"
          : "Status belum diverifikasi";

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
            {statusLabel}
            <ChevronIcon />
          </span>
        </div>

        <div className="detail-byline">
          <div className="agency-mark">B</div>

          <div>
            <small>
              {playbackStatus === "offline"
                ? "Stream gagal diakses"
                : playbackStatus === "checking"
                  ? "Sedang memeriksa stream"
                  : playbackStatus === "online"
                    ? "Stream berhasil diputar"
                    : camera.updated}
            </small>

            <strong>{camera.source}</strong>
          </div>

          <div className="detail-actions">
            <button
              className={liked ? "liked" : ""}
              onClick={() =>
                setLiked((value) => !value)
              }
              aria-label="Sukai"
              aria-pressed={liked}
              type="button"
            >
              <Heart size={20} />
            </button>

            <button
              className={saved ? "saved" : ""}
              onClick={() =>
                setSaved((value) => !value)
              }
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
          <span>{statusDescription}</span>
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
                    {item.status === "online"
                      ? "LIVE"
                      : item.status === "offline"
                        ? "OFFLINE"
                        : "NO SIGNAL"}
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