'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="flex h-full min-h-[25rem] flex-1 items-center justify-center p-4">
      <div className="flex max-w-[25rem] flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Acesso Negado</h1>
        <p className="mb-8 text-muted-foreground">
          Ops! Você não tem permissão para acessar esta página. Verifique suas credenciais ou entre
          em contato com o administrador.
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ir para Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
