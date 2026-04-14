// Auth Response DTOs (from C# API)

/**
 * Profile data from API
 */
export interface UserProfile {
  id: string
  name: string
  avatarUrl: string | null
  email: string
  isActive: boolean
}

/**
 * Access control data (permissions per screen)
 */
export interface UserAccess {
  nameKey: string
  name: string
  nameSidebar: string
  permissions: string[]
}

import { Team, TeamAccess } from './team'

export type UserTeam = Team

export type { TeamAccess }

/**
 * Complete response from GET /auth/me
 */
export interface UserMeResponse {
  code: string
  message: string
  data?: {
    profile: UserProfile
    teams: UserTeam[]
    teamAccesses: TeamAccess[]
  }
}

/**
 * Response from POST /auth/login
 */
export interface LoginResponse {
  code: string
  message: string
  data?: {
    userId: string
    email: string
    name: string
  }
}

/**
 * Aggregated user data for client-side use (from AuthProvider)
 */
export interface User {
  id: string
  email: string
  name: string
  profile: UserProfile
  teams: UserTeam[]
  teamAccesses: TeamAccess[]
}

/**
 * Session context - stores in cookies
 */
export interface UserSession {
  clientDomain: string | null
}

/**
 * API error response
 */
export interface ApiError {
  code: string
  message: string
  data?: unknown
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  code: string
  message: string
  data?: T
}

/**
 * Form request types
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  code: string
}

export interface ResetPasswordRequest {
  newPassword: string
  confirmPassword: string
}
