'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
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
import { FormLayout } from '../layouts/form-layout'
import { FormSection, FormGrid } from '../layouts/form-section'

interface ProfileFormProps extends React.ComponentProps<'form'> {
  variant?: 'page' | 'dialog'
  onCancel?: () => void
}

export function ProfileForm({ className, variant = 'page', onCancel, ...props }: ProfileFormProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
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
        hideButtons
        onCancel={onCancel ?? (() => window.history.back())}
        variant={variant}
      >
        <FormGrid>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                type="text"
                defaultValue={user.profile?.name || user.name}
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </Field>
          </FieldGroup>

          <FormSection title="Vínculos e Acessos">
            {isMobile ? (
              <div className="flex flex-col gap-4">
                {(user.teams ?? []).map(team => (
                  <div key={team.id} className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Time
                      </span>
                      <span className="font-semibold text-primary">{team.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Cargo
                        </span>
                        <span className="text-sm font-medium">
                          {teamContextById.get(team.id)?.position ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Departamento
                        </span>
                        <span className="text-sm font-medium">
                          {teamContextById.get(team.id)?.department ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(user.teams ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center bg-muted/5">
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum vínculo encontrado.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
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
            )}
          </FormSection>
        </FormGrid>
      </FormLayout>
    </form>
  )
}
