'use server'

import { cookies } from 'next/headers'

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('AuthToken')
  cookieStore.delete('.AspNetCore.Identity.Application')
  cookieStore.delete('active_team_id')
}
