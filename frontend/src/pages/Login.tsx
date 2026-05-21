import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, saveToken, getMe } from "@/services/api";

// ── mirrors utils/getDashboardRoute.ts ────────────────────────────
function resolveRoute(roles: string[]): string {
  if (roles.length > 1)             return "/dashboard";
  if (roles.includes("student"))    return "/student/dashboard";
  if (roles.includes("parent"))     return "/parent/dashboard";
  if (roles.includes("faculty"))    return "/faculty/dashboard";
  if (roles.includes("admin"))      return "/admin/dashboard";
  return "/";
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ── Step 1: POST /api/auth/login → { access_token } ──────
      const tokenRes = await login(email, password);

      if (!tokenRes?.access_token) {
        // Backend returned an error body (apiFetch doesn't throw on 4xx)
        setError(tokenRes?.detail ?? "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      saveToken(tokenRes.access_token);

      // ── Step 2: GET /api/users/me → profile + roles ───────────
      const me = await getMe();
      const profile = me?.profile ?? {};

      // Roles — try top-level me.roles first, then profile.roles
      const roles: string[] = me?.roles ?? profile?.roles ?? [];

      // Name — resolve from whichever sub-profile exists
      const firstName =
        profile?.student?.first_name  ??
        profile?.parent?.first_name   ??
        profile?.teacher?.first_name  ??
        profile?.admin?.first_name    ??
        email;

      const lastName =
        profile?.student?.last_name   ??
        profile?.parent?.last_name    ??
        profile?.teacher?.last_name   ??
        profile?.admin?.last_name     ??
        "";

      // Persist for Dashboard.tsx + role guards
      localStorage.setItem(
        "user",
        JSON.stringify({ name: `${firstName} ${lastName}`.trim(), roles })
      );

      // ── Step 3: navigate ──────────────────────────────────────
      navigate(resolveRoute(roles));

    } catch (err: any) {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1d4ed8" />
            <path
              d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="3" fill="#fff" />
          </svg>
        </div>

        <h1 style={styles.heading}>Attendance System</h1>
        <p style={styles.subheading}>Sign in to your account</p>

        {/* Error toast */}
        {error && (
          <div style={styles.errorToast}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Email */}
        <div style={styles.fieldWrap}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#e8edf5")}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div style={styles.fieldWrap}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Password</label>
            <button
              onClick={() => navigate("/forgot-password")}
              style={styles.forgotBtn}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4ed8")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#e8edf5")}
            disabled={loading}
          />
        </div>

        {/* Sign in */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.signInBtn,
            opacity: loading ? 0.75 : 1,
            cursor:  loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1e40af"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
        >
          {loading ? (
            <>
              <div style={styles.btnSpinner} />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        ::placeholder { color: #94a3b8; }
        input:disabled { opacity: 0.6; }
      `}</style>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f0f4ff",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 32px rgba(30,58,138,.10)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "20px",
    animation: "fadeUp .4s ease both",
  },
  logoWrap: {
    marginBottom: "4px",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
    textAlign: "center" as const,
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "-8px 0 0",
    textAlign: "center" as const,
  },
  errorToast: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#dc2626",
    boxSizing: "border-box" as const,
  },
  fieldWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    padding: 0,
    transition: "color .15s",
  },
  input: {
    width: "100%",
    border: "1.5px solid #e8edf5",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#0f172a",
    outline: "none",
    transition: "border-color .15s",
    boxSizing: "border-box" as const,
    background: "#f8faff",
  },
  signInBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "background .18s",
    marginTop: "4px",
  },
  btnSpinner: {
    width: "16px",
    height: "16px",
    border: "2.5px solid rgba(255,255,255,.35)",
    borderTop: "2.5px solid #fff",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
  },
};
