import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, getMySubjects, getMySchedule, logout, clearToken } from "@/services/api";
import { useUnionRole } from "@/utils/useUnionRole";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { isUnion } = useUnionRole();
  const [name, setName] = useState("...");
  const [subjectCount, setSubjectCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    getMe().then((me: any) => {
      const p = me.profile?.faculty;
      if (p) setName(`${p.first_name} ${p.last_name}`);
    });
    getMySubjects().then((data: any) => {
      if (Array.isArray(data)) setSubjectCount(data.length);
    });
    getMySchedule().then((data: any) => {
      if (Array.isArray(data)) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = days[new Date().getDay()];
        setTodayCount(data.filter((s: any) => s.day_of_week === today).length);
      }
    });
  }, []);

  const handleLogout = async () => { await logout(); clearToken(); navigate("/"); };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const quickLinks = [
    {
      group: "Class Operations", color: "#1d4ed8",
      items: [
        { label: "View Attendance", sub: "Check class-wise records", path: "/faculty/mark-attendance" },
        { label: "View Students", sub: "Browse enrolled students", path: "/faculty/students" },
      ],
    },
    {
      group: "Reports & Schedule", color: "#7c3aed",
      items: [
        { label: "Class Schedule", sub: "Your weekly timetable", path: "/faculty/schedule" },
        { label: "Generate Reports", sub: "Export attendance data", path: "/faculty/reports" },
      ],
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Faculty / Dashboard</p>
            <h1 style={styles.heading}>Hello, {name} 👋</h1>
            <p style={styles.subheading}>{today}</p>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.roleBadge}>Faculty</span>
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

        {/* STAT CARDS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: "#eff6ff" }}>
              <span style={{ fontSize: "22px" }}>📚</span>
            </div>
            <div>
              <p style={styles.statLabel}>Total Subjects</p>
              <h2 style={styles.statValue}>{subjectCount}</h2>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: "#f0fdf4" }}>
              <span style={{ fontSize: "22px" }}>📅</span>
            </div>
            <div>
              <p style={styles.statLabel}>Today's Classes</p>
              <h2 style={styles.statValue}>{todayCount}</h2>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: "#faf5ff" }}>
              <span style={{ fontSize: "22px" }}>🎓</span>
            </div>
            <div>
              <p style={styles.statLabel}>Role</p>
              <h2 style={{ ...styles.statValue, fontSize: "20px" }}>Faculty</h2>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div style={styles.quickGrid}>
          {quickLinks.map((group) => (
            <div key={group.group} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "4px", height: "20px", borderRadius: "4px", background: group.color }} />
                <h2 style={styles.sectionTitle}>{group.group}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {group.items.map((item) => (
                  <div key={item.label} style={styles.linkRow}
                    onMouseEnter={(e) => { (e.currentTarget.style.borderColor = group.color); (e.currentTarget.style.background = `${group.color}08`); }}
                    onMouseLeave={(e) => { (e.currentTarget.style.borderColor = "#f1f5f9"); (e.currentTarget.style.background = "#f8fafc"); }}
                  >
                    <div>
                      <p style={styles.linkLabel}>{item.label}</p>
                      <p style={styles.linkSub}>{item.sub}</p>
                    </div>
                    <button onClick={() => navigate(item.path)}
                      style={{ ...styles.openBtn, color: group.color, borderColor: group.color }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = group.color; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = group.color; }}
                    >
                      Open →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans', sans-serif", position: "relative", padding: "40px 20px" },
  gridOverlay: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 },
  container: { position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", animation: "fadeUp .45s ease both" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" },
  breadcrumb: { fontSize: "13px", color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.3px" },
  subheading: { fontSize: "13px", color: "#94a3b8", margin: 0, fontWeight: 500 },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  roleBadge: { background: "#0f172a", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.3px" },
  allDashBtn: { display: "inline-flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#64748b", fontFamily: "'DM Sans', sans-serif", padding: "6px 10px", borderRadius: "8px", transition: "color .15s, background .15s" },
  logoutBtn: { background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color .2s", padding: 0, fontFamily: "inherit" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" },
  statCard: { background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(30,58,138,.06)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "20px" },
  statIcon: { width: "52px", height: "52px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: "13px", color: "#64748b", margin: "0 0 6px 0", fontWeight: 500 },
  statValue: { fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "'DM Serif Display', serif" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" },
  card: { background: "#ffffff", borderRadius: "20px", padding: "28px", boxShadow: "0 8px 40px rgba(30,58,138,.08)" },
  sectionTitle: { fontSize: "17px", fontWeight: 600, color: "#0f172a", margin: 0 },
  linkRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: "12px", padding: "14px 16px", transition: "border-color .2s, background .2s", cursor: "default" },
  linkLabel: { fontSize: "14px", fontWeight: 600, color: "#0f172a", margin: "0 0 2px 0" },
  linkSub: { fontSize: "12px", color: "#94a3b8", margin: 0, fontWeight: 500 },
  openBtn: { background: "transparent", border: "1.5px solid", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background .2s, color .2s", fontFamily: "inherit", whiteSpace: "nowrap" as const },
};
