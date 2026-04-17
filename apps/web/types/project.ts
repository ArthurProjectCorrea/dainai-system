export interface Project {
  id: string
  name: string
  teamId: string
  teamName: string
  integrationToken: string | null
  isActive: boolean
  createdAt: string
  totalFeedbacks: number
  averageFeedbackNote: number
  scoreDistribution?: Record<number, number>
}

export interface ProjectIndicator {
  totalProjects: number
  activeProjects: number
  inactiveProjects: number
}

export interface ProjectListResponse {
  projects: Project[]
  indicators: ProjectIndicator
}

export interface CreateProjectRequest {
  name: string
  teamId: string
}

export interface UpdateProjectRequest {
  name: string
  teamId: string
  isActive: boolean
}
