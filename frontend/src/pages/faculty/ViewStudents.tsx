import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMySubjects, getClassAttendance } from "@/services/api";

export default function ViewStudents() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMySubjects().then((data: any) => { if (Array.isArray(data)) setSubjects(data); });
  }, []);

  const handleSelect = (classId: number, name: string) => {
    setSelectedClassId(classId);
    setSelectedName(name);
    setSearch("");
    setLoading(true);
    getClassAttendance(classId).then((data: any) => {
      if (Array.isArray(data)) {
        const seen = new Set();
        setStudents(data.filter((r: any) => {
          if (seen.has(r.student_id)) return false;
          seen.add(r.student_id);
          return true;
        }));
      }
      setLoading(false);
    });
  };

  const filtered = students.filter(s =>
    !search ||
    String(s.student_id).includes(search) ||
    (s.student_name && s.student_name.toLowerCase().includes(search.toLowerCase()))
  );

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

  const initials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    "#1d4ed8", "#7c3aed", "#059669", "#d97706",
    "#dc2626", "#0891b2", "#db2777", "#65a30d"
  ];

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Faculty / Students</p>
            <h1 style={styles.heading}>View Students</h1>
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
          <p style={styles.subheading}>Choose a subject to view its enrolled students.</p>
          {subjects.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>No subjects assigned yet.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {subjects.map((s) => (
                <button
                  key={s.class_id}
                  style={subjectBtnStyle(s.class_id)}
                  onClick={() => handleSelect(s.class_id, s.subject_name)}
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
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading students...</p>
          </div>
        )}

        {/* STUDENTS */}
        {!loading && selectedClassId && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <h2 style={styles.sectionTitle}>{selectedName}</h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0", fontWeight: 500 }}>
                  {students.length} student{students.length !== 1 ? "s" : ""} enrolled
                </p>
              </div>
              <span style={styles.countBadge}>{filtered.length} shown</span>
            </div>

            {/* Search */}
            <input
              style={{ ...styles.input, marginBottom: "24px" }}
              placeholder="Search by name or student ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />

            {filtered.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: 500 }}>
                  No students found{search ? ` matching "${search}"` : ""}.
                </p>
              </div>
            ) : (
              <div style={styles.studentGrid}>
                {filtered.map((s, i) => (
                  <div
                    key={i}
                    style={styles.studentCard}
                    onMouseEnter={(e) => {
                      (e.currentTarget.style.borderColor = "#1d4ed8");
                      (e.currentTarget.style.transform = "translateY(-2px)");
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget.style.borderColor = "#f1f5f9");
                      (e.currentTarget.style.transform = "translateY(0)");
                    }}
                  >
                    <div style={{
                      ...styles.avatar,
                      background: avatarColors[i % avatarColors.length],
                    }}>
                      {initials(s.student_name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={styles.studentName}>{s.student_name || "Unknown"}</p>
                      <p style={styles.studentId}>ID: {s.student_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  input: {
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
  },
  studentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    borderRadius: "14px",
    border: "1.5px solid #f1f5f9",
    background: "#fafbff",
    transition: "border-color .2s, transform .2s",
    cursor: "default",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    flexShrink: 0,
  },
  studentName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 4px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  studentId: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
    fontWeight: 500,
    fontFamily: "monospace",
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
