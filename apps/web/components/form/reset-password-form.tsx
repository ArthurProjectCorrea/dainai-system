'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { resetPasswordAction } from '@/app/auth/actions'
import { toast } from 'sonner'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  function validate(password: string) {
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.'
    if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.'
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return 'A senha deve conter pelo menos um caractere especial.'
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    // Validações client-side
    const passwordError = validate(password)
    if (passwordError) {
      toast.error(passwordError)
      setIsPending(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      setIsPending(false)
      return
    }

    if (!token) {
      toast.error('Token de redefinição ausente. Recomece o processo.')
      setIsPending(false)
      return
    }

    const result = await resetPasswordAction(token, formData)

    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
      return
    }

    if (result?.success) {
      toast.success(result.message || 'Senha redefinida com sucesso!')
      window.sessionStorage.setItem('auth_flash', 'reset_success')
      router.push('/auth/login')
      return
    }

    setIsPending(false)
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Redefina sua senha</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Escolha sua nova senha para a conta:
          </p>
          <span className="text-sm font-medium underline underline-offset-4 decoration-primary/30">
            {email}
          </span>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <InfoIcon className="size-4" />
          <AlertTitle>Requisitos da senha</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-xs space-y-0.5 opacity-80 mt-1">
              <li>Mínimo de 6 caracteres</li>
              <li>Letras maiúsculas e minúsculas</li>
              <li>Pelo menos um número e um caractere especial</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" value={email} disabled className="bg-muted/50" />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Nova Senha</FieldLabel>
            <Input id="password" name="password" type="password" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirmar nova senha</FieldLabel>
            <Input id="confirm-password" name="confirm-password" type="password" required />
          </Field>
        </div>
        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
