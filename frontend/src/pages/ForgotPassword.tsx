import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "@/services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ── logic unchanged ──────────────────────────────────────────────
  const handleReset = async () => {
    setLoading(true);
    try { const res = await forgotPassword(email); setMessage(res.message || "Reset link sent."); }
    catch { setMessage("Could not connect to server."); }
    setLoading(false);
  };
  // ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.card}>
        {/* Back arrow */}
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to login
        </button>

        {/* Icon */}
        <div style={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={styles.heading}>Reset your password</h1>
        <p style={styles.subheading}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {message && (
          <div style={styles.successBox}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="7" fill="#16a34a" />
              <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="you@school.edu"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#1e40af")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        >
          {loading ? (
            <span style={styles.loadingRow}>
              <span style={styles.spinner} /> Sending…
            </span>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "44px 40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 8px 40px rgba(30,58,138,.12)",
    animation: "fadeUp .45s ease both",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "13px",
    color: "#64748b",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: "28px",
  },
  iconWrap: {
    width: "52px",
    height: "52px",
    background: "#eff6ff",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "24px",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.3px",
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 24px",
    lineHeight: 1.6,
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#15803d",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
    boxSizing: "border-box",
    transition: "border-color .2s",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "16px",
    display: "block",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin .7s linear infinite",
  },
};
