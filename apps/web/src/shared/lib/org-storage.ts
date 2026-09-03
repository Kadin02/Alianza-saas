const ACTIVE_ORG_KEY = "alianza.activeOrgId"

export function getActiveOrgId(): number | null {
  const raw = localStorage.getItem(ACTIVE_ORG_KEY)
  return raw ? Number(raw) : null
}

export function setActiveOrgId(orgId: number): void {
  localStorage.setItem(ACTIVE_ORG_KEY, String(orgId))
}

export function clearActiveOrgId(): void {
  localStorage.removeItem(ACTIVE_ORG_KEY)
}
