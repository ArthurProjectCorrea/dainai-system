export const SCREEN_PERMISSIONS_MAP: Record<string, string[]> = {
  access_control: ['view', 'create', 'update', 'delete'],
  users_management: ['view', 'create', 'update', 'delete'],
  teams_management: ['view', 'create', 'update', 'delete'],
  projects_management: ['view', 'create', 'update', 'delete'],
  documents_management: ['view', 'create', 'update', 'delete', 'approve'],
}

export const SCOPES_SUPPORTED_SCREENS = ['projects_management', 'documents_management']

/**
 * Verifica se uma tela (screenKey) suporta uma determinada ação (permissionKey)
 */
export function isPermissionSupported(screenKey: string, permissionKey: string): boolean {
  const supportedPermissions = SCREEN_PERMISSIONS_MAP[screenKey]
  return supportedPermissions ? supportedPermissions.includes(permissionKey) : false
}
