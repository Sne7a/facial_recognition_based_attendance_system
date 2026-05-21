import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMySubjects, getClassAttendance } from "@/services/api";

export default function GenerateReports() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMySubjects().then((data: any) => { if (Array.isArray(data)) setSubjects(data); });
  }, []);

  const handleGenerate = (classId: number, name: string) => {
    setSelectedClassId(classId);
    setSelectedName(name);
    setLoading(true);
    getClassAttendance(classId).then((data: any) => {
      if (Array.isArray(data)) setRecords(data);
      setLoading(false);
    });
  };

  // Compute summary stats
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount  = records.filter(r => r.status === "absent").length;
  const lateCount    = records.filter(r => r.status === "late").length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const statusStyle = (status: string): React.CSSProperties => {
    if (status === "present") return { ...styles.statusBadge, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
    if (status === "late")    return { ...styles.statusBadge, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
    return                           { ...styles.statusBadge, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  };
  const handlePrint = () => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Attendance Report - ${selectedName}</title>
        <style>
          body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #0f172a; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          p { font-size: 13px; color: #64748b; margin: 0 0 24px 0; }
          .stats { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
          .stat { padding: 12px 20px; border-radius: 10px; min-width: 100px; }
          .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; }
          .stat-value { font-size: 22px; font-weight: 700; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8fafc; padding: 12px 14px; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 2px solid #e2e8f0; text-align: left; }
          td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .present { color: #166534; font-weight: 700; }
          .absent  { color: #dc2626; font-weight: 700; }
          .late    { color: #92400e; font-weight: 700; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Attendance Report: ${selectedName}</h1>
        <p>Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        <div class="stats">
          <div class="stat" style="background:#eff6ff"><p class="stat-label" style="color:#1d4ed8">Total</p><p class="stat-value" style="color:#1d4ed8">${totalRecords}</p></div>
          <div class="stat" style="background:#f0fdf4"><p class="stat-label" style="color:#166534">Present</p><p class="stat-value" style="color:#166534">${presentCount}</p></div>
          <div class="stat" style="background:#fef2f2"><p class="stat-label" style="color:#dc2626">Absent</p><p class="stat-value" style="color:#dc2626">${absentCount}</p></div>
          <div class="stat" style="background:#fffbeb"><p class="stat-label" style="color:#92400e">Late</p><p class="stat-value" style="color:#92400e">${lateCount}</p></div>
          <div class="stat" style="background:#faf5ff"><p class="stat-label" style="color:#7c3aed">Rate</p><p class="stat-value" style="color:#7c3aed">${attendanceRate}%</p></div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Student</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            ${records.map((r, i) => `
              <tr>
                <td style="color:#94a3b8">${i + 1}</td>
                <td style="font-weight:600">${r.student_name || "—"}</td>
                <td style="font-family:monospace">${r.attend_date || "—"}</td>
                <td class="${r.status}">${r.status?.charAt(0).toUpperCase() + r.status?.slice(1) || "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
    </html>
  `);
  win.document.close();
};

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>

        {/* HEADER */}
        {/* HEADER */}
        <div style={styles.header}>
          <div>
          <p style={styles.breadcrumb}>Home / Faculty / Generate Reports</p>
          <h1 style={styles.heading}>Generate Reports</h1>
          </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {selectedClassId && records.length > 0 && (
            <button
              onClick={handlePrint}
              style={styles.printBtn}
              onMouseEnter={e => (e.currentTarget.style.background = "#1e40af")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1d4ed8")}
            >
              🖨️ Print / Save PDF
            </button>
          )}
          <button
            onClick={() => navigate("/faculty/dashboard")}
            style={styles.backBtn}
            onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

        {/* SUBJECT SELECTOR CARD */}
        <div style={{ ...styles.card, marginBottom: "24px" }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Select Subject</h2>
          <p style={styles.subheading}>Choose a subject to generate its full attendance report.</p>
          <select
            style={styles.select}
            onChange={(e) => {
              const s = subjects.find(x => x.class_id === parseInt(e.target.value));
              if (s) handleGenerate(s.class_id, s.subject_name);
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <option value="">— Select a subject —</option>
            {subjects.map((s) => (
              <option key={s.class_id} value={s.class_id}>{s.subject_name}</option>
            ))}
          </select>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Generating report...</p>
          </div>
        )}

        {/* REPORT */}
        {!loading && selectedClassId && (
          <>
            {/* Summary Stats */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total Records", value: totalRecords, bg: "#eff6ff", color: "#1d4ed8" },
                { label: "Present",       value: presentCount, bg: "#f0fdf4", color: "#166534" },
                { label: "Absent",        value: absentCount,  bg: "#fef2f2", color: "#dc2626" },
                { label: "Late",          value: lateCount,    bg: "#fffbeb", color: "#92400e" },
                { label: "Attendance Rate", value: `${attendanceRate}%`, bg: "#faf5ff", color: "#7c3aed" },
              ].map((stat) => (
                <div key={stat.label} style={{ ...styles.statCard, background: stat.bg }}>
                  <p style={{ ...styles.statLabel, color: stat.color }}>{stat.label}</p>
                  <h3 style={{ ...styles.statValue, color: stat.color }}>{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={styles.sectionTitle}>Report: {selectedName}</h2>
                <span style={styles.countBadge}>{totalRecords} records</span>
              </div>

              {records.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: 500 }}>
                    No attendance records found for this subject.
                  </p>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Student</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr
                          key={i}
                          style={styles.tr}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ ...styles.td, color: "#94a3b8", width: "48px" }}>{i + 1}</td>
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
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 20px 0",
  },
  select: {
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
    cursor: "pointer",
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
    border: "1px solid transparent",
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
  printBtn: {
    padding: "10px 20px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s",
    fontFamily: "'DM Sans', sans-serif",
  },
};
