export type SidebarGroupType = 'Solo' | 'List' | 'Collapse' | 'Dropdown'

export interface SidebarItem {
  id: string
  documentId: string
  documentName?: string
  order: number
  isPublished?: boolean
}

export interface SidebarGroup {
  id: string
  title: string
  type: SidebarGroupType
  order: number
  icon?: string
  items: SidebarItem[]
}

export interface Project {
  id: string
  name: string
  teamId: string
  teamName: string
  integrationToken: string | null
  isActive: boolean
  createdAt: string
  summary: string | null
  totalFeedbacks: number
  averageFeedbackNote: number
  scoreDistribution?: Record<number, number>
  sidebarConfig?: SidebarGroup[]
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
  summary?: string
}

export interface UpdateProjectRequest {
  name: string
  teamId: string
  isActive: boolean
  summary?: string
  sidebarConfig?: SidebarGroup[]
}
