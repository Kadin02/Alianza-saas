import type { MembershipRole, OrganizationType } from "@/modules/auth/types"

export const orgTypeLabels: Record<OrganizationType, { title: string; subtitle: string }> = {
  RESIDENCIAL: { title: "Residencial", subtitle: "Torres de deptos" },
  CORPORATIVO: { title: "Corporativo", subtitle: "Oficinas y plantas" },
  PARCELAS: { title: "Loteo / Parcelas", subtitle: "Comunidad rural" },
  ADMINISTRADORA: { title: "Admin. externa", subtitle: "Gestión de cartera" },
}

export const brandColorPalette: { hex: string; label: string }[] = [
  { hex: "#15243E", label: "Marino" },
  { hex: "#005CBB", label: "Royal" },
  { hex: "#059669", label: "Esmeralda" },
  { hex: "#4F46E5", label: "Índigo" },
  { hex: "#004149", label: "Turquesa" },
]

export const roleLabels: Record<MembershipRole, string> = {
  SUPERADMIN: "Super Admin",
  ORG_OWNER: "Dueño de la cuenta",
  ADMIN: "Administrador",
  STAFF_GARITA: "Portería",
  OWNER_PORTAL: "Portal del propietario",
}

export const planLabels: Record<string, string> = {
  TRIAL: "Plan Prueba",
  STARTER: "Plan Starter",
  PRO: "Plan Pro",
}

const AVATAR_GRADIENTS = [
  "from-brand-navy to-slate-700",
  "from-cyan-700 to-teal-600",
  "from-amber-600 to-orange-500",
  "from-violet-600 to-indigo-600",
  "from-rose-600 to-pink-600",
]

export function orgInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function orgGradient(orgId: number): string {
  return AVATAR_GRADIENTS[orgId % AVATAR_GRADIENTS.length]
}
