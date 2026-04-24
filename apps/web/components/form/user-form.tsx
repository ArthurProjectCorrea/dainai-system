'use client'

import * as React from 'react'
import { notify } from '@/lib/notifications'
import { Upload, XIcon, UserRound, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { FormLayout } from '../layouts/form-layout'
import { FormSection, FormGrid } from '../layouts/form-section'

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

  const addAssignment = () => setAssignments([...assignments, createEmptyAssignment()])

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
            <div className="flex flex-row items-center gap-6 py-2 px-0">
              <div className="relative group shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-muted bg-muted shadow-sm transition-colors group-hover:border-primary/20">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-10 w-10 text-muted-foreground/30" />
                  )}
                </div>

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-[1px]">
                    <Spinner className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    Foto de Perfil
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {!mode || mode !== 'view' ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95 px-3"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        Trocar Foto
                      </Button>
                    ) : null}

                    {avatarUrl && mode !== 'view' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95 px-3"
                        onClick={() => setAvatarUrl('')}
                      >
                        <XIcon className="mr-2 h-3.5 w-3.5" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-muted/30">
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    PNG, JPG ou WEBP. <span className="font-medium">Máx 2MB.</span>
                  </p>
                </div>
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
                      <Select
                        value={assignment.teamId}
                        onValueChange={value => updateAssignment(assignment.key, { teamId: value })}
                        disabled={mode === 'view'}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o time" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.teams.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {!team.isActive && '(Inativo)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Departamento</FieldLabel>
                      <Select
                        value={assignment.departmentId}
                        onValueChange={value =>
                          updateAssignment(assignment.key, {
                            departmentId: value,
                            positionId: '', // Reset position when department changes
                          })
                        }
                        disabled={mode === 'view'}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o depto." />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Cargo</FieldLabel>
                      <Select
                        value={assignment.positionId}
                        onValueChange={value =>
                          updateAssignment(assignment.key, { positionId: value })
                        }
                        disabled={!assignment.departmentId || mode === 'view'}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              assignment.departmentId ? 'Selecione o cargo' : 'Aguardando depto.'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPositions.map(position => (
                            <SelectItem key={position.id} value={String(position.id)}>
                              {position.name} {!position.isActive && '(Inativo)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                <Button type="button" variant="outline" onClick={addAssignment}>
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
