'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

import { forgotPasswordAction } from '@/app/auth/actions'
import { toast } from 'sonner'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'expired_token') {
      toast.error('O link de redefinição expirou. Por favor, solicite um novo e-mail.')
      window.history.replaceState({}, '', '/auth/forgot-password')
    }
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const result = await forgotPasswordAction(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }

    if (result?.success) {
      toast.success('Código enviado com sucesso! Verifique seu e-mail.')
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Insira seu e-mail abaixo para redefinir sua senha
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@exemplo.com" required />
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar Código'}
          </Button>
        </Field>
        <Field>
          <div className="flex justify-center">
            <Link href="/auth/login" className="text-sm underline-offset-4 hover:underline">
              Voltar ao login
            </Link>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
