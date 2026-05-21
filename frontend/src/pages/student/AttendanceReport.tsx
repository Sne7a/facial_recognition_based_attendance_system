import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyAttendance } from "@/services/api";

export default function AttendanceReport() {
  // ── logic unchanged ──────────────────────────────────────────────
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    getMyAttendance().then((data: any) => {
      if (Array.isArray(data)) setRecords(data);
    });
  }, []);

  const overall =
    records.length > 0
      ? Math.round(
          records.reduce((s, r) => s + r.attendance_percentage, 0) / records.length
        )
      : 0;
  // ────────────────────────────────────────────────────────────────

  const goodCount = records.filter((r) => r.attendance_percentage >= 75).length;
  const lowCount  = records.length - goodCount;
  const isHealthy = overall >= 75;

  // Arc geometry for the donut
  const R = 54;
  const C = 2 * Math.PI * R;
  const filled = (overall / 100) * C;

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

        <h1 style={styles.heading}>Attendance Report</h1>
        <p style={styles.subheading}>Your overall performance across all subjects.</p>

        {/* ── Hero summary card ── */}
        <div style={styles.heroCard}>
          {/* Donut chart */}
          <div style={styles.donutWrap}>
            <svg width="128" height="128" viewBox="0 0 128 128">
              {/* track */}
              <circle cx="64" cy="64" r={R} fill="none"
                stroke="#f1f5f9" strokeWidth="12" />
              {/* fill */}
              <circle cx="64" cy="64" r={R} fill="none"
                stroke={isHealthy ? "#16a34a" : "#dc2626"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${C}`}
                strokeDashoffset={C / 4}
                style={{ transition: "stroke-dasharray .6s ease" }}
              />
            </svg>
            {/* Centre label */}
            <div style={styles.donutCenter}>
              <span style={{ ...styles.donutPct, color: isHealthy ? "#16a34a" : "#dc2626" }}>
                {overall}%
              </span>
              <span style={styles.donutLabel}>Overall</span>
            </div>
          </div>

          {/* Right stats */}
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <div style={{ ...styles.heroStatIcon, background: "#eff6ff" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={styles.heroStatText}>
                <span style={styles.heroStatVal}>{records.length}</span>
                <span style={styles.heroStatLbl}>Subjects</span>
              </div>
            </div>

            <div style={styles.heroStat}>
              <div style={{ ...styles.heroStatIcon, background: "#f0fdf4" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" stroke="#16a34a"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={styles.heroStatText}>
                <span style={{ ...styles.heroStatVal, color: "#16a34a" }}>{goodCount}</span>
                <span style={styles.heroStatLbl}>Good</span>
              </div>
            </div>

            <div style={styles.heroStat}>
              <div style={{ ...styles.heroStatIcon, background: lowCount > 0 ? "#fef2f2" : "#f0fdf4" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                    stroke={lowCount > 0 ? "#dc2626" : "#16a34a"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={styles.heroStatText}>
                <span style={{ ...styles.heroStatVal, color: lowCount > 0 ? "#dc2626" : "#16a34a" }}>
                  {lowCount}
                </span>
                <span style={styles.heroStatLbl}>Low</span>
              </div>
            </div>

            {/* 75 % threshold marker */}
            <div style={styles.thresholdPill}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Threshold · 75%
            </div>
          </div>
        </div>

        {/* ── Per-subject bars ── */}
        {records.length > 0 && (
          <div style={styles.cardGrid}>
            {records.map((r, i) => {
              const pct      = Number(r.attendance_percentage);
              const isGood   = pct >= 75;
              const barColor = isGood ? "#16a34a" : "#dc2626";
              const barBg    = isGood ? "#f0fdf4"  : "#fef2f2";

              return (
                <div
                  key={i}
                  style={styles.subjectCard}
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
                  {/* Top row */}
                  <div style={styles.subjectTopRow}>
                    <span style={styles.subjectName}>{r.subject_name}</span>
                    <div style={styles.subjectRight}>
                      <span style={{ ...styles.statusBadge, background: barBg, color: barColor }}>
                        {isGood ? "Good" : "Low"}
                      </span>
                      <span style={{ ...styles.pctLabel, color: barColor }}>{pct}%</span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div style={styles.barTrack}>
                    {/* 75 % threshold tick */}
                    <div style={styles.thresholdTick} />
                    <div style={{ ...styles.barFill, width: `${Math.min(pct, 100)}%`, background: barColor }} />
                  </div>

                  {/* Axis labels */}
                  <div style={styles.axisRow}>
                    <span style={styles.axisLabel}>0%</span>
                    <span style={{ ...styles.axisLabel, position: "absolute", left: "75%", transform: "translateX(-50%)" }}>
                      75%
                    </span>
                    <span style={styles.axisLabel}>100%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {records.length === 0 && (
          <div style={styles.emptyCard}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>No attendance records found.</p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
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
    maxWidth: "620px",
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

  /* Hero card */
  heroCard: {
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    alignItems: "center",
    gap: "32px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    marginBottom: "20px",
  },

  /* Donut */
  donutWrap: {
    position: "relative",
    width: "128px",
    height: "128px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1px",
  },
  donutPct: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1,
  },
  donutLabel: { fontSize: "11px", color: "#94a3b8", fontWeight: 500 },

  /* Hero right stats */
  heroStats: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },
  heroStat: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  heroStatIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroStatText: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },
  heroStatVal: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1,
  },
  heroStatLbl: { fontSize: "12px", color: "#94a3b8", fontWeight: 500 },
  thresholdPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#faf5ff",
    color: "#7c3aed",
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "20px",
    alignSelf: "flex-start",
  },

  /* Subject cards */
  cardGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },
  subjectCard: {
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "16px",
    padding: "18px 22px",
    boxShadow: "0 2px 16px rgba(30,58,138,.08)",
    transition: "transform .2s, box-shadow .2s",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  subjectTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  subjectName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  subjectRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "20px",
  },
  pctLabel: {
    fontSize: "14px",
    fontWeight: 700,
    minWidth: "38px",
    textAlign: "right" as const,
  },

  /* Bar */
  barTrack: {
    position: "relative",
    width: "100%",
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "99px",
    overflow: "hidden",
  },
  thresholdTick: {
    position: "absolute",
    left: "75%",
    top: 0,
    bottom: 0,
    width: "2px",
    background: "rgba(124,58,237,.25)",
    zIndex: 1,
  },
  barFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width .5s ease",
    position: "relative",
    zIndex: 2,
  },

  /* Axis */
  axisRow: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
  },
  axisLabel: { fontSize: "10px", color: "#cbd5e1", fontWeight: 500 },

  /* Empty */
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
