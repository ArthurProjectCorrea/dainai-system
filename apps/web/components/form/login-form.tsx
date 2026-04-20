'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { loginAction } from '@/lib/action/auth-actions'
import { toast } from 'sonner'
import * as React from 'react'
import { useEffect } from 'react'

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = React.useState(false)

  useEffect(() => {
    const flash = window.sessionStorage.getItem('auth_flash')
    if (flash === 'reset_success') {
      toast.success('Senha redefinida com sucesso! Você já pode entrar.')
      window.sessionStorage.removeItem('auth_flash')
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }

    if (result?.success) {
      toast.success('Login realizado com sucesso! Redirecionando...')
      // Hard redirect com delay para garantir que o toast seja visível
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Acesse sua conta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Insira seu e-mail abaixo para acessar sua conta
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@exemplo.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2" />}
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
