import { useEffect, useState } from "react";
import { getMyAttendance } from "@/services/api";

export default function Attendance() {
  // ── logic unchanged ──────────────────────────────────────────────
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getMyAttendance().then(setData);
  }, []);
  // ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1d4ed8" />
            <path d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3" fill="#fff" />
          </svg>
        </div>
        <span style={styles.logoText}>Attendance System</span>
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.heading}>Attendance</h1>
            <p style={styles.subheading}>{data.length} record{data.length !== 1 ? "s" : ""} found</p>
          </div>
        </div>

        {data.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={styles.emptyText}>No attendance records yet.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {data.map((item, i) => (
              <div key={i} style={styles.row}>
                <div style={styles.avatar}>
                  {item.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div style={styles.rowText}>
                  <span style={styles.rowName}>{item.name}</span>
                  <span style={styles.rowDate}>{item.date}</span>
                </div>
                <span style={styles.badge}>Present</span>
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
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
  },
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
  body: {
    maxWidth: "620px",
    margin: "0 auto",
    padding: "48px 24px",
    animation: "fadeUp .4s ease both",
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  subheading: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 0",
    gap: "12px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "14px",
    padding: "14px 18px",
    boxShadow: "0 1px 6px rgba(30,58,138,.05)",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  rowName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  },
  rowDate: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  badge: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#16a34a",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "20px",
    padding: "3px 10px",
    flexShrink: 0,
  },
};
