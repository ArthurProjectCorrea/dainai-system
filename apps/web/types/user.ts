export interface TeamOption {
  id: string
  name: string
  iconUrl: string | null
  logotipoUrl: string | null
  isActive: boolean
}

export interface PositionOption {
  id: number
  name: string
  departmentId: number
  departmentName: string
  isActive: boolean
}

export interface ProfileTeamAssignment {
  id: number
  teamId: string
  teamName: string
  positionId: number
  positionName: string
  departmentId: number
  departmentName: string
}

export interface UserManagementUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  isActive: boolean
  profileTeams: ProfileTeamAssignment[]
}

export interface UserManagementOptions {
  teams: TeamOption[]
  positions: PositionOption[]
}

export interface UserManagementIndicators {
  total: number
  active: number
  inactive: number
}

export interface UsersListPayload {
  users: UserManagementUser[]
  indicators: UserManagementIndicators
  options: UserManagementOptions
}

export interface UserDetailPayload {
  user: UserManagementUser
  options: UserManagementOptions
}

export interface SaveUserPayload {
  name: string
  email: string
  avatarUrl: string | null
  isActive: boolean
  profileTeams: Array<{
    teamId: string
    positionId: number
  }>
}
