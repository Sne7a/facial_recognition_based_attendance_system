import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMySchedule } from "@/services/api";

export default function ClassSchedule() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySchedule().then((data: any) => {
      if (Array.isArray(data)) setSchedule(data);
      setLoading(false);
    });
  }, []);

  const dayColors: Record<string, string> = {
    Monday:    "#1d4ed8",
    Tuesday:   "#7c3aed",
    Wednesday: "#059669",
    Thursday:  "#d97706",
    Friday:    "#dc2626",
    Saturday:  "#0891b2",
    Sunday:    "#db2777",
  };

  const getDayColor = (day: string) => dayColors[day] || "#64748b";

  const formatTime = (t: string) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Faculty / Class Schedule</p>
            <h1 style={styles.heading}>Class Schedule</h1>
          </div>
          <button
            onClick={() => navigate("/faculty/dashboard")}
            style={styles.backBtn}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* CONTENT */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={styles.sectionTitle}>Weekly Timetable</h2>
            <span style={styles.countBadge}>{schedule.length} {schedule.length === 1 ? "class" : "classes"}</span>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading your schedule...</p>
            </div>
          ) : schedule.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: 500 }}>
                No classes scheduled yet.
              </p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Day</th>
                    <th style={styles.th}>Start Time</th>
                    <th style={styles.th}>End Time</th>
                    <th style={styles.th}>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((s, i) => (
                    <tr
                      key={i}
                      style={styles.tr}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>
                        {s.subject_name || "—"}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          background: `${getDayColor(s.day_of_week)}15`,
                          color: getDayColor(s.day_of_week),
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}>
                          {s.day_of_week || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.timeBadge}>{formatTime(s.start_time)}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.timeBadge}>{formatTime(s.end_time)}</span>
                      </td>
                      <td style={{ ...styles.td, color: "#475569" }}>
                        <span style={styles.roomBadge}>{s.room_identifier || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
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
  page: {
    minHeight: "100vh",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    padding: "40px 20px",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1000px",
    margin: "0 auto",
    animation: "fadeUp .45s ease both",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 8px 0",
    fontWeight: 500,
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "color .2s",
    padding: 0,
    fontFamily: "inherit",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 8px 40px rgba(30,58,138,.08)",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
  },
  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  tableContainer: {
    borderRadius: "12px",
    border: "1.5px solid #f1f5f9",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    background: "#f8fafc",
    padding: "14px 16px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
    borderBottom: "1.5px solid #f1f5f9",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background .15s",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#475569",
  },
  timeBadge: {
    background: "#f1f5f9",
    color: "#334155",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  roomBadge: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid #bbf7d0",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "60px 0",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #1d4ed8",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px 0",
    color: "#64748b",
  },
};
