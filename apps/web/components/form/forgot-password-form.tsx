'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

import { forgotPasswordAction } from '@/lib/action/auth-actions'
import { notify } from '@/lib/notifications'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useActionState } from 'react'
import { CompactFormLayout } from '@/components/layouts/compact-form-layout'

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
      const email = formData.get('email') as string
      const result = await forgotPasswordAction(formData)

      if (result?.error) {
        notify.auth.genericError(result.error)
        return { error: result.error, success: false }
      }

      if (result?.success) {
        notify.auth.forgotPasswordSuccess()
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
        return { error: null, success: true }
      }

      return prevState
    },
    { error: null, success: false },
  )

  useEffect(() => {
    if (searchParams.get('error') === 'expired_token') {
      notify.auth.tokenExpired()
      window.history.replaceState({}, '', '/auth/forgot-password')
    }
  }, [searchParams])

  return (
    <CompactFormLayout
      title="Esqueceu sua senha?"
      description="Insira seu e-mail abaixo para redefinir sua senha"
      submitLabel="Enviar Código"
      isPending={isPending || state.success}
      action={formAction}
      footer={
        <Link
          href="/auth/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar ao login
        </Link>
      }
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
    </CompactFormLayout>
  )
}
