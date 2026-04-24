import { ResetPasswordForm } from '@/components/form/reset-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nova Senha',
  description:
    'Defina sua nova senha de acesso com segurança seguindo nossos critérios de complexidade.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
