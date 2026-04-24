'use server'

import { apiFetch } from '@/lib/api-client'
import type {
  Project,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types'

export async function getProjectsAction() {
  return apiFetch<ProjectListResponse>('/admin/projects')
}

export async function getProjectByIdAction(id: string) {
  return apiFetch<Project>(`/admin/projects/${id}`)
}

export async function createProjectAction(payload: CreateProjectRequest) {
  return apiFetch<Project>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProjectAction(id: string, payload: UpdateProjectRequest) {
  return apiFetch<Project>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProjectAction(id: string) {
  return apiFetch<void>(`/admin/projects/${id}`, {
    method: 'DELETE',
  })
}

export async function rotateProjectTokenAction(id: string) {
  return apiFetch<Project>(`/admin/projects/${id}/rotate-token`, {
    method: 'POST',
  })
}
