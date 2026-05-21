import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/api";

export default function AdminReports() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => { 
    getAnalytics().then((d: any) => setData(d)); 
  }, []);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background grid pattern */}
      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        <button 
          style={styles.backBtn} 
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.adminBadge}>Admin Panel</span>
            <h1 style={styles.heading}>Generate Reports</h1>
          </div>
          <button 
            style={styles.primaryBtn}
            onClick={() => window.print()}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e40af")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          >
            📄 Print / Save PDF
          </button>
        </div>

        {!data ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b", fontWeight: 500, fontSize: "16px" }}>
            Loading report data from database...
          </div>
        ) : (
          <div style={styles.cardsGrid}>

            {/* 1. Summary Card */}
            <div style={{ ...styles.card, borderTop: "4px solid #1d4ed8" }}>
              <h2 style={styles.cardTitle}>Attendance Summary</h2>
              <div style={styles.rowContainer}>
                {[
                  ["Overall Rate", `${data.overall_attendance_rate}%`],
                  ["Total Students", data.total_students],
                  ["Classes Held", data.total_classes_held],
                ].map(([k, v]) => (
                  <div key={String(k)} style={styles.row}>
                    <span style={styles.rowLabel}>{k}</span>
                    <span style={styles.rowValue}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Subject Breakdown */}
            <div style={{ ...styles.card, borderTop: "4px solid #8b5cf6" }}>
              <h2 style={styles.cardTitle}>Subject Report</h2>
              <div style={styles.rowContainer}>
                {data.subject_wise?.length === 0 && <p style={styles.emptyText}>No data available.</p>}
                {data.subject_wise?.map((s: any, i: number) => (
                  <div key={i} style={styles.row}>
                    <span style={styles.rowLabel}>{s.subject_name}</span>
                    <span style={{ 
                      ...styles.rowValue, 
                      color: s.attendance_percentage >= 75 ? "#166534" : "#dc2626",
                      background: s.attendance_percentage >= 75 ? "#f0fdf4" : "#fef2f2",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "13px"
                    }}>
                      {s.attendance_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Low Attendance / Action Required */}
            <div style={{ ...styles.card, borderTop: "4px solid #dc2626", background: "#fef2f2" }}>
              <h2 style={{ ...styles.cardTitle, color: "#991b1b" }}>⚠ Attention Required</h2>
              <p style={{ fontSize: "13px", color: "#b91c1c", marginBottom: "16px", fontWeight: 500 }}>Subjects falling below 75% threshold.</p>
              
              <div style={{ ...styles.rowContainer, borderColor: "#fecaca" }}>
                {data.subject_wise?.filter((s: any) => s.attendance_percentage < 75).length === 0 && (
                  <div style={{ color: "#166534", fontSize: "14px", padding: "20px 0", fontWeight: 600 }}>
                    ✅ All subjects are performing above 75%
                  </div>
                )}
                {data.subject_wise?.filter((s: any) => s.attendance_percentage < 75).map((s: any, i: number) => (
                  <div key={i} style={{...styles.row, borderColor: "#fecaca"}}>
                    <span style={{...styles.rowLabel, color: "#991b1b"}}>{s.subject_name}</span>
                    <span style={{ ...styles.rowValue, color: "#dc2626", fontWeight: 700 }}>
                      {s.attendance_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
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
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#1d4ed8",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
  },
  adminBadge: {
    background: "#1d4ed8",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    display: "inline-block",
    marginBottom: "12px",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  primaryBtn: {
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
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 8px 40px rgba(30,58,138,.06)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 20px 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  rowContainer: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  rowLabel: {
    fontSize: "14px",
    color: "#475569",
    fontWeight: 500,
  },
  rowValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    padding: "10px 0",
  }
};