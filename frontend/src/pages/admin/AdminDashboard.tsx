import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalytics, logout, clearToken } from "@/services/api";
import { useUnionRole } from "@/utils/useUnionRole";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isUnion } = useUnionRole();
  const [stats, setStats] = useState({ total_students: 0, total_classes_held: 0, overall_attendance_rate: 0 });

  useEffect(() => {
    getAnalytics().then((data: any) => {
      if (data.total_students !== undefined) setStats(data);
    });
  }, []);

  const handleLogout = async () => { await logout(); clearToken(); navigate("/"); };

  const systemManagement = [["Manage Users", "/admin/users"], ["Subject Management", "/admin/subjects"], ["System Settings", "/admin/settings"]];
  const analyticsReports = [["Master Attendance Log", "/admin/attendance"], ["Generate Reports", "/admin/reports"], ["Database Management", "/admin/database"]];

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Admin Panel / Control Center</p>
            <h1 style={styles.heading}>Admin Dashboard</h1>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.badge}>Admin</span>
            {isUnion && (
              <button style={styles.allDashBtn} onClick={() => navigate("/dashboard")}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.background = "#eff6ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                All Dashboards
              </button>
            )}
            <button style={styles.logoutBtn} onClick={handleLogout}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.card}>
            <p style={styles.statLabel}>Total Students</p>
            <h2 style={styles.statValue}>{stats.total_students}</h2>
          </div>
          <div style={styles.card}>
            <p style={styles.statLabel}>Classes Held</p>
            <h2 style={styles.statValue}>{stats.total_classes_held}</h2>
          </div>
          <div style={styles.card}>
            <p style={styles.statLabel}>Overall Attendance</p>
            <h2 style={styles.statValue}>{stats.overall_attendance_rate}%</h2>
          </div>
        </div>

        {/* Main grid */}
        <div style={styles.mainGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>System Management</h2>
            <div style={styles.list}>
              {systemManagement.map(([label, path]) => (
                <div key={path} style={styles.listItem}>
                  <span style={styles.listText}>{label}</span>
                  <button onClick={() => navigate(path)} style={styles.openBtn}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#1d4ed8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >Open</button>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Insights & Operations</h2>
            <div style={styles.list}>
              {analyticsReports.map(([label, path]) => (
                <div key={path} style={styles.listItem}>
                  <span style={styles.listText}>{label}</span>
                  <button onClick={() => navigate(path)} style={styles.openBtn}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#1d4ed8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >Open</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans', sans-serif", position: "relative", padding: "40px 20px" },
  gridOverlay: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 },
  container: { position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", animation: "fadeUp .45s ease both" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
  breadcrumb: { fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" },
  headerActions: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { background: "#1d4ed8", color: "#ffffff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.3px" },
  allDashBtn: { display: "inline-flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#64748b", fontFamily: "'DM Sans', sans-serif", padding: "6px 10px", borderRadius: "8px", transition: "color .15s, background .15s" },
  logoutBtn: { background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color .2s", padding: 0, fontFamily: "inherit" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "32px" },
  card: { background: "#ffffff", borderRadius: "20px", padding: "28px", boxShadow: "0 8px 40px rgba(30,58,138,.08)" },
  statLabel: { fontSize: "14px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  statValue: { fontSize: "36px", fontFamily: "'DM Serif Display', serif", color: "#0f172a", margin: 0 },
  mainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" },
  sectionTitle: { fontSize: "18px", fontWeight: 600, color: "#0f172a", margin: "0 0 20px 0" },
  list: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1.5px solid #f1f5f9", borderRadius: "14px", background: "#fafaf9" },
  listText: { fontSize: "15px", color: "#334155", fontWeight: 500 },
  openBtn: { background: "transparent", border: "1.5px solid #e2e8f0", color: "#0f172a", padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s ease", fontFamily: "inherit" },
};
