import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SystemSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    schoolName: "ABC International School",
    email: "info@abcschool.edu",
    year: "2025-2026",
    startDate: "01-08-2025",
    endDate: "15-12-2025",
    minAttendance: 75,
    grace: 15,
    lowAttendance: 60,
    emailNotif: true,
    smsNotif: false,
    parentAlert: true,
    weeklyReports: true,
    reportDay: "Friday",
    twoFA: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    backup: "Daily",
  });

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

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
            <h1 style={styles.heading}>System Settings</h1>
            <p style={styles.subheading}>Configure system-wide settings and preferences.</p>
          </div>
          <button 
            style={styles.primaryBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e40af")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          >
            💾 Save Changes
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* General Settings */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📅 General Settings</h2>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Institution Name</label>
                <input style={styles.input} value={settings.schoolName} onChange={e => setSettings({ ...settings, schoolName: e.target.value })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contact Email</label>
                <input style={styles.input} value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Academic Year</label>
                <input style={styles.input} value={settings.year} onChange={e => setSettings({ ...settings, year: e.target.value })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
            <div style={{ ...styles.formGrid, gridTemplateColumns: "1fr 1fr", marginTop: "16px" }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Start Date</label>
                <input style={styles.input} value={settings.startDate} onChange={e => setSettings({ ...settings, startDate: e.target.value })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>End Date</label>
                <input style={styles.input} value={settings.endDate} onChange={e => setSettings({ ...settings, endDate: e.target.value })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
          </div>

          {/* Attendance Settings */}
          <div style={styles.card}>
            <h2 style={{ ...styles.sectionTitle, color: "#059669" }}>🟢 Attendance Settings</h2>
            <div style={{ ...styles.formGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Minimum Attendance (%)</label>
                <input type="number" style={styles.input} value={settings.minAttendance} onChange={e => setSettings({ ...settings, minAttendance: Number(e.target.value) })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Grace Period (mins)</label>
                <input type="number" style={styles.input} value={settings.grace} onChange={e => setSettings({ ...settings, grace: Number(e.target.value) })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Low Attendance Alert (%)</label>
                <input type="number" style={styles.input} value={settings.lowAttendance} onChange={e => setSettings({ ...settings, lowAttendance: Number(e.target.value) })} onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {/* Notification Settings */}
            <div style={styles.card}>
              <h2 style={{ ...styles.sectionTitle, color: "#ea580c" }}>🔔 Notification Settings</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { key: "emailNotif",  label: "Enable Email Notifications" },
                  { key: "smsNotif",    label: "Enable SMS Notifications" },
                  { key: "parentAlert", label: "Notify Parents of Low Attendance" },
                ].map(({ key, label }) => {
                  const val = settings[key as keyof typeof settings] as boolean;
                  return (
                    <div key={key} style={styles.toggleRow}>
                      <span style={styles.toggleLabel}>{label}</span>
                      <div style={{ ...styles.toggleTrack, background: val ? "#1d4ed8" : "#cbd5e1" }} onClick={() => handleToggle(key)}>
                        <div style={{ ...styles.toggleKnob, transform: val ? "translateX(20px)" : "translateX(2px)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report Generation */}
            <div style={styles.card}>
              <h2 style={{ ...styles.sectionTitle, color: "#7c3aed" }}>📩 Report Generation</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[{ key: "weeklyReports", label: "Auto-Generate Weekly Reports" }].map(({ key, label }) => {
                  const val = settings[key as keyof typeof settings] as boolean;
                  return (
                    <div key={key} style={styles.toggleRow}>
                      <span style={styles.toggleLabel}>{label}</span>
                      <div style={{ ...styles.toggleTrack, background: val ? "#1d4ed8" : "#cbd5e1" }} onClick={() => handleToggle(key)}>
                        <div style={{ ...styles.toggleKnob, transform: val ? "translateX(20px)" : "translateX(2px)" }} />
                      </div>
                    </div>
                  );
                })}
                
                <div style={{ ...styles.fieldGroup, marginTop: "16px" }}>
                  <label style={styles.label}>Report Generation Day</label>
                  <select 
                    style={styles.input} 
                    value={settings.reportDay} 
                    onChange={e => setSettings({ ...settings, reportDay: e.target.value })}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button 
              style={{ ...styles.primaryBtn, padding: "14px 32px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1e40af")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
            >
              💾 Save All Settings
            </button>
          </div>
          
        </div>
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
    maxWidth: "1000px",
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
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "6px 0 0 0",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 8px 40px rgba(30,58,138,.06)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1d4ed8",
    margin: "0 0 24px 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "border-color .2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  toggleLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#334155",
  },
  toggleTrack: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.3s ease",
    display: "flex",
    alignItems: "center",
  },
  toggleKnob: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s",
    fontFamily: "'DM Sans', sans-serif",
  }
};