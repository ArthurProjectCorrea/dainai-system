'use server'

import { apiFetch } from '@/lib/api-client'
import type { Team } from '@/types'
import type {
  UserManagementOptions,
  SaveUserPayload,
  UserDetailPayload,
  UsersListPayload,
} from '@/types'
import type {
  Department,
  Position,
  AccessControlPayload,
  SavePositionRequest,
  SaveDepartmentRequest,
} from '@/types'

// --- Team Actions ---

export async function getTeamsAction() {
  return apiFetch<Team[]>('/admin/teams')
}

export async function createTeamAction(payload: Partial<Team>) {
  return apiFetch<Team>('/admin/teams', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTeamAction(id: string, payload: Partial<Team>) {
  return apiFetch<Team>(`/admin/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteTeamAction(id: string) {
  return apiFetch<void>(`/admin/teams/${id}`, {
    method: 'DELETE',
  })
}

// --- User Actions ---

export async function getUsersAction() {
  return apiFetch<UsersListPayload>('/admin/users')
}

export async function getUserByIdAction(id: string) {
  return apiFetch<UserDetailPayload>(`/admin/users/${id}`)
}

export async function createUserAction(payload: SaveUserPayload) {
  return apiFetch<UserDetailPayload>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUserAction(id: string, payload: SaveUserPayload) {
  return apiFetch<UserDetailPayload>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteUserAction(id: string) {
  return apiFetch<void>(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}

export async function resendInvitationAction(id: string) {
  return apiFetch<void>(`/admin/users/${id}/resend-invitation`, {
    method: 'POST',
  })
}

export async function getUserOptionsAction() {
  return apiFetch<UserManagementOptions>('/admin/users/options')
}

// --- Access Control Actions ---

export async function getAccessControlDataAction() {
  return apiFetch<AccessControlPayload>('/admin/access-control')
}

export async function getDepartmentByIdAction(id: string) {
  return apiFetch<Department>(`/admin/access-control/departments/${id}`)
}

export async function saveDepartmentAction(payload: SaveDepartmentRequest, id?: string) {
  const url = id ? `/admin/access-control/departments/${id}` : '/admin/access-control/departments'
  const method = id ? 'PUT' : 'POST'

  return apiFetch<Department>(url, {
    method,
    body: JSON.stringify(payload),
  })
}

export async function deleteDepartmentAction(id: string) {
  return apiFetch<void>(`/admin/access-control/departments/${id}`, {
    method: 'DELETE',
  })
}

export async function getPositionByIdAction(id: string) {
  return apiFetch<Position>(`/admin/access-control/positions/${id}`)
}

export async function savePositionAction(payload: SavePositionRequest, id?: string) {
  const url = id ? `/admin/access-control/positions/${id}` : '/admin/access-control/positions'
  const method = id ? 'PUT' : 'POST'

  return apiFetch<Position>(url, {
    method,
    body: JSON.stringify(payload),
  })
}

export async function deletePositionAction(id: string) {
  return apiFetch<void>(`/admin/access-control/positions/${id}`, {
    method: 'DELETE',
  })
}
