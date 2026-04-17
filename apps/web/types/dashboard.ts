export interface DashboardStatsResponse {
  totalProjects: number
  activeProjects: number
  totalUsers: number
  totalFeedbacks: number
  averageRating: number
}

export interface TeamUserCountDto {
  teamName: string
  userCount: number
}

export interface ProjectFeedbackTrendDto {
  projectName: string
  averageNote: number
  totalFeedbacks: number
}

export interface PositionStatusDto {
  name: string
  isActive: boolean
}

export interface AdminDashboardResponse {
  stats: DashboardStatsResponse
  usersByTeam: TeamUserCountDto[]
  projectTrends: ProjectFeedbackTrendDto[]
  positionStatuses: PositionStatusDto[]
}
