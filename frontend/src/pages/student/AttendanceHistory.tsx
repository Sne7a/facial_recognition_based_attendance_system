import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyAttendance, getToken } from "@/services/api";

// ── Fetch daily detailed records ───────────────────────────────────────────────
const BASE = "https://localhost:8843";
const authFetch = (path: string) =>
  fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  }).then(r => r.json());

type SubjectSummary = { subject_name: string; total_classes: number; present: number; attendance_percentage: number };
type DailyRecord    = { attend_id: number; subject_name: string; attend_date: string; status: string; schedule_id: number };

export default function AttendanceHistory() {
  const navigate = useNavigate();

  // ── Summary (existing endpoint) ──
  const [summary, setSummary]     = useState<SubjectSummary[]>([]);
  const [daily, setDaily]         = useState<DailyRecord[]>([]);
  const [loading, setLoading]     = useState(true);

  // ── Calendar state ──
  const today      = new Date();
  const [calYear,  setCalYear]    = useState(today.getFullYear());
  const [calMonth, setCalMonth]   = useState(today.getMonth()); // 0-based
  const [selected, setSelected]   = useState<string>(today.toISOString().split("T")[0]);

  useEffect(() => {
    // Subject-wise summary
    getMyAttendance().then((data: any) => {
      if (Array.isArray(data)) setSummary(data);
    });
    // Daily records
    authFetch("/api/students/me/attendance/daily").then((data: any) => {
      if (Array.isArray(data)) setDaily(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ── Calendar helpers ──────────────────────────────────────────────────────────
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const monthNames   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayStr     = today.toISOString().split("T")[0];

  // Build a map: date string → status (if multiple records, pick "present" > "late" > "absent")
  const dateStatusMap: Record<string, string> = {};
  daily.forEach(r => {
    const existing = dateStatusMap[r.attend_date];
    if (!existing || (r.status === "present") || (r.status === "late" && existing === "absent")) {
      dateStatusMap[r.attend_date] = r.status;
    }
  });

  const dayColor = (status: string | undefined, isToday: boolean): React.CSSProperties => {
    if (isToday && !status) return { background: "#eff6ff", color: "#1d4ed8", border: "2px solid #1d4ed8", fontWeight: 700 };
    if (!status) return {};
    if (status === "present") return { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
    if (status === "late")    return { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
    return                           { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  };

  // Records for selected date
  const selectedRecords = daily.filter(r => r.attend_date === selected);

  // Today's records specifically
  const todayRecords = daily.filter(r => r.attend_date === todayStr);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const totalSubjects = summary.length;
  const overallPct    = totalSubjects > 0
    ? Math.round(summary.reduce((s, r) => s + Number(r.attendance_percentage), 0) / totalSubjects)
    : null;
  const lowCount  = summary.filter(r => r.attendance_percentage < 75).length;
  const goodCount = totalSubjects - lowCount;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Student / Attendance</p>
            <h1 style={styles.heading}>Attendance History</h1>
            <p style={styles.subheading}>Your full attendance record with daily calendar view.</p>
          </div>
          <button
            onClick={() => navigate("/student/dashboard")}
            style={styles.backBtn}
            onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "60px 0" }}>
            <div style={styles.spinner} /><span style={{ color: "#64748b", fontSize: 14 }}>Loading records…</span>
          </div>
        ) : (
          <>
            {/* ── TODAY'S ATTENDANCE BANNER ── */}
            <div style={styles.todayCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>Today — {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    {todayRecords.length === 0 ? "No attendance marked yet today" : `${todayRecords.filter(r => r.status === "present").length} of ${todayRecords.length} classes attended`}
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {todayRecords.length === 0 ? (
                    <span style={{ ...styles.statusChip, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>No records</span>
                  ) : todayRecords.map((r, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <span style={{
                        ...styles.statusChip,
                        ...(r.status === "present"
                          ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                          : r.status === "late"
                          ? { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }
                          : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" })
                      }}>
                        {r.subject_name}: {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div style={styles.statsGrid}>
              {[
                { label: "Overall Attendance", value: overallPct !== null ? `${overallPct}%` : "—", color: overallPct !== null && overallPct >= 75 ? "#166534" : "#dc2626", bg: overallPct !== null && overallPct >= 75 ? "#f0fdf4" : "#fef2f2" },
                { label: "Total Subjects",     value: totalSubjects, color: "#1d4ed8", bg: "#eff6ff" },
                { label: "Above 75%",          value: goodCount,     color: "#166534", bg: "#f0fdf4" },
                { label: "Below 75%",          value: lowCount,      color: lowCount > 0 ? "#dc2626" : "#166534", bg: lowCount > 0 ? "#fef2f2" : "#f0fdf4" },
              ].map(s => (
                <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0, fontFamily: "'DM Serif Display', serif" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── CALENDAR + SELECTED DAY ── */}
            <div style={styles.calendarRow}>

              {/* Calendar */}
              <div style={styles.calCard}>
                {/* Month nav */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <button style={styles.navBtn} onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}>←</button>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{monthNames[calMonth]} {calYear}</span>
                  <button style={styles.navBtn} onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}>→</button>
                </div>

                {/* Day names */}
                <div style={styles.dayNames}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div style={styles.dayGrid}>
                  {/* Empty cells for offset */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e${i}`} />)}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selected;
                    const status = dateStatusMap[dateStr];

                    return (
                      <div
                        key={day}
                        style={{
                          ...styles.dayCell,
                          ...dayColor(status, isToday),
                          outline: isSelected ? "2px solid #1d4ed8" : "none",
                          outlineOffset: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelected(dateStr)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Present", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
                    { label: "Absent",  bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
                    { label: "Late",    bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
                    { label: "Today",   bg: "#eff6ff", color: "#1d4ed8", border: "#1d4ed8" },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected day detail */}
              <div style={styles.dayDetailCard}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                  {selected === todayStr ? "Today" : new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>

                {selectedRecords.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
                      {selected === todayStr ? "No attendance marked yet for today." : "No records for this date."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selectedRecords.map((r, i) => (
                      <div key={i} style={styles.dayRecordRow}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 2px 0" }}>{r.subject_name}</p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Schedule #{r.schedule_id}</p>
                        </div>
                        <span style={{
                          ...styles.statusChip,
                          ...(r.status === "present"
                            ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                            : r.status === "late"
                            ? { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }
                            : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" })
                        }}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── SUBJECT SUMMARY ── */}
            <div style={styles.card}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 20 }}>Subject-wise Summary</h2>
              {summary.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "32px 0" }}>No records found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {summary.map((r, i) => {
                    const pct = Number(r.attendance_percentage);
                    const good = pct >= 75;
                    return (
                      <div key={i} style={styles.subjectRow}>
                        <div style={{ ...styles.subjectIcon, background: good ? "#f0fdf4" : "#fef2f2" }}>
                          <span style={{ fontSize: 18 }}>{good ? "📗" : "📕"}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{r.subject_name}</span>
                            <span style={{
                              fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                              background: good ? "#f0fdf4" : "#fef2f2",
                              color: good ? "#166534" : "#dc2626",
                              border: `1px solid ${good ? "#bbf7d0" : "#fecaca"}`,
                            }}>
                              {pct}%
                            </span>
                          </div>
                          <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 99, background: good ? "#22c55e" : "#ef4444", width: `${Math.min(pct, 100)}%`, transition: "width .4s" }} />
                          </div>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: "5px 0 0 0" }}>{r.present} of {r.total_classes} classes attended</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans', sans-serif", padding: "40px 20px" },
  container: { maxWidth: 1000, margin: "0 auto", animation: "fadeUp .4s ease both" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  breadcrumb: { fontSize: 13, color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.3px" },
  subheading: { fontSize: 14, color: "#94a3b8", margin: 0, fontWeight: 500 },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "color .2s", padding: 0, fontFamily: "inherit", whiteSpace: "nowrap" },
  todayCard: { background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 20px rgba(30,58,138,.08)", border: "1.5px solid #bfdbfe", marginBottom: 24 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { borderRadius: 14, padding: "18px 20px" },
  calendarRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 },
  calCard: { background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 8px 40px rgba(30,58,138,.08)" },
  dayDetailCard: { background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 8px 40px rgba(30,58,138,.08)" },
  dayNames: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 },
  dayGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  dayCell: { width: "100%", aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s", color: "#0f172a" },
  navBtn: { background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 14, color: "#475569", fontFamily: "inherit" },
  dayRecordRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" },
  statusChip: { fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 },
  card: { background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 8px 40px rgba(30,58,138,.08)", marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: "#0f172a", margin: 0 },
  subjectRow: { display: "flex", alignItems: "flex-start", gap: 14 },
  subjectIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  spinner: { width: 24, height: 24, border: "3px solid #e2e8f0", borderTop: "3px solid #1d4ed8", borderRadius: "50%", animation: "spin .8s linear infinite" },
};
