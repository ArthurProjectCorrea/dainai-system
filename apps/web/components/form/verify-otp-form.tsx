'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import Link from 'next/link'
import { RefreshCwIcon } from 'lucide-react'

import { verifyOtpAction, forgotPasswordAction } from '@/lib/action/auth-actions'
import { notify } from '@/lib/notifications'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useActionState } from 'react'
import { CompactFormLayout } from '@/components/layouts/compact-form-layout'

export function VerifyOtpForm() {
  const [otp, setOtp] = useState('')
  const [isResending, startResendTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  // Submissão principal com useActionState (React 19)
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null; success: boolean }) => {
      if (otp.length !== 6) {
        notify.system.error('Insira o código de 6 dígitos.')
        return prevState
      }

      const formData = new FormData()
      formData.append('email', email)
      formData.append('otp', otp)

      const result = await verifyOtpAction(formData)

      if (result?.error) {
        notify.auth.genericError(result.error)
        return { error: result.error, success: false }
      }

      if (result?.passwordToken) {
        notify.auth.otpVerified()
        router.push(
          `/auth/reset-password?token=${result.passwordToken}&email=${encodeURIComponent(email)}`,
        )
        return { error: null, success: true }
      }

      return prevState
    },
    { error: null, success: false },
  )

  async function handleResend() {
    if (!email) return

    startResendTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      const result = await forgotPasswordAction(formData)

      if (result?.success) {
        notify.auth.otpResent()
      } else {
        notify.auth.genericError(result?.error || 'Erro ao reenviar código.')
      }
    })
  }

  return (
    <CompactFormLayout
      title="Verifique seu e-mail"
      description="Insira o código enviado para o e-mail:"
      contextText={email}
      submitLabel="Verificar código"
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
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="otp-verification">Código de verificação</FieldLabel>
          <Button
            variant="outline"
            size="xs"
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs font-semibold"
          >
            {isResending ? <Spinner className="size-3" /> : <RefreshCwIcon className="size-3" />}
            Reenviar código
          </Button>
        </div>
        <div className="flex justify-center py-4">
          <InputOTP maxLength={6} id="otp-verification" value={otp} onChange={setOtp} required>
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold *:data-[slot=input-otp-slot]:border-primary/20">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2 opacity-50" />
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold *:data-[slot=input-otp-slot]:border-primary/20">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </Field>
    </CompactFormLayout>
  )
}
