'use client'

import * as React from 'react'
import { notify } from '@/lib/notifications'
import { CloudUpload, XIcon, UserRound, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent 
} from '@/components/ui/empty'
import { FormLayout } from '../layouts/form-layout'
import { FormSection, FormGrid } from '../layouts/form-section'
import { SearchableSelect } from '@/components/ui/searchable-select'

import { createUserAction, updateUserAction } from '@/lib/action/admin-action'
import type { SaveUserPayload, UserManagementOptions, UserManagementUser } from '@/types'

interface UserFormProps {
  mode: 'create' | 'edit' | 'view'
  user?: UserManagementUser | null
  options: UserManagementOptions
  onSuccess?: () => void
  onCancel?: () => void
  onEdit?: () => void
}

function createEmptyAssignment() {
  return {
    key: Math.random().toString(36).substring(7),
    teamId: '',
    departmentId: '',
    positionId: '',
  }
}

export function UserForm({ mode, user, options, onSuccess, onCancel, onEdit }: UserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || '')
  const [uploading, setUploading] = React.useState(false)
  const [isActive, setIsActive] = React.useState(user?.isActive ?? true)

  const [assignments, setAssignments] = React.useState(() => {
    if (user?.profileTeams && user.profileTeams.length > 0) {
      return user.profileTeams.map(access => ({
        key: Math.random().toString(36).substring(7),
        teamId: access.teamId,
        departmentId: String(access.departmentId),
        positionId: String(access.positionId),
      }))
    }
    return [createEmptyAssignment()]
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const departments = React.useMemo(() => {
    const depts = new Map<string, { id: string; name: string }>()
    options.positions.forEach(p => {
      depts.set(String(p.departmentId), {
        id: String(p.departmentId),
        name: p.departmentName,
      })
    })
    return Array.from(depts.values())
  }, [options.positions])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload falhou')
      const result = await res.json()
      setAvatarUrl(result.data)
      notify.system.success('Imagem enviada!')
    } catch {
      notify.system.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const addPhrase = (e: React.MouseEvent) => {
    e.preventDefault()
    setAssignments([...assignments, createEmptyAssignment()])
  }

  const removeAssignment = (key: string) => {
    if (assignments.length === 1) {
      notify.system.error('O usuário deve ter pelo menos uma atribuição')
      return
    }
    setAssignments(assignments.filter(a => a.key !== key))
  }

  const updateAssignment = (key: string, updates: Partial<(typeof assignments)[0]>) => {
    setAssignments(assignments.map(a => (a.key === key ? { ...a, ...updates } : a)))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // Validação básica
    if (assignments.some(a => !a.teamId || !a.departmentId || !a.positionId)) {
      notify.system.error('Preencha todas as atribuições corretamente')
      setLoading(false)
      return
    }

    const payload: SaveUserPayload = {
      name,
      email,
      isActive,
      avatarUrl,
      profileTeams: assignments.map(a => ({
        teamId: a.teamId,
        positionId: Number(a.positionId),
      })),
    }

    try {
      const result =
        mode === 'edit'
          ? await updateUserAction(user!.id, payload)
          : await createUserAction(payload)

      if (result.error) {
        throw new Error(result.error)
      }

      notify.admin.user.saveSuccess(mode === 'edit')
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/users')
      }
    } catch (error) {
      notify.system.error(error instanceof Error ? error.message : 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
      <FormLayout
        title={
          mode === 'edit'
            ? 'Editar Usuário'
            : mode === 'view'
              ? 'Visualizar Usuário'
              : 'Novo Usuário'
        }
        description={
          mode === 'edit'
            ? 'Atualize as permissões e dados de acesso'
            : mode === 'view'
              ? 'Dados de cadastro e acesso do colaborador'
              : 'Cadastre um novo colaborador no sistema'
        }
        mode={mode}
        loading={loading}
        onCancel={onCancel || (() => window.history.back())}
        onEdit={onEdit}
        variant="page"
      >
        <FormGrid>
          <FormSection title="Dados do Usuário" className="h-full">
            <FieldGroup className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user?.name || ''}
                  required
                  disabled={mode === 'view'}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  required
                  disabled={mode === 'view'}
                />
              </Field>

              <FieldLabel htmlFor="isActive" className="md:col-span-2">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Status do Usuário</FieldTitle>
                    <FieldDescription>
                      Define se o usuário está ativo para autenticação e acesso ao sistema.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={mode === 'view'}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </FormSection>

          <FormSection title="Avatar" className="h-full">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                {avatarUrl ? (
                  <div className="relative group mx-auto size-32 rounded-full border-2 border-muted overflow-hidden bg-muted shadow-sm">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    {!mode || mode !== 'view' ? (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <Button type="button" variant="secondary" size="xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          Trocar
                        </Button>
                        <Button type="button" variant="destructive" size="xs" onClick={() => setAvatarUrl('')} disabled={uploading}>
                          Remover
                        </Button>
                      </div>
                    ) : null}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-[1px]">
                        <Spinner className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty className="border border-dashed h-40">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CloudUpload className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>Foto de Perfil</EmptyTitle>
                      <EmptyDescription className="text-[10px]">
                        PNG, JPG ou WEBP. Máx 2MB.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      {!mode || mode !== 'view' ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          Upload Foto
                        </Button>
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                           <UserRound className="size-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </EmptyContent>
                  </Empty>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
              <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />
            </div>
          </FormSection>

          <FormSection title="Atribuições de Perfil e Time" className="lg:col-span-2">
            <div className="space-y-6">
              {assignments.map((assignment, index) => {
                const filteredPositions = options.positions.filter(
                  p => String(p.departmentId) === assignment.departmentId,
                )

                return (
                  <div
                    key={assignment.key}
                    className="grid gap-6 rounded-lg border p-6 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Field>
                      <FieldLabel>Time</FieldLabel>
                      <SearchableSelect
                        value={assignment.teamId}
                        onValueChange={value => updateAssignment(assignment.key, { teamId: value })}
                        disabled={mode === 'view'}
                        placeholder="Selecione o time"
                        options={options.teams.map(team => ({
                          value: team.id,
                          label: `${team.name} ${!team.isActive ? '(Inativo)' : ''}`,
                        }))}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Departamento</FieldLabel>
                      <SearchableSelect
                        value={assignment.departmentId}
                        onValueChange={value =>
                          updateAssignment(assignment.key, {
                            departmentId: value,
                            positionId: '', // Reset position when department changes
                          })
                        }
                        disabled={mode === 'view'}
                        placeholder="Selecione o depto."
                        options={departments.map(dept => ({
                          value: dept.id,
                          label: dept.name,
                        }))}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Cargo</FieldLabel>
                      <SearchableSelect
                        value={assignment.positionId}
                        onValueChange={value =>
                          updateAssignment(assignment.key, { positionId: value })
                        }
                        disabled={!assignment.departmentId || mode === 'view'}
                        placeholder={
                          assignment.departmentId ? 'Selecione o cargo' : 'Aguardando depto.'
                        }
                        options={filteredPositions.map(position => ({
                          value: String(position.id),
                          label: `${position.name} ${!position.isActive ? '(Inativo)' : ''}`,
                        }))}
                      />
                    </Field>

                    <div className="flex items-end justify-end">
                      {mode !== 'view' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeAssignment(assignment.key)}
                          aria-label={`Remover atribuição ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}

              {mode !== 'view' && (
                <Button type="button" variant="outline" onClick={() => setAssignments([...assignments, createEmptyAssignment()])}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Atribuição
                </Button>
              )}
            </div>
          </FormSection>
        </FormGrid>
      </FormLayout>
    </form>
  )
}
