import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, getMyAttendance, logout, clearToken } from "@/services/api";
import { useUnionRole } from "@/utils/useUnionRole";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { isUnion } = useUnionRole();
  const [name, setName] = useState("...");
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [avgPct, setAvgPct] = useState(0);

  useEffect(() => {
    getMe().then((me: any) => {
      const p = me.profile?.student;
      if (p) setName(`${p.first_name} ${p.last_name}`);
    });
    getMyAttendance().then((data: any[]) => {
      if (!Array.isArray(data)) return;
      setTotalClasses(data.reduce((s, r) => s + r.total_classes, 0));
      setTotalPresent(data.reduce((s, r) => s + r.present, 0));
      setAvgPct(data.length > 0 ? Math.round(data.reduce((s, r) => s + r.attendance_percentage, 0) / data.length) : 0);
    });
  }, []);

  const handleLogout = async () => { await logout(); clearToken(); navigate("/"); };

  const isHealthy = avgPct >= 75;
  const absentCount = totalClasses - totalPresent;
  const R = 22, C = 2 * Math.PI * R;
  const filled = (Math.min(avgPct, 100) / 100) * C;

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
        <div style={styles.headerRight}>
          <span style={styles.rolePill}>Student</span>
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
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; e.currentTarget.style.background = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <p style={styles.breadcrumb}>Home · My Profile · Attendance</p>
        <h1 style={styles.heading}>Hello, {name}</h1>
        <p style={styles.subheading}>Here's your attendance summary for this semester.</p>

        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r={R} fill="none" stroke="#f1f5f9" strokeWidth="5" />
                <circle cx="26" cy="26" r={R} fill="none" stroke={isHealthy ? "#16a34a" : "#dc2626"} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${filled} ${C}`} strokeDashoffset={C / 4} />
              </svg>
              <div style={styles.miniDonutCenter}>
                <span style={{ fontSize: 9, fontWeight: 700, color: isHealthy ? "#16a34a" : "#dc2626", lineHeight: 1 }}>{avgPct}%</span>
              </div>
            </div>
            <div style={styles.statBody}>
              <span style={styles.statLabel}>Avg Attendance</span>
              <span style={{ ...styles.statValue, color: isHealthy ? "#16a34a" : "#dc2626" }}>{avgPct}%</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: "#f0fdf4" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 4L12 14.01l-3-3" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={styles.statBody}>
              <span style={styles.statLabel}>Classes Attended</span>
              <span style={{ ...styles.statValue, color: "#16a34a" }}>{totalPresent}</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: "#eff6ff" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={styles.statBody}>
              <span style={styles.statLabel}>Total Classes</span>
              <span style={{ ...styles.statValue, color: "#0f172a" }}>{totalClasses}</span>
            </div>
          </div>
        </div>

        <div style={styles.absentStrip}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
              stroke={absentCount > 0 ? "#b45309" : "#16a34a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: absentCount > 0 ? "#b45309" : "#16a34a" }}>
            {absentCount} {absentCount === 1 ? "class" : "classes"} missed this semester
          </span>
          <span style={styles.thresholdPill}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Threshold · 75%
          </span>
        </div>

        <div style={styles.sectionGrid}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIconWrap, background: "#eff6ff" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={styles.sectionTitle}>My Attendance Reports</span>
            </div>
            <div style={styles.cardGrid}>
              <ActionRow label="Attendance History" desc="View class-by-class records" onClick={() => navigate("/student/history")} />
              <ActionRow label="Attendance Report" desc="Subject-wise breakdown & charts" onClick={() => navigate("/student/report")} />
            </div>
          </div>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIconWrap, background: "#faf5ff" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="#7c3aed" strokeWidth="1.8" />
                </svg>
              </div>
              <span style={styles.sectionTitle}>Profile Settings</span>
            </div>
            <div style={styles.cardGrid}>
              <ActionRow label="Update Profile Photo" desc="Change your display picture" onClick={() => navigate("/student/profile-photo")} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

function ActionRow({ label, desc, onClick }: { label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={rowStyles.row}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,58,138,.13)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
    >
      <div style={rowStyles.text}>
        <span style={rowStyles.label}>{label}</span>
        <span style={rowStyles.desc}>{desc}</span>
      </div>
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M6 3l5 5-5 5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans', sans-serif" },
  header: { display: "flex", alignItems: "center", gap: "10px", padding: "18px 28px", background: "#fff", borderBottom: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
  logoMark: { display: "flex", alignItems: "center" },
  logoText: { fontWeight: 600, fontSize: "15px", color: "#0f172a", letterSpacing: "-0.1px", flex: 1 },
  headerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" },
  rolePill: { background: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.2px" },
  allDashBtn: { display: "inline-flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#64748b", fontFamily: "'DM Sans', sans-serif", padding: "6px 10px", borderRadius: "8px", transition: "color .15s, background .15s" },
  logoutBtn: { display: "inline-flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#64748b", fontFamily: "'DM Sans', sans-serif", padding: "6px 10px", borderRadius: "8px", transition: "color .15s, background .15s" },
  body: { maxWidth: "680px", margin: "0 auto", padding: "52px 24px", animation: "fadeUp .4s ease both" },
  breadcrumb: { fontSize: "12px", color: "#94a3b8", marginBottom: "10px", letterSpacing: "0.1px" },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.4px" },
  subheading: { fontSize: "15px", color: "#64748b", margin: "0 0 32px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "14px" },
  statCard: { background: "#fff", border: "1.5px solid #e8edf5", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 16px rgba(30,58,138,.06)" },
  statIcon: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  miniDonutCenter: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  statBody: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  statLabel: { fontSize: "11px", color: "#64748b", fontWeight: 500, lineHeight: 1.3 },
  statValue: { fontSize: "26px", fontWeight: 700, lineHeight: 1, fontFamily: "'DM Serif Display', serif" },
  absentStrip: { display: "flex", alignItems: "center", gap: "7px", background: "#fff", border: "1.5px solid #e8edf5", borderRadius: "12px", padding: "11px 16px", fontSize: "13px", fontWeight: 500, color: "#64748b", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
  thresholdPill: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", background: "#faf5ff", color: "#7c3aed", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" },
  sectionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  section: { background: "#fff", border: "1.5px solid #e8edf5", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 16px rgba(30,58,138,.06)", display: "flex", flexDirection: "column" as const, gap: "16px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "10px" },
  sectionIconWrap: { width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sectionTitle: { fontSize: "14px", fontWeight: 600, color: "#0f172a" },
  cardGrid: { display: "flex", flexDirection: "column" as const, gap: "10px" },
};
const rowStyles: Record<string, React.CSSProperties> = {
  row: { display: "flex", alignItems: "center", gap: "12px", background: "#f8faff", border: "1.5px solid #e8edf5", borderRadius: "12px", padding: "13px 15px", cursor: "pointer", textAlign: "left" as const, boxShadow: "0 1px 4px rgba(0,0,0,.04)", transition: "transform .18s, box-shadow .18s", fontFamily: "'DM Sans', sans-serif", width: "100%" },
  text: { flex: 1, display: "flex", flexDirection: "column" as const, gap: "2px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#0f172a" },
  desc: { fontSize: "12px", color: "#94a3b8" },
};
