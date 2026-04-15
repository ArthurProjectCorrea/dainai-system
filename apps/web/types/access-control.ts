export interface Department {
  id: number
  name: string
}

export interface Permission {
  id: number
  name: string
  nameKey: string
}

export interface Screen {
  id: number
  name: string
  nameSidebar: string
  nameKey: string
}

export interface Position {
  id: number
  name: string
  departmentId: number
  isActive: boolean
  screenPermissions: number[] // PermissionIds
}

export interface AccessControlPayload {
  data: Position[]
  departments: Department[]
  permissions: Permission[]
  screens: Screen[]
  positionIndicators: {
    total: number
    active: number
    inactive: number
  }
  departmentCount: number
}

export interface SavePositionRequest {
  name: string
  departmentId: number
  newDepartmentName?: string | null
  isActive: boolean
  accesses: {
    screenId: number
    permissionId: number
  }[]
}

export interface SaveDepartmentRequest {
  name: string
}
