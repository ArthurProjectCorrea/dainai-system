'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Upload, XIcon, UserRound, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { SaveUserPayload, UserManagementOptions, UserManagementUser } from '@/types/user'

interface UserFormProps {
  mode: 'create' | 'edit' | 'view'
  user?: UserManagementUser | null
  options: UserManagementOptions
  onSuccess: () => void
  onCancel: () => void
}

type AssignmentDraft = {
  key: string
  teamId: string
  departmentId: string
  positionId: string
}

function createEmptyAssignment(): AssignmentDraft {
  return {
    key: crypto.randomUUID(),
    teamId: '',
    departmentId: '',
    positionId: '',
  }
}

export function UserForm({ mode, user, options, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl ?? '')
  const [isActive, setIsActive] = React.useState(user?.isActive ?? true)
  const [assignments, setAssignments] = React.useState<AssignmentDraft[]>(() => {
    if (user?.profileTeams?.length) {
      return user.profileTeams.map(item => ({
        key: String(item.id),
        teamId: item.teamId,
        departmentId: String(item.departmentId),
        positionId: String(item.positionId),
      }))
    }

    return [createEmptyAssignment()]
  })

  const departments = React.useMemo(() => {
    const unique = new Map<number, string>()
    options.positions.forEach(p => {
      unique.set(p.departmentId, p.departmentName)
    })
    return Array.from(unique.entries())
      .map(([id, name]) => ({ id: String(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [options.positions])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.message || 'Upload falhou')
      }

      const result = await response.json()
      setAvatarUrl(result.data)
      toast.success('Avatar enviado com sucesso')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar avatar'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  function addAssignment() {
    setAssignments(previous => [...previous, createEmptyAssignment()])
  }

  function removeAssignment(key: string) {
    setAssignments(previous => {
      const next = previous.filter(item => item.key !== key)
      return next.length ? next : [createEmptyAssignment()]
    })
  }

  function updateAssignment(key: string, patch: Partial<AssignmentDraft>) {
    setAssignments(previous =>
      previous.map(item => {
        if (item.key !== key) return item
        return { ...item, ...patch }
      }),
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '')
      .trim()
      .toLowerCase()

    if (name.length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      toast.error('Informe um e-mail válido')
      setLoading(false)
      return
    }

    const normalizedAssignments = assignments
      .filter(item => item.teamId && item.positionId)
      .map(item => ({
        teamId: item.teamId,
        positionId: Number(item.positionId),
      }))

    if (normalizedAssignments.length === 0) {
      toast.error('Informe ao menos uma atribuição de time e cargo')
      setLoading(false)
      return
    }

    const payload: SaveUserPayload = {
      name,
      email,
      avatarUrl: avatarUrl || null,
      isActive,
      profileTeams: normalizedAssignments,
    }

    try {
      const url = mode === 'edit' && user ? `/api/v1/admin/users/${user.id}` : '/api/v1/admin/users'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.message || 'Falha ao salvar usuário')
      }

      toast.success(
        mode === 'edit' ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso',
      )
      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar usuário'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 border-b mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === 'edit'
              ? 'Editar Usuário'
              : mode === 'view'
                ? 'Visualizar Usuário'
                : 'Novo Usuário'}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {mode === 'edit'
              ? 'Atualize as permissões e dados de acesso'
              : mode === 'view'
                ? 'Dados de cadastro e acesso do colaborador'
                : 'Cadastre um novo colaborador no sistema'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {mode === 'view' ? 'Voltar' : 'Cancelar'}
          </Button>
          {mode !== 'view' && (
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              {mode === 'edit' ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
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
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-row items-center gap-6 py-6 px-4 md:px-8">
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
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
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atribuições de Perfil e Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    onValueChange={value => updateAssignment(assignment.key, { positionId: value })}
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
        </CardContent>
      </Card>

      {/* Rodapé removido - botões movidos para o topo */}
    </form>
  )
}
