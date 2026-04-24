'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import Link from 'next/link'
import { loginAction } from '@/lib/action/auth-actions'
import { notify } from '@/lib/notifications'
import * as React from 'react'
import { useActionState, useEffect } from 'react'
import { CompactFormLayout } from '@/components/layouts/compact-form-layout'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
      const result = await loginAction(formData)

      if (result?.error) {
        notify.auth.genericError(result.error)
        return { error: result.error, success: false }
      }

      if (result?.success) {
        notify.auth.loginSuccess()
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
        return { error: null, success: true }
      }

      return prevState
    },
    { error: null, success: false },
  )

  useEffect(() => {
    const flash = window.sessionStorage.getItem('auth_flash')
    if (flash === 'reset_success') {
      notify.auth.resetPasswordSuccess()
      window.sessionStorage.removeItem('auth_flash')
    } else if (flash === 'session_expired') {
      notify.auth.sessionExpired()
      window.sessionStorage.removeItem('auth_flash')
    }
  }, [])

  return (
    <CompactFormLayout
      title="Acesse sua conta"
      description="Insira seu e-mail abaixo para acessar sua conta"
      submitLabel="Entrar"
      isPending={isPending || state.success}
      action={formAction}
    >
      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@exemplo.com"
          required
          autoComplete="email"
        />
      </Field>

      <Field>
        <div className="flex items-center">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Link
            href="/auth/forgot-password"
            className="ml-auto text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </Field>
    </CompactFormLayout>
  )
}
