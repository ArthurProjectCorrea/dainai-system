export interface ProfileResponse {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  isActive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  profile: ProfileResponse
  teams: Team[]
  teamAccesses: TeamAccess[]
}

export interface UserMeResponse {
  data: {
    profile: ProfileResponse
    teams: Team[]
    teamAccesses: TeamAccess[]
  }
}

export interface Team {
  id: string
  name: string
  isActive: boolean
}

export interface TeamAccess {
  teamId: string
  teamName?: string
  position: string
  department: string
  accesses: AccessPermission[]
}

export interface AccessPermission {
  nameKey: string
  name: string
  nameSidebar: string
  permissions: string[]
  scope: string
}

// Access Control
export interface Position {
  id: number
  name: string
  departmentId: number
  departmentName?: string
  isActive: boolean
}

export interface Department {
  id: number
  name: string
  positions?: Position[]
}

export interface Screen {
  id: number
  name: string
  nameKey: string
}

export interface Permission {
  id: number
  name: string
  nameKey: string
}

export interface AccessControlPayload {
  data: Position[]
  departments: Department[]
  screens: Screen[]
  permissions: Permission[]
  positionIndicators: {
    total: number
    active: number
    inactive: number
  }
  departmentCount: number
}

export interface SaveDepartmentRequest {
  name: string
}

export interface SavePositionRequest {
  name: string
  departmentId: number
  newDepartmentName: string | null
  isActive: boolean
  accesses: Array<{
    screenId: number
    permissionId: number
    scope: string
  }>
}

// Documents
export type DocumentStatus = 'Draft' | 'Completed' | 'Published'

export interface Document {
  id: string
  name: string
  content: string
  projectId: string
  projectName: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  status: DocumentStatus
  isPublished: boolean
  currentVersion: string
  categories: Category[]
}

export interface DocumentIndicator {
  total: number
  published: number
  drafts: number
}

export interface PublishedDocument {
  id: string
  documentId: string
  version: string
  content: string
  publishedAt: string
  publishedBy: string
  publishedByName: string
}

export interface Category {
  id: number
  name: string
}

export interface DocumentListResponse {
  documents: Document[]
  indicators: DocumentIndicator
}

export interface CreateDocumentRequest {
  name: string
  content: string
  status: DocumentStatus
  projectId: string
  categoryIds: number[]
}

export interface UpdateDocumentRequest {
  name: string
  content: string
  status: DocumentStatus
  categoryIds: number[]
}

// Projects
export interface Project {
  id: string
  name: string
  summary: string | null
  isActive: boolean
  teamId: string
  teamName: string
  integrationToken?: string
  totalFeedbacks: number
  averageFeedbackNote: number
  scoreDistribution?: Record<number, number>
  createdAt: string
  updatedAt: string
  sidebarConfig: SidebarGroup[]
}

export interface CreateProjectRequest {
  name: string
  teamId: string
  summary: string | null
}

export interface UpdateProjectRequest {
  name: string
  teamId: string
  isActive: boolean
  summary: string | null
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

export type SidebarGroupType = 'Solo' | 'List' | 'Collapse' | 'Dropdown'

export interface SidebarGroup {
  id: string
  title: string
  icon?: string
  type: SidebarGroupType
  order: number
  items: SidebarItem[]
}

export interface SidebarItem {
  id: string
  documentId: string
  documentName?: string
  order: number
  isPublished?: boolean
}

// Teams
export interface TeamWithDetails extends Team {
  createdAt: string
  updatedAt: string
  memberCount: number
  projectCount: number
}

export interface TeamIndicator {
  totalTeams: number
  activeTeams: number
  inactiveTeams: number
}

// Dashboard
export interface DashboardIndicators {
  totalProjects: number
  activeProjects: number
  totalDocuments: number
  publishedDocuments: number
  totalTeams: number
  totalUsers: number
}

// User Management
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

export interface TeamOption {
  id: string
  name: string
  isActive: boolean
}

export interface PositionOption {
  id: number
  name: string
  departmentId: number
  departmentName: string
  isActive: boolean
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
  user: UserManagementUser | null
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
