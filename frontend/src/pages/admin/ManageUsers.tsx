import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAllUsers, createUser, updateUser,
  getAllSubjects, getSessions, assignSubjects,
  getTeacherSubjects, linkParent
} from "@/services/api";
import Camera from "@/components/Camera";

type Step =
  | "list"
  | "form"
  | "camera"
  | "parent"
  | "faculty-subjects"
  | "edit"
  | "edit-subjects";

const statusStyle = (type: "success" | "error"): React.CSSProperties =>
  type === "success"
    ? { display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#166534", marginBottom: "24px", fontWeight: 500 }
    : { display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#dc2626", marginBottom: "24px", fontWeight: 500 };

const dot = (color: string): React.CSSProperties => ({
  width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0,
});

export default function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers]       = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [step, setStep]         = useState<Step>("list");
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState("");
  const [isError, setIsError]   = useState(false);

  const [form, setForm] = useState({
    email: "", password: "", role: "student",
    first_name: "", last_name: "", curr_semester: "", department: "",
  });

  const [createdUserId, setCreatedUserId]       = useState<string | null>(null);
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
  const [capturedImages, setCapturedImages]     = useState<Blob[]>([]);

  const [parentForm, setParentForm] = useState({
    email: "", password: "", first_name: "", last_name: "", phone_number: "",
  });

  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedSession, setSelectedSession]   = useState("");

  const [editForm, setEditForm]         = useState({ id: "", email: "", role: "student" });
  const [editSubjects, setEditSubjects] = useState<number[]>([]);
  const [editSession, setEditSession]   = useState("");
  const [currentSubjects, setCurrentSubjects] = useState<any[]>([]);

  const load = () =>
    getAllUsers().then((data: any) => { if (Array.isArray(data)) setUsers(data); });

  useEffect(() => {
    load();
    getAllSubjects().then((data: any) => { if (Array.isArray(data)) setSubjects(data); });
    getSessions().then((data: any)   => { if (Array.isArray(data)) setSessions(data); });
  }, []);

  const showMsg = (msg: string, error = false) => { setMessage(msg); setIsError(error); };

  const resetForm = () => {
    setForm({ email: "", password: "", role: "student", first_name: "", last_name: "", curr_semester: "", department: "" });
    setParentForm({ email: "", password: "", first_name: "", last_name: "", phone_number: "" });
    setSelectedSubjects([]); setSelectedSession("");
    setCapturedImages([]); setCreatedUserId(null); setCreatedStudentId(null);
  };

  // ── Create user ──
  // ── Create user ──
const handleCreate = async () => {
  // For students: don't call API yet — email must not be registered
  // until dataset is captured. Go straight to camera.
  if (form.role === "student") {
    setStep("camera");
    return;
  }

  setLoading(true); showMsg("");
  const res = await createUser(form.email, form.password, form.role, form.first_name, form.last_name);
  setLoading(false);
  if (res.user_id) {
    setCreatedUserId(String(res.user_id));
    if (form.role === "faculty") {
      setStep("faculty-subjects");
    } else {
      showMsg("User created successfully!");
      setStep("list"); resetForm(); load();
    }
  } else {
    showMsg(res.detail || "Failed to create user.", true);
  }
};

  // ── Camera ──
  const handleCapture = (blob: Blob) => {
    if (capturedImages.length < 10) setCapturedImages(prev => [...prev, blob]);
  };

  // ── Upload dataset (students only) — single atomic call ──
const handleUploadDataset = async () => {
  if (capturedImages.length === 0) { showMsg("Please capture at least one image.", true); return; }
  setLoading(true);
  const formData = new FormData();
  formData.append("email",         form.email);
  formData.append("password",      form.password);
  formData.append("first_name",    form.first_name);
  formData.append("last_name",     form.last_name);
  formData.append("curr_semester", String(form.curr_semester));
  capturedImages.forEach((img, i) => formData.append("files", img, `dataset_${i}.jpg`));

  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`https://172.20.10.2:8443/api/admin/students/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      showMsg(data.detail || "Failed to register student.", true);
      setLoading(false);
      return;
    }
    setCreatedUserId(String(data.user_id));
    setCreatedStudentId(String(data.user_id));
    setStep("parent");
  } catch {
    showMsg("Network error during student registration.", true);
  }
  setLoading(false);
};

  // ── Link parent ──
  const handleLinkParent = async () => {
    if (!createdUserId) return;
    setLoading(true); showMsg("");
    const res = await linkParent(
      parseInt(createdUserId),
      parentForm.email, parentForm.password,
      parentForm.first_name, parentForm.last_name, parentForm.phone_number
    );
    setLoading(false);
    if (res.success) {
      showMsg("Student and parent registered successfully!");
      setStep("list"); resetForm(); load();
    } else {
      showMsg(res.detail || "Failed to link parent.", true);
    }
  };

  const handleSkipParent = () => {
    showMsg("Student registered. Parent can be linked later.");
    setStep("list"); resetForm(); load();
  };

  // ── Assign subjects (faculty) ──
  const handleAssignSubjects = async () => {
    if (!createdUserId || !selectedSession) { showMsg("Please select a session.", true); return; }
    setLoading(true); showMsg("");
    const res = await assignSubjects(parseInt(createdUserId), parseInt(selectedSession), selectedSubjects);
    setLoading(false);
    if (res.success) {
      showMsg("Faculty registered and subjects assigned!");
      setStep("list"); resetForm(); load();
    } else {
      showMsg(res.detail || "Failed to assign subjects.", true);
    }
  };

  const handleSkipSubjects = () => {
    showMsg("Faculty registered. Subjects can be assigned later.");
    setStep("list"); resetForm(); load();
  };

  // ── Edit user ──
  const handleUpdate = async () => {
    setLoading(true); showMsg("");
    try {
      const res = await updateUser(editForm.id, editForm.email, editForm.role);
      if (res.success) {
        showMsg("User updated successfully!");
        setStep("list"); load();
      } else {
        showMsg(res.detail || "Failed to update user.", true);
      }
    } catch {
      showMsg("Network error while updating user.", true);
    }
    setLoading(false);
  };

  // ── Edit subjects ──
  const openEditSubjects = async (u: any) => {
    setEditForm({ id: u.user_id || u.id, email: u.email, role: u.roles?.[0] || "faculty" });
    setEditSubjects([]); setEditSession(""); setCurrentSubjects([]); showMsg("");
    const data = await getTeacherSubjects(u.user_id || u.id);
    if (Array.isArray(data)) {
      setCurrentSubjects(data);
      setEditSubjects(data.map((d: any) => d.subject_id));
    }
    setStep("edit-subjects");
  };

  const handleUpdateSubjects = async () => {
    if (!editForm.id || !editSession) { showMsg("Please select a session.", true); return; }
    setLoading(true); showMsg("");
    const res = await assignSubjects(parseInt(editForm.id), parseInt(editSession), editSubjects);
    setLoading(false);
    if (res.success) {
      showMsg("Subjects updated successfully!");
      setStep("list"); load();
    } else {
      showMsg(res.detail || "Failed to update subjects.", true);
    }
  };

  const toggleSubject = (id: number, list: number[], setter: (v: number[]) => void) =>
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const filtered = users.filter(u =>
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    (u.roles && u.roles.join("").toLowerCase().includes(search.toLowerCase())) ||
    (u.user_id && String(u.user_id).includes(search)) ||
    (u.id && String(u.id).includes(search))
  );

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.breadcrumb}>Home / Admin Panel / Manage Users</p>
            <h1 style={styles.heading}>User Management</h1>
          </div>
          <div style={styles.headerActions}>
            {step !== "list" && (
              <button style={styles.secondaryBtn} onClick={() => { setStep("list"); showMsg(""); }}>
                ← Back
              </button>
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

        {message && (
          <div style={statusStyle(isError ? "error" : "success")}>
            <span style={dot(isError ? "#dc2626" : "#22c55e")} />
            {message}
          </div>
        )}

        {/* ── LIST ── */}
        {step === "list" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={styles.sectionTitle}>System Directory</h2>
              <button onClick={() => { setStep("form"); showMsg(""); }} style={styles.primaryBtn}
                onMouseEnter={e => (e.currentTarget.style.background = "#1e40af")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1d4ed8")}>
                + Add New User
              </button>
            </div>
            <input placeholder="Search by ID, Email, or Role..." style={{ ...styles.input, marginBottom: "24px" }}
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User ID</th>
                    <th style={styles.th}>Email Address</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{u.user_id || u.id || "N/A"}</td>
                      <td style={{ ...styles.td, fontWeight: 500, color: "#0f172a" }}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={styles.roleBadge}>{u.roles?.join(", ") || "User"}</span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionBtn}
                          onClick={() => { setEditForm({ id: u.user_id || u.id, email: u.email, role: u.roles?.[0] || "student" }); setStep("edit"); showMsg(""); }}>
                          Edit
                        </button>
                        {u.roles?.includes("faculty") && (
                          <button style={{ ...styles.actionBtn, color: "#7c3aed" }} onClick={() => openEditSubjects(u)}>
                            Subjects
                          </button>
                        )}
                        <button style={{ ...styles.actionBtn, color: "#dc2626" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      No users found matching "{search}"
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CREATE FORM ── */}
        {step === "form" && (
          <div style={{ ...styles.card, maxWidth: "620px", margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Create New User</h2>
            <p style={styles.subheading}>
              {form.role === "student" && "After creating, you'll capture their face dataset and register a parent."}
              {form.role === "faculty" && "After creating, you'll assign subjects to this faculty member."}
              {form.role !== "student" && form.role !== "faculty" && "Fill in the details below to create the account."}
            </p>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>First Name</label>
                <input style={styles.input} placeholder="e.g. John" value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Last Name</label>
                <input style={styles.input} placeholder="e.g. Doe" value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                <label style={styles.label}>Email Address</label>
                <input type="email" style={styles.input} placeholder="john@school.edu" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" style={styles.input} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Account Role</label>
                <select style={styles.input} value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === "student" && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Current Semester</label>
                  <select style={styles.input} value={form.curr_semester}
                    onChange={e => setForm({ ...form, curr_semester: e.target.value })}>
                    <option value="">— Select —</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              )}
              {form.role === "faculty" && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Department</label>
                  <input style={styles.input} placeholder="e.g. Computer Science" value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
                </div>
              )}
            </div>
            {form.role === "student" && (
              <div style={styles.infoBox}>
                <span style={{ fontSize: "13px", color: "#1e40af" }}>📸 Next: Face dataset capture → 👪 Parent registration</span>
              </div>
            )}
            {form.role === "faculty" && (
              <div style={{ ...styles.infoBox, background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                <span style={{ fontSize: "13px", color: "#6d28d9" }}>📚 Next: Subject assignment for this faculty member</span>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => { setStep("list"); showMsg(""); }} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleCreate} disabled={loading}
                style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating..." : "Create User →"}
              </button>
            </div>
          </div>
        )}

        {/* ── CAMERA ── */}
        {step === "camera" && (
          <div style={{ ...styles.card, maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div style={styles.stepIndicator}>
              <span style={styles.stepDone}>✓ Account</span>
              <span style={styles.stepLine} />
              <span style={styles.stepActive}>📸 Face Dataset</span>
              <span style={styles.stepLine} />
              <span style={styles.stepPending}>👪 Parent</span>
            </div>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Face Registration</h2>
            <p style={styles.subheading}>Capture 10 variations of the student's face for the recognition dataset.</p>
            <div style={styles.cameraBox}>
              <Camera onCapture={handleCapture} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>Dataset Progress</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1d4ed8" }}>{capturedImages.length} / 10</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${(capturedImages.length / 10) * 100}%` }} />
              </div>
            </div>
            {capturedImages.length >= 10 ? (
              <button onClick={handleUploadDataset} disabled={loading}
                style={{ ...styles.primaryBtn, width: "100%", background: "#059669" }}>
                {loading ? "Uploading..." : "Save Dataset & Continue →"}
              </button>
            ) : (
              <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 500 }}>
                Capture {10 - capturedImages.length} more image(s) to continue.
              </p>
            )}
          </div>
        )}

        {/* ── PARENT REGISTRATION ── */}
        {step === "parent" && (
          <div style={{ ...styles.card, maxWidth: "620px", margin: "0 auto" }}>
            <div style={styles.stepIndicator}>
              <span style={styles.stepDone}>✓ Account</span>
              <span style={styles.stepLine} />
              <span style={styles.stepDone}>✓ Face Dataset</span>
              <span style={styles.stepLine} />
              <span style={styles.stepActive}>👪 Parent</span>
            </div>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Register Parent / Guardian</h2>
            <p style={styles.subheading}>Create a parent account and automatically link it to this student.</p>
            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Parent First Name</label>
                <input style={styles.input} placeholder="e.g. Jane" value={parentForm.first_name}
                  onChange={e => setParentForm({ ...parentForm, first_name: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Parent Last Name</label>
                <input style={styles.input} placeholder="e.g. Doe" value={parentForm.last_name}
                  onChange={e => setParentForm({ ...parentForm, last_name: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                <label style={styles.label}>Parent Email</label>
                <input type="email" style={styles.input} placeholder="parent@email.com" value={parentForm.email}
                  onChange={e => setParentForm({ ...parentForm, email: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" style={styles.input} placeholder="••••••••" value={parentForm.password}
                  onChange={e => setParentForm({ ...parentForm, password: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} placeholder="e.g. 9876543210" value={parentForm.phone_number}
                  onChange={e => setParentForm({ ...parentForm, phone_number: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSkipParent} style={styles.secondaryBtn}>Skip for Now</button>
              <button onClick={handleLinkParent} disabled={loading}
                style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Registering..." : "Register & Link Parent ✓"}
              </button>
            </div>
          </div>
        )}

        {/* ── FACULTY SUBJECTS ── */}
        {step === "faculty-subjects" && (
          <div style={{ ...styles.card, maxWidth: "700px", margin: "0 auto" }}>
            <div style={styles.stepIndicator}>
              <span style={styles.stepDone}>✓ Account</span>
              <span style={styles.stepLine} />
              <span style={styles.stepActive}>📚 Subjects</span>
            </div>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Assign Subjects</h2>
            <p style={styles.subheading}>Select the academic session and subjects this faculty member will teach.</p>
            <div style={{ ...styles.fieldGroup, marginBottom: "20px" }}>
              <label style={styles.label}>Academic Session</label>
              <select style={styles.input} value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                <option value="">— Select a session —</option>
                {sessions.map((s: any) => <option key={s.session_id} value={s.session_id}>{s.name}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Subjects to Teach ({selectedSubjects.length} selected)</label>
              <div style={styles.subjectGrid}>
                {subjects.map((s: any) => {
                  const sel = selectedSubjects.includes(s.class_id);
                  return (
                    <div key={s.class_id}
                      style={{ ...styles.subjectChip, ...(sel ? styles.subjectChipActive : {}) }}
                      onClick={() => toggleSubject(s.class_id, selectedSubjects, setSelectedSubjects)}>
                      <span style={{ fontWeight: 600, fontSize: "12px" }}>{s.subject_code || s.subject_name}</span>
                      <span style={{ fontSize: "11px", opacity: 0.8 }}>{s.subject_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={handleSkipSubjects} style={styles.secondaryBtn}>Skip for Now</button>
              <button onClick={handleAssignSubjects} disabled={loading || !selectedSession}
                style={{ ...styles.primaryBtn, flex: 1, background: "#7c3aed", opacity: (loading || !selectedSession) ? 0.6 : 1 }}>
                {loading ? "Assigning..." : "Confirm & Finish ✓"}
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT USER ── */}
        {step === "edit" && (
          <div style={{ ...styles.card, maxWidth: "500px", margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Edit User Details</h2>
            <p style={styles.subheading}>Update the account email or permission role.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>User ID</label>
                <input style={{ ...styles.input, background: "#e2e8f0", color: "#64748b" }} value={editForm.id} disabled />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" style={styles.input} value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Account Role</label>
                <select style={styles.input} value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setStep("list")} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleUpdate} disabled={loading}
                style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT SUBJECTS ── */}
        {step === "edit-subjects" && (
          <div style={{ ...styles.card, maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "8px" }}>Edit Faculty Subjects</h2>
            <p style={styles.subheading}>
              Currently assigned: {currentSubjects.length > 0
                ? currentSubjects.map((s: any) => s.subject_name).join(", ")
                : "None"}. Select a session and subjects to add.
            </p>
            <div style={{ ...styles.fieldGroup, marginBottom: "20px" }}>
              <label style={styles.label}>Academic Session</label>
              <select style={styles.input} value={editSession}
                onChange={e => setEditSession(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                <option value="">— Select a session —</option>
                {sessions.map((s: any) => <option key={s.session_id} value={s.session_id}>{s.name}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Subjects ({editSubjects.length} selected)</label>
              <div style={styles.subjectGrid}>
                {subjects.map((s: any) => {
                  const sel = editSubjects.includes(s.class_id);
                  return (
                    <div key={s.class_id}
                      style={{ ...styles.subjectChip, ...(sel ? styles.subjectChipActive : {}) }}
                      onClick={() => toggleSubject(s.class_id, editSubjects, setEditSubjects)}>
                      <span style={{ fontWeight: 600, fontSize: "12px" }}>{s.subject_code || s.subject_name}</span>
                      <span style={{ fontSize: "11px", opacity: 0.8 }}>{s.subject_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setStep("list")} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleUpdateSubjects} disabled={loading || !editSession}
                style={{ ...styles.primaryBtn, flex: 1, background: "#7c3aed", opacity: (loading || !editSession) ? 0.6 : 1 }}>
                {loading ? "Saving..." : "Update Subjects"}
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
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
  headerActions: { display: "flex", alignItems: "center", gap: "16px" },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color .2s", padding: 0, fontFamily: "inherit" },
  card: { background: "#ffffff", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 40px rgba(30,58,138,.08)" },
  sectionTitle: { fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: 0 },
  subheading: { fontSize: "14px", color: "#64748b", margin: "0 0 24px 0" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "11px 14px", fontSize: "14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", background: "#f8fafc", color: "#0f172a", boxSizing: "border-box", transition: "border-color .2s", fontFamily: "'DM Sans', sans-serif" },
  primaryBtn: { padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background .2s", fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'DM Sans', sans-serif" },
  tableContainer: { borderRadius: "12px", border: "1.5px solid #f1f5f9", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { background: "#f8fafc", padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#64748b", borderBottom: "1.5px solid #f1f5f9" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px", fontSize: "14px", color: "#475569" },
  roleBadge: { background: "#eff6ff", color: "#1d4ed8", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" },
  actionBtn: { background: "none", border: "none", color: "#1d4ed8", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "0 8px", fontFamily: "inherit" },
  cameraBox: { background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "20px", display: "inline-block", marginBottom: "24px" },
  progressBarBg: { width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" },
  progressBarFill: { height: "100%", background: "#1d4ed8", transition: "width 0.3s ease" },
  infoBox: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 16px", marginTop: "20px" },
  stepIndicator: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px", flexWrap: "wrap" },
  stepDone: { fontSize: "12px", fontWeight: 600, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: "20px" },
  stepActive: { fontSize: "12px", fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "4px 12px", borderRadius: "20px" },
  stepPending: { fontSize: "12px", fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "4px 12px", borderRadius: "20px" },
  stepLine: { width: "24px", height: "2px", background: "#e2e8f0", borderRadius: "2px" },
  subjectGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginTop: "8px" },
  subjectChip: { display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all .2s", color: "#475569" },
  subjectChipActive: { background: "#eff6ff", borderColor: "#1d4ed8", color: "#1d4ed8" },
};
