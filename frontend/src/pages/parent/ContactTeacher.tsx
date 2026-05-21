import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyStudents, getChildTeachers } from "@/services/api";

export default function ContactTeacher() {
  // ── logic unchanged ──────────────────────────────────────────────
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyStudents().then((data: any) => {
      if (Array.isArray(data)) setStudents(data);
    });
  }, []);

  const handleSelectStudent = (student_id: number) => {
    setSelected(student_id);
    setLoading(true);
    getChildTeachers(student_id).then((data: any) => {
      if (Array.isArray(data)) setTeachers(data);
      setLoading(false);
    });
  };
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
        {/* Back button */}
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

        {/* Page title */}
        <h1 style={styles.heading}>Contact Teachers</h1>
        <p style={styles.subheading}>Select your child to view their teachers.</p>

        {/* ── Child selector chips ── */}
        {students.length > 0 && (
          <div style={styles.chipRow}>
            {students.map((s) => {
              const isActive = selected === s.student_id;
              return (
                <button
                  key={s.student_id}
                  onClick={() => handleSelectStudent(s.student_id)}
                  style={{
                    ...styles.chip,
                    background: isActive ? "#1d4ed8" : "#fff",
                    color: isActive ? "#fff" : "#0f172a",
                    borderColor: isActive ? "#1d4ed8" : "#e8edf5",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(29,78,216,.25)"
                      : "0 1px 4px rgba(0,0,0,.04)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "#1d4ed8";
                      e.currentTarget.style.color = "#1d4ed8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "#e8edf5";
                      e.currentTarget.style.color = "#0f172a";
                    }
                  }}
                >
                  {/* Mini avatar inside chip */}
                  <span
                    style={{
                      ...styles.chipAvatar,
                      background: isActive ? "rgba(255,255,255,.25)" : "#eff6ff",
                      color: isActive ? "#fff" : "#1d4ed8",
                    }}
                  >
                    {s.first_name?.[0]}
                    {s.last_name?.[0]}
                  </span>
                  {s.first_name} {s.last_name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Prompt when nothing selected ── */}
        {!selected && !loading && (
          <div style={styles.promptCard}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <circle cx="12" cy="8" r="4" stroke="#94a3b8" strokeWidth="1.8" />
              <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              Select a child above to see their teachers.
            </p>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Loading teachers…</span>
          </div>
        )}

        {/* ── Teacher cards ── */}
        {!loading && teachers.length > 0 && (
          <div style={styles.cardGrid}>
            {teachers.map((t, i) => {
              const initials = t.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={i}
                  style={styles.teacherCard}
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
                    <span style={styles.avatarText}>{initials}</span>
                  </div>

                  {/* Info */}
                  <div style={styles.cardText}>
                    <span style={styles.cardTitle}>{t.name}</span>

                    <div style={styles.badgeRow}>
                      {/* Subject badge — amber */}
                      <span style={{ ...styles.badge, background: "#fffbeb", color: "#b45309" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                          <path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t.subject_name}
                      </span>

                      {/* Department badge — blue */}
                      {t.department && (
                        <span style={{ ...styles.badge, background: "#eff6ff", color: "#1d4ed8" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                            <path
                              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {t.department}
                        </span>
                      )}
                    </div>

                    {/* Email row */}
                    {t.email && (
                      <a href={`mailto:${t.email}`} style={styles.emailLink}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginRight: 5, flexShrink: 0 }}>
                          <path
                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 6l-10 7L2 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t.email}
                      </a>
                    )}
                  </div>

                  {/* Mail CTA */}
                  {t.email && (
                    <a
                      href={`mailto:${t.email}`}
                      style={styles.mailBtn}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#1d4ed8";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#eff6ff";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#1d4ed8";
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 6l-10 7L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty state after selection ── */}
        {!loading && selected && teachers.length === 0 && (
          <div style={styles.promptCard}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="7" r="4" stroke="#94a3b8" strokeWidth="1.8" />
            </svg>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              No teachers found for this student.
            </p>
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
  logoMark: { display: "flex", alignItems: "center" },
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
    margin: "0 0 28px",
  },

  /* ── Chip selector ── */
  chipRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginBottom: "28px",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px 8px 8px",
    border: "1.5px solid",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "color .15s, border-color .15s, box-shadow .15s",
  },
  chipAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    flexShrink: 0,
  },

  /* ── Card list ── */
  cardGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },
  teacherCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "16px",
    padding: "20px 22px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    transition: "transform .2s, box-shadow .2s",
  },

  /* ── Avatar ── */
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#fffbeb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#b45309",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },

  /* ── Card text ── */
  cardText: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "7px",
    minWidth: 0,
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

  /* ── Email link ── */
  emailLink: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#64748b",
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  /* ── Mail CTA button ── */
  mailBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
    textDecoration: "none",
    flexShrink: 0,
    transition: "background .18s, color .18s",
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
  loadingText: { fontSize: "14px", color: "#64748b" },

  /* ── Prompt / empty card ── */
  promptCard: {
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
