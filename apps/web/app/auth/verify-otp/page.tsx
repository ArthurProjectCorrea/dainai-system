import { VerifyOtpForm } from '@/components/form/verify-otp-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verificar Código',
  description: 'Valide seu código de segurança para continuar com a redefinição de senha.',
}

export default function VerifyOtpPage() {
  return <VerifyOtpForm />
}
