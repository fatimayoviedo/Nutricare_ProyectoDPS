export const ROLE_LABELS = {
  nutritionist: "Nutricionista",
  patient: "Paciente",
} as const;

export const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Inicio", icon: "home", roles: ["nutritionist", "patient"] },
  { href: "/pacientes", label: "Pacientes", icon: "users", roles: ["nutritionist"] },
  { href: "/consultas", label: "Consultas", icon: "calendar", roles: ["nutritionist"] },
  { href: "/planes", label: "Planes", icon: "clipboard", roles: ["nutritionist", "patient"] },
  { href: "/fotografias", label: "Fotografías", icon: "images", roles: ["nutritionist"] },
  { href: "/mediciones", label: "Mediciones", icon: "ruler", roles: ["nutritionist"] },
  { href: "/progreso", label: "Progreso", icon: "chart", roles: ["nutritionist", "patient"] },
  { href: "/comidas", label: "Comidas", icon: "utensils", roles: ["patient"] },
  { href: "/perfil", label: "Perfil", icon: "user", roles: ["nutritionist", "patient"] },
] as const;
