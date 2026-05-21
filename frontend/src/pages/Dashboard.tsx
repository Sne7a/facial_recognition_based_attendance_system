import { useNavigate } from "react-router-dom";

// ── Role section config ───────────────────────────────────────────
const ROLE_SECTIONS: Record<
  string,
  {
    title: string;
    iconColor: string;
    iconBg: string;
    icon: React.ReactNode;
    actions: { label: string; desc: string; route: string }[];
  }
> = {
  parent: {
    title: "Parent",
    iconColor: "#16a34a",
    iconBg: "#f0fdf4",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="#16a34a" strokeWidth="1.8" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    actions: [
      { label: "Child's Attendance",   desc: "View subject-wise records",        route: "/parent/attendance"         },
      { label: "Children Profiles",    desc: "View enrolled children",            route: "/parent/children-profiles"  },
      { label: "Contact Faculty",      desc: "Reach out to subject faculty",     route: "/parent/contact-faculty"    },
      { label: "Notifications",        desc: "View alerts and announcements",     route: "/parent/notifications"      },
    ],
  },
  faculty: {
    title: "Faculty",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="#1d4ed8" strokeWidth="1.8" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    actions: [
      { label: "Mark Attendance",  desc: "Take attendance for your class",     route: "/faculty/mark-attendance" },
      { label: "View Students",    desc: "Browse enrolled students",           route: "/faculty/students"         },
      { label: "Generate Reports", desc: "Export subject attendance reports",  route: "/faculty/reports"          },
      { label: "Class Schedule",   desc: "View your timetable",               route: "/faculty/schedule"         },
    ],
  },
  admin: {
    title: "Admin",
    iconColor: "#7c3aed",
    iconBg: "#faf5ff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    actions: [
      { label: "Manage Users",       desc: "Add, edit, or remove users",         route: "/admin/users"      },
      { label: "Subject Management", desc: "Configure subjects and assignments",  route: "/admin/subjects"   },
      { label: "All Attendance",     desc: "System-wide attendance records",      route: "/admin/attendance" },
      { label: "Analytics",          desc: "Trends and insights",                 route: "/admin/analytics"  },
      { label: "Database",           desc: "Manage database operations",          route: "/admin/database"   },
      { label: "System Settings",    desc: "Configure system preferences",        route: "/admin/settings"   },
    ],
  },
};

export default function Dashboard() {
  // ── logic unchanged ──────────────────────────────────────────────
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return (
      <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        Please login first.
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────

  const roles: string[] = user.roles || [];

  // Role pill color map
  const pillColors: Record<string, { bg: string; color: string }> = {
    parent:  { bg: "#f0fdf4", color: "#16a34a" },
    faculty: { bg: "#eff6ff", color: "#1d4ed8" },
    admin:   { bg: "#faf5ff", color: "#7c3aed" },
  };

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#1d4ed8" />
            <path d="M10 18c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3" fill="#fff" />
          </svg>
        </div>
        <span style={styles.logoText}>Attendance System</span>

        <div style={styles.headerRight}>
          {/* Role pills */}
          <div style={styles.rolePills}>
            {roles.map((r) => (
              <span
                key={r}
                style={{
                  ...styles.rolePill,
                  background: pillColors[r]?.bg ?? "#f1f5f9",
                  color:      pillColors[r]?.color ?? "#0f172a",
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </span>
            ))}
          </div>

          <button
            onClick={() => { localStorage.removeItem("user"); navigate("/"); }}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>
        <h1 style={styles.heading}>Hello, {user.name}</h1>
        <p style={styles.subheading}>
          You have access to {roles.length} role{roles.length > 1 ? "s" : ""}. Choose what you'd like to do.
        </p>

        {/* ── One section per role ── */}
        <div style={styles.sectionsWrap}>
          {roles.map((role) => {
            const section = ROLE_SECTIONS[role];
            if (!section) return null;

            return (
              <div key={role} style={styles.section}>
                {/* Section header */}
                <div style={styles.sectionHeader}>
                  <div style={{ ...styles.sectionIconWrap, background: section.iconBg }}>
                    {section.icon}
                  </div>
                  <span style={styles.sectionTitle}>{section.title} Functionalities</span>
                </div>

                {/* Action grid */}
                <div style={styles.actionGrid}>
                  {section.actions.map((action) => (
                    <button
                      key={action.route}
                      onClick={() => navigate(action.route)}
                      style={styles.actionCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,58,138,.13)";
                        e.currentTarget.style.borderColor = section.iconColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)";
                        e.currentTarget.style.borderColor = "#e8edf5";
                      }}
                    >
                      <div style={styles.actionText}>
                        <span style={styles.actionLabel}>{action.label}</span>
                        <span style={styles.actionDesc}>{action.desc}</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M6 3l5 5-5 5" stroke="#94a3b8" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
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
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "18px 28px",
    background: "#fff",
    borderBottom: "1px solid #e8edf5",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  logoMark: { display: "flex", alignItems: "center" },
  logoText: {
    fontWeight: 600,
    fontSize: "15px",
    color: "#0f172a",
    letterSpacing: "-0.1px",
    flex: 1,
  },
  headerRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  rolePills: {
    display: "flex",
    gap: "6px",
  },
  rolePill: {
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "20px",
    letterSpacing: "0.1px",
  },
  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "#64748b",
    fontFamily: "'DM Sans', sans-serif",
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "color .15s, background .15s",
  },

  /* Body */
  body: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "52px 24px",
    animation: "fadeUp .4s ease both",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "32px",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  subheading: {
    fontSize: "15px",
    color: "#64748b",
    margin: "0 0 36px",
  },

  /* Sections */
  sectionsWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  section: {
    background: "#fff",
    border: "1.5px solid #e8edf5",
    borderRadius: "20px",
    padding: "26px",
    boxShadow: "0 2px 16px rgba(30,58,138,.06)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sectionIconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
  },

  /* Action grid */
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8faff",
    border: "1.5px solid #e8edf5",
    borderRadius: "12px",
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left" as const,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    transition: "transform .18s, box-shadow .18s, border-color .18s",
    fontFamily: "'DM Sans', sans-serif",
  },
  actionText: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "3px",
  },
  actionLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
  },
  actionDesc: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};
