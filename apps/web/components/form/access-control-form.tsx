'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Loader2, Shield, Building2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { CreatableCombobox } from '@/components/creatable-combobox'

import { isPermissionSupported } from '@/lib/permissions'
import type {
  Department,
  Screen,
  Permission,
  SavePositionRequest,
  SaveDepartmentRequest,
  Position,
} from '@/types/access-control'

type PositionWithAccesses = Position & {
  accesses?: { screenId: number; permissionId: number }[]
}

interface AccessControlFormProps {
  mode: 'department' | 'position'
  type: 'create' | 'edit'
  initialData?: PositionWithAccesses | Department
  options: {
    departments: Department[]
    screens: Screen[]
    permissions: Permission[]
  }
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
}

export function AccessControlForm({
  mode,
  type,
  initialData,
  options,
  onSuccess,
  onCancel,
  readOnly,
}: AccessControlFormProps) {
  const [loading, setLoading] = React.useState(false)

  // Form States
  const [name, setName] = React.useState((initialData as Position)?.name || '')
  const [departmentId, setDepartmentId] = React.useState<string>(
    (initialData as Position)?.departmentId ? String((initialData as Position).departmentId) : '',
  )
  const [newDepartmentName, setNewDepartmentName] = React.useState<string | null>(null)
  const [isActive, setIsActive] = React.useState((initialData as Position)?.isActive ?? true)

  // Matrix State: screenId -> Set<permissionId>
  const [selectedAccesses, setSelectedAccesses] = React.useState<Map<number, Set<number>>>(() => {
    const map = new Map<number, Set<number>>()
    if (initialData?.id && mode === 'position') {
      const accesses = (initialData as PositionWithAccesses).accesses
      if (accesses) {
        accesses.forEach(a => {
          if (!map.has(a.screenId)) map.set(a.screenId, new Set())
          map.get(a.screenId)!.add(a.permissionId)
        })
      }
    }
    return map
  })

  const togglePermission = (screenId: number, permissionId: number) => {
    const newMap = new Map(selectedAccesses)
    if (!newMap.has(screenId)) newMap.set(screenId, new Set())

    const screenPerms = newMap.get(screenId)!
    if (screenPerms.has(permissionId)) {
      screenPerms.delete(permissionId)
    } else {
      screenPerms.add(permissionId)
    }

    if (screenPerms.size === 0) newMap.delete(screenId)
    setSelectedAccesses(newMap)
  }

  const toggleAllForScreen = (screenId: number, checked: boolean) => {
    const newMap = new Map(selectedAccesses)
    if (checked) {
      // Filtrar apenas as permissões suportadas pela tela ao marcar "Todas"
      const screen = options.screens.find(s => s.id === screenId)
      const supportedPermIds = options.permissions
        .filter(p => screen && isPermissionSupported(screen.nameKey, p.nameKey))
        .map(p => p.id)

      newMap.set(screenId, new Set(supportedPermIds))
    } else {
      newMap.delete(screenId)
    }
    setSelectedAccesses(newMap)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint =
        mode === 'department'
          ? '/api/v1/admin/access-control/departments'
          : '/api/v1/admin/access-control/positions'

      const id = initialData?.id
      if (!id && type === 'edit') throw new Error('ID não encontrado para edição')

      const url = type === 'edit' ? `${endpoint}/${id}` : endpoint
      const method = type === 'edit' ? 'PUT' : 'POST'

      const body =
        mode === 'department'
          ? ({ name } as SaveDepartmentRequest)
          : ({
              name,
              departmentId: newDepartmentName ? 0 : Number(departmentId),
              newDepartmentName: newDepartmentName,
              isActive,
              accesses: Array.from(selectedAccesses.entries()).flatMap(([screenId, perms]) =>
                Array.from(perms).map(permissionId => ({ screenId, permissionId })),
              ),
            } as SavePositionRequest)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao salvar')
      }

      toast.success(type === 'create' ? 'Criado com sucesso' : 'Atualizado com sucesso')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar solicitação')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 border-b mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight">
            {readOnly ? 'Visualizar' : type === 'edit' ? 'Editar' : 'Novo'}{' '}
            {mode === 'department' ? 'Departamento' : 'Cargo'}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {mode === 'department'
              ? 'Gerencie divisões organizacionais da empresa'
              : 'Defina responsabilidades e permissões de acesso'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? 'Voltar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'edit'
                ? 'Salvar Alterações'
                : `Criar ${mode === 'department' ? 'Departamento' : 'Cargo'}`}
            </Button>
          )}
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Basic Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {mode === 'department' ? (
                <Building2 className="h-4 w-4 text-primary" />
              ) : (
                <Shield className="h-4 w-4 text-primary" />
              )}
              Informações Básicas
            </CardTitle>
            <CardDescription className="text-xs">
              {mode === 'department'
                ? 'Defina o nome do departamento.'
                : 'Defina o nome e o departamento vinculado a este cargo.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(mode === 'position' && 'grid grid-cols-1 md:grid-cols-2 gap-4')}>
              <Field>
                <FieldLabel htmlFor="name">
                  Nome do {mode === 'department' ? 'Departamento' : 'Cargo'}
                </FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={
                    mode === 'department' ? 'Ex: Recursos Humanos' : 'Ex: Analista de Sistemas'
                  }
                  required
                  disabled={readOnly}
                />
              </Field>

              {mode === 'position' && (
                <Field>
                  <FieldLabel htmlFor="departmentId">Departamento</FieldLabel>
                  <CreatableCombobox
                    options={options.departments.map(d => ({ value: String(d.id), label: d.name }))}
                    value={newDepartmentName || departmentId}
                    onValueChange={(val, isNew) => {
                      if (isNew) {
                        setNewDepartmentName(val)
                        setDepartmentId('')
                      } else {
                        setDepartmentId(val)
                        setNewDepartmentName(null)
                      }
                    }}
                    placeholder="Selecione ou digite um departamento..."
                    createLabel="Criar novo departamento"
                    disabled={readOnly}
                  />
                </Field>
              )}
            </div>

            {mode === 'position' && (
              <Field orientation="horizontal" className="rounded-lg border p-3 shadow-sm">
                <FieldContent>
                  <FieldTitle>Status do Cargo</FieldTitle>
                  <FieldDescription>
                    Determine se o cargo está ativo e disponível para novos usuários.
                  </FieldDescription>
                </FieldContent>
                <Switch checked={isActive} onCheckedChange={setIsActive} disabled={readOnly} />
              </Field>
            )}
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        {mode === 'position' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b mb-4 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Gerenciamento de Acessos
                </CardTitle>
                <CardDescription className="text-xs">
                  Selecione quais ações este cargo pode realizar em cada módulo do sistema.
                </CardDescription>
              </div>
              <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest hidden md:block">
                Matriz de Permissões
              </span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-3 text-left font-medium text-muted-foreground">
                        Nome da Tela
                      </th>
                      {options.permissions.map(perm => (
                        <th
                          key={perm.id}
                          className="p-3 text-center font-medium text-muted-foreground w-20"
                        >
                          {perm.name}
                        </th>
                      ))}
                      <th className="p-3 text-center font-medium text-muted-foreground w-20">
                        Todas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {options.screens.map(screen => {
                      const supportedPerms = options.permissions.filter(p =>
                        isPermissionSupported(screen.nameKey, p.nameKey),
                      )

                      const allChecked =
                        supportedPerms.length > 0 &&
                        supportedPerms.every(p => selectedAccesses.get(screen.id)?.has(p.id))

                      return (
                        <tr key={screen.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="p-3 py-2">
                            <div className="font-medium text-foreground text-xs">{screen.name}</div>
                            <div className="text-[9px] text-muted-foreground/60 font-mono uppercase tracking-tighter">
                              {screen.nameKey}
                            </div>
                          </td>
                          {options.permissions.map(perm => {
                            const isSupported = isPermissionSupported(screen.nameKey, perm.nameKey)

                            return (
                              <td key={perm.id} className="p-1 text-center">
                                {isSupported ? (
                                  <Checkbox
                                    checked={selectedAccesses.get(screen.id)?.has(perm.id) || false}
                                    onCheckedChange={() => togglePermission(screen.id, perm.id)}
                                    className="mx-auto h-3.5 w-3.5"
                                    disabled={readOnly}
                                  />
                                ) : (
                                  <div className="w-3.5 h-3.5 mx-auto border border-dashed rounded-[2px] opacity-10" />
                                )}
                              </td>
                            )
                          })}
                          <td className="p-1 text-center">
                            <Checkbox
                              checked={allChecked}
                              onCheckedChange={checked =>
                                toggleAllForScreen(screen.id, checked as boolean)
                              }
                              className="mx-auto h-3.5 w-3.5"
                              disabled={readOnly}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}
