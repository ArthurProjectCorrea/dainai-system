import { cookies } from 'next/headers'

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('AuthToken')
}
