import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMySubjects, getClassAttendance } from "@/services/api";

export default function ViewAttendance() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "late">("all");

  useEffect(() => {
    getMySubjects().then((data: any) => { if (Array.isArray(data)) setSubjects(data); });
  }, []);

  const handleSelect = (classId: number, name: string, code: string) => {
    setSelectedClassId(classId);
    setSelectedName(`${name} (${code})`);
    setFilter("all");
    setLoading(true);
    getClassAttendance(classId).then((data: any) => {
      if (Array.isArray(data)) setRecords(data);
      setLoading(false);
    });
  };

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount  = records.filter(r => r.status === "absent").length;
  const lateCount    = records.filter(r => r.status === "late").length;
  const attendanceRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  const statusStyle = (status: string): React.CSSProperties => {
    if (status === "present") return { ...styles.statusBadge, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
    if (status === "late")    return { ...styles.statusBadge, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
    return                           { ...styles.statusBadge, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  };

  const subjectBtnStyle = (classId: number): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1.5px solid",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s",
    background: selectedClassId === classId ? "#1d4ed8" : "#ffffff",
    color: selectedClassId === classId ? "#ffffff" : "#475569",
    borderColor: selectedClassId === classId ? "#1d4ed8" : "#e2e8f0",
  });

  const filterBtnStyle = (f: string): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1.5px solid",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s",
    background: filter === f ? "#0f172a" : "#ffffff",
    color: filter === f ? "#ffffff" : "#64748b",
    borderColor: filter === f ? "#0f172a" : "#e2e8f0",
  });

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Faculty / Attendance Records</p>
            <h1 style={styles.heading}>Attendance Records</h1>
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

        {/* SUBJECT SELECTOR */}
        <div style={{ ...styles.card, marginBottom: "24px" }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Select Subject</h2>
          <p style={styles.subheading}>Click a subject to load its attendance records.</p>
          {subjects.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>No subjects assigned yet.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {subjects.map((s) => (
                <button
                  key={s.class_id}
                  style={subjectBtnStyle(s.class_id)}
                  onClick={() => handleSelect(s.class_id, s.subject_name, s.subject_code)}
                >
                  {s.subject_name} ({s.subject_code})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading attendance records...</p>
          </div>
        )}

        {/* RECORDS */}
        {!loading && selectedClassId && (
          <>
            {/* Stats Strip */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total Records",    value: records.length, bg: "#eff6ff", color: "#1d4ed8" },
                { label: "Present",          value: presentCount,   bg: "#f0fdf4", color: "#166534" },
                { label: "Absent",           value: absentCount,    bg: "#fef2f2", color: "#dc2626" },
                { label: "Late",             value: lateCount,      bg: "#fffbeb", color: "#92400e" },
                { label: "Attendance Rate",  value: `${attendanceRate}%`, bg: "#faf5ff", color: "#7c3aed" },
              ].map((stat) => (
                <div key={stat.label} style={{ ...styles.statCard, background: stat.bg }}>
                  <p style={{ ...styles.statLabel, color: stat.color }}>{stat.label}</p>
                  <h3 style={{ ...styles.statValue, color: stat.color }}>{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Table Card */}
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <h2 style={styles.sectionTitle}>{selectedName}</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["all", "present", "absent", "late"] as const).map(f => (
                    <button key={f} style={filterBtnStyle(f)} onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: 500 }}>
                    No {filter !== "all" ? filter : ""} records found.
                  </p>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Student ID</th>
                        <th style={styles.th}>Student Name</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr
                          key={i}
                          style={styles.tr}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ ...styles.td, color: "#94a3b8", width: "48px" }}>{i + 1}</td>
                          <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "13px" }}>{r.student_id || "—"}</td>
                          <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>{r.student_name || "—"}</td>
                          <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "13px" }}>{r.attend_date || "—"}</td>
                          <td style={styles.td}>
                            <span style={statusStyle(r.status)}>
                              {r.status?.charAt(0).toUpperCase() + r.status?.slice(1) || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "16px", textAlign: "right" }}>
                Showing {filtered.length} of {records.length} records
              </p>
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
    maxWidth: "1100px",
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
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 20px 0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    borderRadius: "14px",
    padding: "18px 20px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: 600,
    margin: "0 0 6px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: 700,
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
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
    padding: "14px 16px",
    fontSize: "14px",
    color: "#475569",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
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
    padding: "48px 0",
  },
};
