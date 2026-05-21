import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/api";

export default function AllAttendance() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for Filtering and Sorting
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");

  useEffect(() => {
    getAnalytics().then((data: any) => { 
      if (data.subject_wise) setSubjects(data.subject_wise); 
      setLoading(false); 
    });
  }, []);

  // Filter and Sort Logic
  let displayedData = [...subjects];

  if (search) {
    displayedData = displayedData.filter((s) => 
      String(s.class_id || "").toLowerCase().includes(search.toLowerCase()) ||
      String(s.subject_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sortOrder === "asc") {
    displayedData.sort((a, b) => a.attendance_percentage - b.attendance_percentage);
  } else if (sortOrder === "desc") {
    displayedData.sort((a, b) => b.attendance_percentage - a.attendance_percentage);
  }

  return (
    <div style={styles.page}>
      {/* Background grid pattern matching login.tsx */}
      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Admin Panel / Attendance Log</p>
            <h1 style={styles.heading}>Master Attendance</h1>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.backBtn}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {/* Toolbar: Search and Sort */}
          <div style={styles.toolbar}>
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <input 
                placeholder="Search by Class ID or Subject..." 
                style={styles.input}
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={styles.label}>Sort By:</label>
              <select 
                style={styles.select} 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as any)}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              >
                <option value="default">Default</option>
                <option value="asc">Lowest to Highest %</option>
                <option value="desc">Highest to Lowest %</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? ( 
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontWeight: 500 }}>
              Loading attendance records...
            </div> 
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Class ID</th>
                    <th style={styles.th}>Subject Name</th>
                    <th style={{...styles.th, textAlign: "center"}}>Total Classes</th>
                    <th style={{...styles.th, textAlign: "center"}}>Avg. Present</th>
                    <th style={{...styles.th, textAlign: "right"}}>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((s, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.idBadge}>{s.class_id || "N/A"}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>
                        {s.subject_name}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{s.total_classes}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{s.present}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={{
                          ...styles.percentBadge,
                          background: s.attendance_percentage >= 75 ? "#f0fdf4" : "#fef2f2",
                          color: s.attendance_percentage >= 75 ? "#166534" : "#dc2626",
                          border: `1px solid ${s.attendance_percentage >= 75 ? "#bbf7d0" : "#fecaca"}`
                        }}>
                          {s.attendance_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {displayedData.length === 0 && (
                     <tr>
                       <td colSpan={5} style={{...styles.td, textAlign: "center", padding: "40px", color: "#94a3b8"}}>
                         No records found matching your search.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
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
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    padding: "40px 20px",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)",
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
  headerActions: {
    display: "flex",
    alignItems: "center",
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
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "11px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "border-color .2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    padding: "11px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
    cursor: "pointer",
    transition: "border-color .2s",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
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
    padding: "16px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
    borderBottom: "1.5px solid #f1f5f9",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#475569",
    verticalAlign: "middle",
  },
  idBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  percentBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-block",
  }
};