// Auth & Identity
export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  teams: Team[]
  teamAccesses: TeamAccess[]
}

export interface Team {
  id: string
  name: string
  isActive: boolean
}

export interface TeamAccess {
  teamId: string
  teamName: string
  position: string
  department: string
  accesses: AccessPermission[]
}

export interface AccessPermission {
  nameKey: string
  nameSidebar: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  print: boolean
}

// Access Control
export interface Position {
  id: number
  name: string
  departmentId: number
  departmentName?: string
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
  id: string
  name: string
}

export interface DocumentListResponse {
  documents: Document[]
  indicators: DocumentIndicator
}

export interface CreateDocumentRequest {
  name: string
  content: string
  projectId: string
  categoryIds: string[]
}

export interface UpdateDocumentRequest {
  name: string
  content: string
  categoryIds: string[]
}

// Projects
export interface Project {
  id: string
  name: string
  summary: string | null
  isActive: boolean
  teamId: string
  teamName: string
  createdAt: string
  updatedAt: string
  sidebarConfig: SidebarGroup[]
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

export interface SidebarGroup {
  id: string
  title: string
  icon?: string
  type: 'Solo' | 'List' | 'Collapse' | 'Dropdown'
  order: number
  items: SidebarItem[]
}

export interface SidebarItem {
  id: string
  documentId: string
  documentName: string
  order: number
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
}

export interface PositionOption {
  id: number
  name: string
  departmentName: string
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
