import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyStudents } from "@/services/api";

export default function ChildrenProfile() {
  // ── logic unchanged ──────────────────────────────────────────────
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStudents().then((data: any) => {
      if (Array.isArray(data)) setStudents(data);
      setLoading(false);
    });
  }, []);
  // ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* ── Header (identical to Dashboard) ── */}
      <div style={styles.header}>
        <div style={styles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1d4ed8" />
            <path
              d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="3" fill="#fff" />
          </svg>
        </div>
        <span style={styles.logoText}>Attendance System</span>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>
        {/* Back link */}
        <button
          onClick={() => navigate("/parent/dashboard")}
          style={styles.backBtn}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 5 }}>
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        <h1 style={styles.heading}>Children Profiles</h1>
        <p style={styles.subheading}>View and manage your registered children.</p>

        {/* ── Loading state ── */}
        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Loading profiles…</span>
          </div>
        ) : students.length === 0 ? (
          /* ── Empty state ── */
          <div style={styles.emptyCard}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="7" r="4" stroke="#94a3b8" strokeWidth="1.8" />
              <path
                d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>No children linked to your account.</p>
          </div>
        ) : (
          /* ── Student cards ── */
          <div style={styles.cardGrid}>
            {students.map((s, i) => (
              <div
                key={i}
                style={styles.studentCard}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 12px 32px rgba(30,58,138,.16)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 2px 16px rgba(30,58,138,.08)";
                }}
              >
                {/* Avatar */}
                <div style={styles.avatar}>
                  <span style={styles.avatarText}>
                    {s.first_name?.[0]}
                    {s.last_name?.[0]}
                  </span>
                </div>

                {/* Info */}
                <div style={styles.cardText}>
                  <span style={styles.cardTitle}>
                    {s.first_name} {s.last_name}
                  </span>

                  <div style={styles.badgeRow}>
                    {/* Student ID badge */}
                    <span style={{ ...styles.badge, background: "#eff6ff", color: "#1d4ed8" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      ID: {s.student_id}
                    </span>

                    {/* Semester badge */}
                    <span style={{ ...styles.badge, background: "#f0fdf4", color: "#16a34a" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                        <path
                          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Semester {s.curr_semester}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="#94a3b8"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
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

const styles: Record<string, React.CSSProperties> = {
  /* ── Shell ── */
  page: {
    minHeight: "100vh",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* ── Header ── */
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "18px 28px",
    background: "#fff",
    borderBottom: "1px solid #e8edf5",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  logoMark: {
    display: "flex",
    alignItems: "center",
  },
  logoText: {
    fontWeight: 600,
    fontSize: "15px",
    color: "#0f172a",
    letterSpacing: "-0.1px",
  },

  /* ── Body ── */
  body: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "52px 24px",
    animation: "fadeUp .4s ease both",
  },

  /* ── Back button ── */
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

  /* ── Page title ── */
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  subheading: {
    fontSize: "15px",
    color: "#64748b",
    margin: "0 0 36px",
  },

  /* ── Card list ── */
  cardGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },

  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "16px",
    padding: "20px 22px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    transition: "transform .2s, box-shadow .2s",
    cursor: "default",
  },

  /* ── Avatar ── */
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#1d4ed8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },

  /* ── Card text block ── */
  cardText: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
  },

  /* ── Badges ── */
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: "20px",
  },

  /* ── Loading ── */
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "32px 0",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2.5px solid #e8edf5",
    borderTop: "2.5px solid #1d4ed8",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#64748b",
  },

  /* ── Empty state ── */
  emptyCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "16px",
    padding: "48px 24px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    textAlign: "center" as const,
  },
};
