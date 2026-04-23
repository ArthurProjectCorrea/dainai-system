export type DocumentStatus = 'Draft' | 'Completed' | 'Published'

export interface Category {
  id: number
  name: string
}

export interface Document {
  id: string
  projectId: string
  projectName: string
  name: string
  content: string
  status: DocumentStatus
  createdAt: string
  updatedAt: string | null
  categories: Category[]
  isPublished: boolean
  currentVersion?: string | null
}

import { Project } from './project'

export interface DocumentIndicator {
  totalDocuments: number
  publishedDocuments: number
  completedDocuments: number
  draftDocuments: number
}

export interface DocumentListResponse {
  documents: Document[]
  indicators: DocumentIndicator
}

export interface DocsNavigationResponse {
  projects: Project[]
  documents: Document[]
}

export interface PublishedDocument {
  id: string
  documentId: string
  version: string
  content: string
  publishedBy: string
  createdAt: string
}

export interface CreateDocumentRequest {
  projectId: string
  name: string
  content: string
  status: string
  categoryIds: number[]
}

export interface UpdateDocumentRequest {
  name: string
  content: string
  status: string
  categoryIds: number[]
}
