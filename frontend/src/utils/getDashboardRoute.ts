export function getDashboardRoute() {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const roles = user.roles || [];

  // Union roles
  if (roles.length > 1) {
    return "/dashboard";
  }

  // Single roles
  if (roles.includes("student")) {
    return "/student/dashboard";
  }

  if (roles.includes("parent")) {
    return "/parent/dashboard";
  }

  if (roles.includes("faculty")) {
    return "/faculty/dashboard";
  }

  if (roles.includes("admin")) {
    return "/admin/dashboard";
  }

  return "/";
}