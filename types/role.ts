
const roleLabels: Record<string, string> = {
  "ROLE_USER": "Utilisateur",
  "ROLE_ADMIN": "Administrateur"
};

export function getRoleLabel(role: string): string {
  return roleLabels[role] || "Inconnu";
}