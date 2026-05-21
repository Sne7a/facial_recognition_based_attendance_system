// src/utils/useUnionRole.ts
export function useUnionRole() {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const roles: string[] = user?.roles ?? [];
  const isUnion = roles.length > 1;
  return { isUnion, roles, user };
}