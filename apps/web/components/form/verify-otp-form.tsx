'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import Link from 'next/link'
import { RefreshCwIcon } from 'lucide-react'

import { verifyOtpAction, forgotPasswordAction } from '@/app/auth/actions'
import { toast } from 'sonner'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function VerifyOtpForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isPending, setIsPending] = React.useState(false)
  const [otp, setOtp] = React.useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== 6) {
      toast.error('Insira o código de 6 dígitos.')
      return
    }

    setIsPending(true)
    const formData = new FormData()
    formData.append('email', email)
    formData.append('otp', otp)

    const result = await verifyOtpAction(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsPending(false)
    }

    if (result?.passwordToken) {
      toast.success('Código verificado com sucesso!')
      router.push(
        `/auth/reset-password?token=${result.passwordToken}&email=${encodeURIComponent(email)}`,
      )
    }
  }

  async function handleResend() {
    if (!email) return
    const formData = new FormData()
    formData.append('email', email)
    const result = await forgotPasswordAction(formData)
    if (result?.success) {
      toast.success('Novo código enviado!')
    } else {
      toast.error(result?.error || 'Erro ao reenviar código.')
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Insira o código OTP enviado para o e-mail:
          </p>
          <span className="text-sm text-balance text-muted-foreground underline">{email}</span>
        </div>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">Código de verificação</FieldLabel>
            <Button variant="outline" size="xs" type="button" onClick={handleResend}>
              <RefreshCwIcon />
              Reenviar código
            </Button>
          </div>
          <InputOTP maxLength={6} id="otp-verification" value={otp} onChange={setOtp} required>
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2" />
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Verificando...' : 'Verificar'}
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
