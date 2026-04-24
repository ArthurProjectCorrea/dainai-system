'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

import { resetPasswordAction } from '@/lib/action/auth-actions'
import { notify } from '@/lib/notifications'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { useActionState } from 'react'
import { CompactFormLayout } from '@/components/layouts/compact-form-layout'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  function validate(password: string) {
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.'
    if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.'
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return 'A senha deve conter pelo menos um caractere especial.'
    return null
  }

  // Submissão com useActionState (React 19)
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirm-password') as string

      // Validações client-side
      const passwordError = validate(password)
      if (passwordError) {
        notify.system.error(passwordError)
        return { error: passwordError, success: false }
      }

      if (password !== confirmPassword) {
        notify.system.error('As senhas não coincidem.')
        return { error: 'Passwords mismatch', success: false }
      }

      if (!token) {
        notify.auth.genericError('Token de redefinição ausente. Recomece o processo.')
        return { error: 'Missing token', success: false }
      }

      const result = await resetPasswordAction(token, formData)

      if (result?.error) {
        notify.auth.genericError(result.error)
        return { error: result.error, success: false }
      }

      if (result?.success) {
        window.sessionStorage.setItem('auth_flash', 'reset_success')
        router.push('/auth/login')
        return { error: null, success: true }
      }

      return prevState
    },
    { error: null, success: false },
  )

  return (
    <CompactFormLayout
      title="Redefina sua senha"
      description="Escolha sua nova senha para a conta:"
      contextText={email}
      submitLabel="Redefinir senha"
      isPending={isPending || state.success}
      action={formAction}
      headerExtra={
        <Alert className="bg-primary/5 border-primary/20 animate-in fade-in zoom-in-95 duration-700 delay-300">
          <InfoIcon className="size-4 text-primary" />
          <AlertTitle className="text-primary font-semibold text-left">
            Requisitos da senha
          </AlertTitle>
          <AlertDescription className="text-left">
            <ul className="list-disc list-inside text-xs space-y-0.5 opacity-80 mt-1">
              <li>Mínimo de 8 caracteres</li>
              <li>Letras maiúsculas e minúsculas</li>
              <li>Pelo menos um número e um caractere especial</li>
            </ul>
          </AlertDescription>
        </Alert>
      }
    >
      <div className="space-y-4">
        <Field>
          <FieldLabel htmlFor="email-display">E-mail</FieldLabel>
          <Input
            id="email-display"
            value={email}
            disabled
            className="bg-muted/50 cursor-not-allowed opacity-70"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Nova Senha</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar nova senha</FieldLabel>
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </Field>
      </div>
    </CompactFormLayout>
  )
}
