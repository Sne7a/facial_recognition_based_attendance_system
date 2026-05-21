import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllSubjects, createSubject, getAllClasses, getStudentsBySemester, enrollStudent } from "@/services/api";

export default function SubjectManagement() {
  const navigate = useNavigate();

  // --- Core State ---
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Step Flow: "list" | "createSubject" | "enroll" ---
  const [step, setStep] = useState<"list" | "createSubject" | "enroll">("list");

  // --- Create Subject Form ---
  const [form, setForm] = useState({ subject_name: "", subject_code: "", semester_id: "" });

  // --- Enroll State ---
  const [enrollClassId, setEnrollClassId] = useState("");
  const [enrollSemester, setEnrollSemester] = useState("");
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [semesterLoaded, setSemesterLoaded] = useState(false);

  const loadSubjects = () =>
    getAllSubjects().then((data: any) => { if (Array.isArray(data)) setSubjects(data); });

  const loadClasses = () =>
    getAllClasses().then((data: any) => { if (Array.isArray(data)) setClasses(data); });

  useEffect(() => { loadSubjects(); loadClasses(); }, []);

  // Load students when semester is selected in enroll step
  const handleSemesterChange = async (sem: string) => {
    setEnrollSemester(sem);
    setEnrollStudentId("");
    setSemesterLoaded(false);
    if (!sem) return;
    const data = await getStudentsBySemester(parseInt(sem));
    if (Array.isArray(data)) setStudents(data);
    setSemesterLoaded(true);
  };

  // --- Create Subject ---
  const handleCreate = async () => {
    if (!form.subject_name || !form.subject_code || !form.semester_id) {
      setMessage("Please fill in all fields."); return;
    }
    setLoading(true);
    const res = await createSubject(form.subject_name, form.subject_code, parseInt(form.semester_id));
    if (res.subject_id) {
      setMessage("Subject created successfully!");
      setForm({ subject_name: "", subject_code: "", semester_id: "" });
      setStep("list");
      loadSubjects();
    } else {
      setMessage(res.detail || "Failed to create subject.");
    }
    setLoading(false);
  };

  // --- Enroll Student ---
  const handleEnroll = async () => {
    if (!enrollClassId || !enrollStudentId) {
      setMessage("Please select a class and a student."); return;
    }
    setLoading(true);
    const res = await enrollStudent(parseInt(enrollStudentId), parseInt(enrollClassId));
    if (res.success) {
      setMessage("Student enrolled successfully!");
      setEnrollStudentId("");
    } else {
      setMessage(res.detail || "Enrollment failed.");
    }
    setLoading(false);
  };

  const colors = ["#1d4ed8", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Admin Panel / Subjects</p>
            <h1 style={styles.heading}>Subject Management</h1>
          </div>
          <div style={styles.headerActions}>
            {step !== "list" && (
              <button
                style={styles.secondaryBtn}
                onClick={() => { setStep("list"); setMessage(""); }}
              >
                ← Back
              </button>
            )}
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

        {/* MESSAGE */}
        {message && (
          <div style={message.toLowerCase().includes("success") ? styles.successBox : styles.errorBox}>
            <span style={message.toLowerCase().includes("success") ? styles.successDot : styles.errorDot} />
            {message}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {step === "list" && (
          <>
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
              <button
                style={styles.primaryBtn}
                onClick={() => { setStep("createSubject"); setMessage(""); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1e40af")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
              >
                + Add Subject
              </button>
              <button
                style={{ ...styles.primaryBtn, background: "#7c3aed" }}
                onClick={() => { setStep("enroll"); setMessage(""); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
              >
                + Enroll Student
              </button>
            </div>

            {/* Subjects Grid */}
            {subjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontWeight: 500 }}>
                No subjects found. Click "+ Add Subject" to create one.
              </div>
            ) : (
              <div style={styles.subjectsGrid}>
                {subjects.map((s, i) => (
                  <div
                    key={i}
                    style={{ ...styles.subjectCard, borderTop: `4px solid ${colors[i % colors.length]}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <span style={{
                        background: `${colors[i % colors.length]}15`,
                        color: colors[i % colors.length],
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}>
                        {s.subject_code || "—"}
                      </span>
                      <span style={styles.semesterBadge}>Sem {s.semester_id}</span>
                    </div>
                    <h3 style={styles.subjectName}>{s.subject_name}</h3>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CREATE SUBJECT VIEW ── */}
        {step === "createSubject" && (
          <div style={{ ...styles.card, maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>New Subject Details</h2>
            <p style={styles.subheading}>Add a new subject to the system. It can be assigned to a class later.</p>

            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Subject Name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Data Structures"
                  value={form.subject_name}
                  onChange={e => setForm({ ...form, subject_name: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Subject Code</label>
                <input
                  style={styles.input}
                  placeholder="e.g. CS101"
                  value={form.subject_code}
                  onChange={e => setForm({ ...form, subject_code: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Semester</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="e.g. 3"
                  value={form.semester_id}
                  onChange={e => setForm({ ...form, semester_id: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => { setStep("list"); setMessage(""); }} style={styles.secondaryBtn}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating..." : "Create Subject"}
              </button>
            </div>
          </div>
        )}

        {/* ── ENROLL STUDENT VIEW ── */}
        {step === "enroll" && (
          <div style={{ ...styles.card, maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Enroll Student into Class</h2>
            <p style={styles.subheading}>
              Select the class, then filter students by semester and choose the student to enroll.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Step 1 — Select Class */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Step 1 — Select Class</label>
                <select
                  style={styles.input}
                  value={enrollClassId}
                  onChange={e => setEnrollClassId(e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— Choose a class —</option>
                  {classes.map((c: any) => (
                    <option key={c.class_id} value={c.class_id}>
                      [{c.class_id}] {c.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2 — Select Semester */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Step 2 — Filter by Semester</label>
                <select
                  style={styles.input}
                  value={enrollSemester}
                  onChange={e => handleSemesterChange(e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— Choose a semester —</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
              </div>

              {/* Step 3 — Select Student */}
              {enrollSemester && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Step 3 — Select Student</label>
                  {!semesterLoaded ? (
                    <p style={{ fontSize: "13px", color: "#64748b" }}>Loading students...</p>
                  ) : students.length === 0 ? (
                    <div style={styles.emptyNotice}>
                      No students found in Semester {enrollSemester}.
                    </div>
                  ) : (
                    <select
                      style={styles.input}
                      value={enrollStudentId}
                      onChange={e => setEnrollStudentId(e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="">— Choose a student —</option>
                      {students.map((s: any) => (
                        <option key={s.student_id} value={s.student_id}>
                          [{s.student_id}] {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Summary preview */}
              {enrollClassId && enrollStudentId && (
                <div style={styles.summaryBox}>
                  <span style={styles.summaryDot} />
                  <span style={{ fontSize: "13px", color: "#1e40af", fontWeight: 500 }}>
                    Ready to enroll student <strong>#{enrollStudentId}</strong> into class <strong>#{enrollClassId}</strong> ({classes.find((c: any) => String(c.class_id) === enrollClassId)?.subject_name})
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => { setStep("list"); setMessage(""); }} style={styles.secondaryBtn}>
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={loading || !enrollClassId || !enrollStudentId}
                style={{
                  ...styles.primaryBtn,
                  flex: 1,
                  background: "#7c3aed",
                  opacity: (loading || !enrollClassId || !enrollStudentId) ? 0.6 : 1,
                }}
              >
                {loading ? "Enrolling..." : "Confirm Enrollment"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
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
    margin: "0 0 24px 0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
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
  secondaryBtn: {
    padding: "10px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#166534",
    marginBottom: "24px",
    fontWeight: 500,
  },
  successDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    flexShrink: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#dc2626",
    marginBottom: "24px",
    fontWeight: 500,
  },
  errorDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#dc2626",
    flexShrink: 0,
  },
  summaryBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "12px 16px",
  },
  summaryDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#3b82f6",
    flexShrink: 0,
  },
  emptyNotice: {
    background: "#fef9c3",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#92400e",
    fontWeight: 500,
  },
  subjectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  subjectCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(30,58,138,.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    border: "1px solid #f1f5f9",
  },
  subjectName: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  semesterBadge: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
};
