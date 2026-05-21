import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyStudents, getChildAttendance } from "@/services/api";

export default function ChildAttendance() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyStudents().then((data: any) => {
      if (Array.isArray(data)) setStudents(data);
    });
  }, []);

  const handleSelect = (id: number, name: string) => {
    setSelected(id);
    setSelectedName(name);
    setLoading(true);
    getChildAttendance(id).then((data: any) => {
      if (Array.isArray(data)) setRecords(data);
      setLoading(false);
    });
  };

  const studentBtnStyle = (id: number): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1.5px solid",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s",
    background: selected === id ? "#1d4ed8" : "#ffffff",
    color: selected === id ? "#ffffff" : "#475569",
    borderColor: selected === id ? "#1d4ed8" : "#e2e8f0",
  });

  // Summary stats
  const avgAttendance = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.attendance_percentage, 0) / records.length)
    : 0;
  const lowAttendance = records.filter(r => r.attendance_percentage < 75).length;
  const totalPresent  = records.reduce((sum, r) => sum + (r.present || 0), 0);
  const totalClasses  = records.reduce((sum, r) => sum + (r.total_classes || 0), 0);

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Parent / Child Attendance</p>
            <h1 style={styles.heading}>Child Attendance</h1>
          </div>
          <button
            onClick={() => navigate("/parent/dashboard")}
            style={styles.backBtn}
            onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* STUDENT SELECTOR */}
        <div style={{ ...styles.card, marginBottom: "24px" }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Select Child</h2>
          <p style={styles.subheading}>Choose a child to view their subject-wise attendance.</p>
          {students.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>
              No linked students found.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {students.map((s) => (
                <button
                  key={s.student_id}
                  style={studentBtnStyle(s.student_id)}
                  onClick={() => handleSelect(s.student_id, `${s.first_name} ${s.last_name}`)}
                >
                  {s.first_name} {s.last_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Loading attendance records...
            </p>
          </div>
        )}

        {/* RECORDS */}
        {!loading && selected && (
          <>
            {/* Summary Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Average Attendance", value: `${avgAttendance}%`, bg: avgAttendance >= 75 ? "#f0fdf4" : "#fef2f2", color: avgAttendance >= 75 ? "#166534" : "#dc2626" },
                { label: "Total Classes",       value: totalClasses,        bg: "#eff6ff", color: "#1d4ed8" },
                { label: "Total Present",        value: totalPresent,        bg: "#f0fdf4", color: "#166534" },
                { label: "Low Attendance",       value: lowAttendance,       bg: lowAttendance > 0 ? "#fef2f2" : "#f0fdf4", color: lowAttendance > 0 ? "#dc2626" : "#166534" },
              ].map(stat => (
                <div key={stat.label} style={{ ...styles.statCard, background: stat.bg }}>
                  <p style={{ ...styles.statLabel, color: stat.color }}>{stat.label}</p>
                  <h3 style={{ ...styles.statValue, color: stat.color }}>{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={styles.sectionTitle}>{selectedName}</h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0", fontWeight: 500 }}>
                    {records.length} subject{records.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {lowAttendance > 0 && (
                  <div style={styles.warningBadge}>
                    ⚠️ {lowAttendance} subject{lowAttendance !== 1 ? "s" : ""} below 75%
                  </div>
                )}
              </div>

              {records.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: 500 }}>
                    No attendance records found.
                  </p>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Subject</th>
                        <th style={styles.th}>Total Classes</th>
                        <th style={styles.th}>Present</th>
                        <th style={styles.th}>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => {
                        const pct = r.attendance_percentage;
                        const good = pct >= 75;
                        return (
                          <tr
                            key={i}
                            style={styles.tr}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ ...styles.td, color: "#94a3b8", width: "48px" }}>{i + 1}</td>
                            <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>
                              {r.subject_name || "—"}
                            </td>
                            <td style={{ ...styles.td, fontFamily: "monospace" }}>{r.total_classes}</td>
                            <td style={{ ...styles.td, fontFamily: "monospace" }}>{r.present}</td>
                            <td style={styles.td}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={styles.progressBg}>
                                  <div style={{
                                    ...styles.progressFill,
                                    width: `${Math.min(pct, 100)}%`,
                                    background: good ? "#22c55e" : "#ef4444",
                                  }} />
                                </div>
                                <span style={{
                                  ...styles.pctBadge,
                                  background: good ? "#f0fdf4" : "#fef2f2",
                                  color: good ? "#166534" : "#dc2626",
                                  border: `1px solid ${good ? "#bbf7d0" : "#fecaca"}`,
                                }}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
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
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)",
    backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
  },
  container: {
    position: "relative", zIndex: 1,
    maxWidth: "1000px", margin: "0 auto",
    animation: "fadeUp .45s ease both",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-end", marginBottom: "32px",
  },
  breadcrumb: { fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px", color: "#0f172a", margin: 0, letterSpacing: "-0.3px",
  },
  backBtn: {
    background: "none", border: "none", color: "#64748b",
    fontSize: "14px", fontWeight: 600, cursor: "pointer",
    transition: "color .2s", padding: 0, fontFamily: "inherit",
  },
  card: {
    background: "#ffffff", borderRadius: "20px", padding: "32px",
    boxShadow: "0 8px 40px rgba(30,58,138,.08)",
  },
  sectionTitle: { fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: 0 },
  subheading: { fontSize: "14px", color: "#64748b", margin: "0 0 20px 0" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px", marginBottom: "24px",
  },
  statCard: { borderRadius: "14px", padding: "18px 20px" },
  statLabel: {
    fontSize: "12px", fontWeight: 600,
    margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "26px", fontWeight: 700,
    margin: 0, fontFamily: "'DM Serif Display', serif",
  },
  warningBadge: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "10px", padding: "8px 14px",
    fontSize: "13px", fontWeight: 600, color: "#dc2626",
  },
  tableContainer: {
    borderRadius: "12px", border: "1.5px solid #f1f5f9", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    background: "#f8fafc", padding: "14px 16px",
    fontSize: "13px", fontWeight: 600, color: "#64748b",
    borderBottom: "1.5px solid #f1f5f9",
  },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background .15s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#475569" },
  progressBg: {
    width: "80px", height: "6px",
    background: "#e2e8f0", borderRadius: "10px", overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: "10px", transition: "width .3s" },
  pctBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
  },
  loadingBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "16px", padding: "60px 0",
  },
  spinner: {
    width: "32px", height: "32px",
    border: "3px solid #e2e8f0", borderTop: "3px solid #1d4ed8",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  emptyBox: { textAlign: "center", padding: "48px 0" },
};
