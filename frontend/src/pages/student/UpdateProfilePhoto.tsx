import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFace } from "@/services/api";

export default function UpdateProfilePhoto() {
  // ── logic unchanged ──────────────────────────────────────────────
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSave = async () => {
    if (!file) { setMessage("Please select an image first."); return; }
    setLoading(true);
    try {
      const res = await uploadFace(file);
      if (res.student_id) {
        setMessage("Photo uploaded successfully!");
        setTimeout(() => navigate("/student/dashboard"), 1500);
      } else {
        setMessage(res.detail || "Upload failed.");
      }
    } catch {
      setMessage("Could not connect to server.");
    }
    setLoading(false);
  };
  // ────────────────────────────────────────────────────────────────

  const isSuccess = message.toLowerCase().includes("success") || message.toLowerCase().includes("uploaded!");
  const isError   = message && !isSuccess;
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1d4ed8" />
            <path d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3" fill="#fff" />
          </svg>
        </div>
        <span style={styles.logoText}>Attendance System</span>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>
        {/* Back */}
        <button
          onClick={() => navigate("/student/dashboard")}
          style={styles.backBtn}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 5 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <h1 style={styles.heading}>Profile Photo</h1>
        <p style={styles.subheading}>Upload a clear face photo for attendance recognition.</p>

        {/* ── Card ── */}
        <div style={styles.card}>

          {/* Avatar preview */}
          <div style={styles.avatarRing}>
            <div style={styles.avatarWrap}>
              {preview ? (
                <img src={preview} alt="Preview" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      stroke="#94a3b8" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" stroke="#94a3b8" strokeWidth="1.6" />
                  </svg>
                  <span style={styles.avatarPlaceholderText}>No photo</span>
                </div>
              )}
            </div>
            {/* Green ring indicator when photo selected */}
            {preview && (
              <div style={styles.checkBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Tip badges */}
          <div style={styles.tipRow}>
            {["Good lighting", "Face centred", "No sunglasses"].map((tip) => (
              <span key={tip} style={styles.tipBadge}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#1d4ed8" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" stroke="#1d4ed8" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {tip}
              </span>
            ))}
          </div>

          {/* Dropzone */}
          <label
            style={{
              ...styles.dropzone,
              borderColor: dragOver ? "#1d4ed8" : preview ? "#16a34a" : "#cbd5e1",
              background:  dragOver ? "#eff6ff" : preview ? "#f0fdf4" : "#f8faff",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />

            <div style={{
              ...styles.dropzoneIcon,
              background: dragOver ? "#dbeafe" : preview ? "#dcfce7" : "#eff6ff",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                  stroke={preview ? "#16a34a" : "#1d4ed8"}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 8l-5-5-5 5M12 3v12"
                  stroke={preview ? "#16a34a" : "#1d4ed8"}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {preview ? (
              <>
                <span style={{ ...styles.dropzoneTitle, color: "#16a34a" }}>
                  {file?.name ?? "Image selected"}
                </span>
                <span style={styles.dropzoneHint}>Click or drag to replace</span>
              </>
            ) : (
              <>
                <span style={styles.dropzoneTitle}>Click or drag to upload</span>
                <span style={styles.dropzoneHint}>PNG, JPG, WEBP — max 10 MB</span>
              </>
            )}
          </label>

          {/* Toast message */}
          {message && (
            <div style={{
              ...styles.toast,
              background: isSuccess ? "#f0fdf4" : "#fef2f2",
              borderColor: isSuccess ? "#bbf7d0" : "#fecaca",
              color:       isSuccess ? "#15803d" : "#dc2626",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                {isSuccess ? (
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
              {message}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              ...styles.saveBtn,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#1e40af";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#1d4ed8";
            }}
          >
            {loading ? (
              <>
                <div style={styles.btnSpinner} />
                Uploading…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Save Photo
              </>
            )}
          </button>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "18px 28px",
    background: "#fff",
    borderBottom: "1px solid #e8edf5",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  logoMark: { display: "flex", alignItems: "center" },
  logoText: { fontWeight: 600, fontSize: "15px", color: "#0f172a", letterSpacing: "-0.1px" },

  /* Body */
  body: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "52px 24px",
    animation: "fadeUp .4s ease both",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    padding: "0 0 20px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#64748b",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: "color .15s",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  subheading: { fontSize: "15px", color: "#64748b", margin: "0 0 32px" },

  /* Card shell */
  card: {
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "20px",
    padding: "32px 28px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "22px",
  },

  /* Avatar */
  avatarRing: {
    position: "relative",
    width: "108px",
    height: "108px",
  },
  avatarWrap: {
    width: "108px",
    height: "108px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #e8edf5",
    background: "#f8faff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  avatarPlaceholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "6px",
  },
  avatarPlaceholderText: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  checkBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#16a34a",
    border: "2.5px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Tips */
  tipRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  tipBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "20px",
  },

  /* Dropzone */
  dropzone: {
    width: "100%",
    border: "2px dashed",
    borderRadius: "14px",
    padding: "24px 20px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
    transition: "border-color .2s, background .2s",
    boxSizing: "border-box" as const,
  },
  dropzoneIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
    transition: "background .2s",
  },
  dropzoneTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  },
  dropzoneHint: {
    fontSize: "12px",
    color: "#94a3b8",
  },

  /* Toast */
  toast: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1.5px solid",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13px",
    fontWeight: 500,
    boxSizing: "border-box" as const,
  },

  /* Save button */
  saveBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "background .18s",
  },
  btnSpinner: {
    width: "16px",
    height: "16px",
    border: "2.5px solid rgba(255,255,255,.35)",
    borderTop: "2.5px solid #fff",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
  },
};
