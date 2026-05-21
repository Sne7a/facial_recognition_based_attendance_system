import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "@/services/api";

// ── API helpers ────────────────────────────────────────────────────────────────
const BASE = "https://172.20.10.2:8843";
const authFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  }).then(r => r.json());

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = "list" | "create";
type FilterStudent = { student_id: number; first_name: string; last_name: string; curr_semester: number };
type AttendanceRecord = {
  attend_id: number; student_id: number; student_name: string;
  schedule_id: number; subject_name: string; day_of_week: string;
  start_time: string; attend_date: string; status: string; recorded_at: string | null;
};
type Schedule = { schedule_id: number; subject_name: string; day_of_week: string; start_time: string; end_time: string; room_identifier: string };
type ClassItem = { class_id: number; subject_name: string };

export default function DatabaseManagement() {
  const navigate = useNavigate();

  // ── Info cards (top) ──
  const infoCards = [
    { label: "Database Engine", value: "MySQL",       icon: "🗄️", color: "#1d4ed8", bg: "#eff6ff" },
    { label: "Backend Framework", value: "FastAPI",   icon: "⚡", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "ORM",              value: "SQLAlchemy", icon: "🔗", color: "#059669", bg: "#ecfdf5" },
    { label: "Status",           value: "Live",       icon: "🟢", color: "#059669", bg: "#ecfdf5" },
  ];

  // ── State ──
  const [step, setStep]             = useState<Step>("list");
  const [records, setRecords]       = useState<AttendanceRecord[]>([]);
  const [students, setStudents]     = useState<FilterStudent[]>([]);
  const [schedules, setSchedules]   = useState<Schedule[]>([]);
  const [classes, setClasses]       = useState<ClassItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState("");
  const [isError, setIsError]       = useState(false);
  const [search, setSearch]         = useState("");

  // Filters
  const [filterStudent, setFilterStudent] = useState("");
  const [filterClass,   setFilterClass]   = useState("");

  // Create form
  const [form, setForm] = useState({
    student_id: "", schedule_id: "", attend_date: new Date().toISOString().split("T")[0], status: "present",
  });

  const showMsg = (msg: string, err = false) => { setMessage(msg); setIsError(err); };

  // ── Load dropdowns on mount ──
  useEffect(() => {
    authFetch("/api/admin/students/all").then((d: any) => { if (Array.isArray(d)) setStudents(d); });
    authFetch("/api/admin/schedules").then((d: any)    => { if (Array.isArray(d)) setSchedules(d); });
    authFetch("/api/admin/classes").then((d: any)      => { if (Array.isArray(d)) setClasses(d); });
    loadRecords();
  }, []);

  const loadRecords = (sid = filterStudent, cid = filterClass) => {
    setLoading(true);
    let url = "/api/admin/attendance";
    const params = [];
    if (sid) params.push(`student_id=${sid}`);
    if (cid) params.push(`class_id=${cid}`);
    if (params.length) url += "?" + params.join("&");
    authFetch(url).then((d: any) => {
      if (Array.isArray(d)) setRecords(d);
      setLoading(false);
    });
  };

  const handleFilter = () => loadRecords(filterStudent, filterClass);

  const handleCreate = async () => {
    if (!form.student_id || !form.schedule_id || !form.attend_date) {
      showMsg("Please fill in all fields.", true); return;
    }
    setLoading(true); showMsg("");
    const res = await authFetch("/api/admin/attendance", {
      method: "POST",
      body: JSON.stringify({
        student_id: parseInt(form.student_id),
        schedule_id: parseInt(form.schedule_id),
        attend_date: form.attend_date,
        status: form.status,
      }),
    });
    setLoading(false);
    if (res.success) {
      showMsg("Attendance record created successfully!");
      setStep("list");
      setForm({ student_id: "", schedule_id: "", attend_date: new Date().toISOString().split("T")[0], status: "present" });
      loadRecords();
    } else {
      showMsg(res.detail || "Failed to create record.", true);
    }
  };

  const handleDelete = async (attend_id: number) => {
    if (!window.confirm("Delete this attendance record? This cannot be undone.")) return;
    showMsg("");
    const res = await authFetch(`/api/admin/attendance/${attend_id}`, { method: "DELETE" });
    if (res.success) {
      showMsg("Record deleted.");
      setRecords(prev => prev.filter(r => r.attend_id !== attend_id));
    } else {
      showMsg(res.detail || "Failed to delete.", true);
    }
  };

  const statusStyle = (status: string): React.CSSProperties => {
    if (status === "present") return { ...styles.statusBadge, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
    if (status === "late")    return { ...styles.statusBadge, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
    return                           { ...styles.statusBadge, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" };
  };

  const filtered = records.filter(r =>
    !search ||
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.subject_name.toLowerCase().includes(search.toLowerCase()) ||
    r.attend_date.includes(search) ||
    r.status.includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Admin Panel / Database Management</p>
            <h1 style={styles.heading}>Database Management</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {step !== "list" && (
              <button style={styles.secondaryBtn} onClick={() => { setStep("list"); showMsg(""); }}>← Back</button>
            )}
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.backBtn}
              onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* INFO CARDS */}
        <div style={styles.infoCardsGrid}>
          {infoCards.map((c, i) => (
            <div key={i} style={{ ...styles.infoCard, borderTop: `4px solid ${c.color}` }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <div style={{ ...styles.iconWrapper, background: c.bg }}>{c.icon}</div>
              <div>
                <div style={styles.cardLabel}>{c.label}</div>
                <div style={{ ...styles.cardValue, color: c.color }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={isError ? styles.errorBox : styles.successBox}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: isError ? "#dc2626" : "#22c55e", flexShrink: 0 }} />
            {message}
          </div>
        )}

        {/* ══ LIST VIEW ══ */}
        {step === "list" && (
          <div style={styles.card}>
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={styles.sectionTitle}>Attendance Records</h2>
                <p style={styles.subheading}>View, filter, create and delete attendance entries.</p>
              </div>
              <button style={styles.primaryBtn}
                onClick={() => { setStep("create"); showMsg(""); }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1e40af")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1d4ed8")}>
                + Create Record
              </button>
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
              <select style={styles.select} value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
              <select style={styles.select} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.subject_name}</option>
                ))}
              </select>
              <button style={styles.filterBtn} onClick={handleFilter}>Apply Filter</button>
              <button style={styles.secondaryBtn} onClick={() => { setFilterStudent(""); setFilterClass(""); loadRecords("", ""); }}>Clear</button>
            </div>

            {/* Search */}
            <input
              style={{ ...styles.input, marginBottom: "20px" }}
              placeholder="Search by student, subject, date or status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />

            {/* Stats strip */}
            {records.length > 0 && (
              <div style={styles.miniStats}>
                {[
                  { label: "Total", value: records.length, color: "#1d4ed8", bg: "#eff6ff" },
                  { label: "Present", value: records.filter(r => r.status === "present").length, color: "#166534", bg: "#f0fdf4" },
                  { label: "Absent",  value: records.filter(r => r.status === "absent").length,  color: "#dc2626", bg: "#fef2f2" },
                  { label: "Late",    value: records.filter(r => r.status === "late").length,    color: "#92400e", bg: "#fffbeb" },
                ].map(s => (
                  <div key={s.label} style={{ ...styles.miniStat, background: s.bg }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 0" }}>
                <div style={styles.spinner} />
                <span style={{ color: "#64748b", fontSize: 14 }}>Loading records...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 500 }}>
                  {records.length === 0 ? "No attendance records found." : `No records matching "${search}".`}
                </p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Day</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={i} style={styles.tr}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ ...styles.td, color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>{r.attend_id}</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>{r.student_name}</td>
                        <td style={styles.td}>{r.subject_name}</td>
                        <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 13 }}>{r.attend_date}</td>
                        <td style={styles.td}>{r.day_of_week}</td>
                        <td style={styles.td}><span style={statusStyle(r.status)}>{r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}</span></td>
                        <td style={styles.td}>
                          <button
                            style={{ background: "none", border: "none", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            onClick={() => handleDelete(r.attend_id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, textAlign: "right" }}>
              Showing {filtered.length} of {records.length} records
            </p>
          </div>
        )}

        {/* ══ CREATE VIEW ══ */}
        {step === "create" && (
          <div style={{ ...styles.card, maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 8 }}>Create Attendance Record</h2>
            <p style={styles.subheading}>Manually add an attendance entry for a student.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Student</label>
                <select style={styles.input} value={form.student_id}
                  onChange={e => setForm({ ...form, student_id: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                  <option value="">— Select student —</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name} (Sem {s.curr_semester})</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Class / Schedule</label>
                <select style={styles.input} value={form.schedule_id}
                  onChange={e => setForm({ ...form, schedule_id: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                  <option value="">— Select schedule —</option>
                  {schedules.map(s => (
                    <option key={s.schedule_id} value={s.schedule_id}>
                      [{s.schedule_id}] {s.subject_name} — {s.day_of_week} {s.start_time.slice(0,5)} ({s.room_identifier})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Date</label>
                <input type="date" style={styles.input} value={form.attend_date}
                  onChange={e => setForm({ ...form, attend_date: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Status</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["present", "absent", "late"] as const).map(s => (
                    <button key={s}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                        border: form.status === s ? "2px solid" : "1.5px solid #e2e8f0",
                        background: form.status === s
                          ? s === "present" ? "#f0fdf4" : s === "late" ? "#fffbeb" : "#fef2f2"
                          : "#f8fafc",
                        color: form.status === s
                          ? s === "present" ? "#166534" : s === "late" ? "#92400e" : "#dc2626"
                          : "#64748b",
                        borderColor: form.status === s
                          ? s === "present" ? "#22c55e" : s === "late" ? "#f59e0b" : "#ef4444"
                          : "#e2e8f0",
                      }}
                      onClick={() => setForm({ ...form, status: s })}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button style={styles.secondaryBtn} onClick={() => { setStep("list"); showMsg(""); }}>Cancel</button>
              <button style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
                onClick={handleCreate} disabled={loading}>
                {loading ? "Creating..." : "Create Record"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans', sans-serif", position: "relative", padding: "40px 20px" },
  gridOverlay: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 },
  container: { position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", animation: "fadeUp .45s ease both" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
  breadcrumb: { fontSize: 13, color: "#64748b", margin: "0 0 8px 0", fontWeight: 500 },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "color .2s", padding: 0, fontFamily: "inherit" },
  infoCardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 },
  infoCard: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(30,58,138,.05)", transition: "transform .2s", display: "flex", alignItems: "center", gap: 16 },
  iconWrapper: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
  cardLabel: { fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: 700 },
  card: { background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 8px 40px rgba(30,58,138,.08)", marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: "#0f172a", margin: 0 },
  subheading: { fontSize: 14, color: "#64748b", margin: "4px 0 0 0" },
  primaryBtn: { padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background .2s", fontFamily: "inherit" },
  secondaryBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 },
  filterBtn: { padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  select: { padding: "10px 14px", fontSize: 14, border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", background: "#f8fafc", color: "#0f172a", fontFamily: "inherit", cursor: "pointer", minWidth: 180 },
  input: { width: "100%", padding: "11px 14px", fontSize: 14, border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", background: "#f8fafc", color: "#0f172a", boxSizing: "border-box", transition: "border-color .2s", fontFamily: "inherit" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  miniStats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px,1fr))", gap: 12, marginBottom: 20 },
  miniStat: { borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  tableContainer: { borderRadius: 12, border: "1.5px solid #f1f5f9", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { background: "#f8fafc", padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1.5px solid #f1f5f9" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background .15s" },
  td: { padding: "14px 16px", fontSize: 14, color: "#475569" },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  successBox: { display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#166534", marginBottom: 24, fontWeight: 500 },
  errorBox:   { display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#dc2626", marginBottom: 24, fontWeight: 500 },
  spinner: { width: 28, height: 28, border: "3px solid #e2e8f0", borderTop: "3px solid #1d4ed8", borderRadius: "50%", animation: "spin .8s linear infinite" },
  emptyBox: { textAlign: "center", padding: "48px 0" },
};
