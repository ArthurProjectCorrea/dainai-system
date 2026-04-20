'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormLayout } from '@/components/layouts/form-layout'
import { FormSection, FormGrid } from '@/components/form-section'

interface ProfileFormProps extends React.ComponentProps<'form'> {
  variant?: 'page' | 'dialog'
  onCancel?: () => void
}

export function ProfileForm({ className, variant = 'page', onCancel, ...props }: ProfileFormProps) {
  const { user } = useAuth()
  const teamContextById = new Map(
    (user?.teamAccesses ?? []).map(teamAccess => [teamAccess.teamId, teamAccess]),
  )

  if (!user) return null

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <FormLayout
        title="Meu Perfil"
        description="Gerencie seus dados e visualize seus vínculos com as equipes"
        mode="view"
        onCancel={onCancel ?? (() => window.history.back())}
        variant={variant}
      >
        <FormGrid>
          <FormSection title="Dados Pessoais">
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user.profile?.name || user.name}
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input id="email" type="email" defaultValue={user.email} readOnly />
              </Field>
            </FieldGroup>
          </FormSection>

          <FormSection title="Vínculos e Acessos" className="lg:col-span-2">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Time</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(user.teams ?? []).map(team => (
                    <TableRow key={team.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{teamContextById.get(team.id)?.position ?? 'N/A'}</TableCell>
                      <TableCell>{teamContextById.get(team.id)?.department ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {(user.teams ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center py-8">
                        Nenhum vínculo encontrado.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </FormSection>
        </FormGrid>
      </FormLayout>
    </form>
  )
}
