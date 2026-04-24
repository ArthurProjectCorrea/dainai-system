import { ForgotPasswordForm } from '@/components/form/forgot-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recuperar Senha',
  description: 'Inicie o processo de recuperação de acesso à sua conta de forma segura.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
