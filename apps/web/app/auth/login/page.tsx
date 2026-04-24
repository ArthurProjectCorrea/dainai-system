import { LoginForm } from '@/components/form/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta para gerenciar seus projetos e equipes com eficiência.',
}

export default function LoginPage() {
  return <LoginForm />
}
