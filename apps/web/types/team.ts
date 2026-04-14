export interface Team {
  id: string
  name: string
  iconUrl: string | null
  logotipoUrl: string | null
  isActive: boolean
}

export type TeamAccess = {
  teamId: string
  position: string
  department: string
  accesses: {
    nameKey: string
    name: string
    nameSidebar: string
    permissions: string[]
  }[]
}
