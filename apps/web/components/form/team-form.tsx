'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Team } from '@/types/team'
import { Spinner } from '@/components/ui/spinner'
import { Upload, XIcon, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

import { FormLayout } from '@/components/layouts/form-layout'
import { FormSection } from '@/components/form-section'

import { createTeamAction, updateTeamAction } from '@/lib/action/team-actions'

interface TeamFormProps {
  data?: Team | null
  onSuccess: () => void
  onCancel?: () => void
  readOnly?: boolean
  onEdit?: () => void
}

export function TeamForm({ data, onSuccess, onCancel, readOnly, onEdit }: TeamFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [logotipoUrl, setLogotipoUrl] = React.useState(data?.logotipoUrl || '')
  const [isActive, setIsActive] = React.useState(
    data?.isActive !== undefined ? data.isActive : true,
  )

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      setLogotipoUrl(result.data)
      toast.success('Imagem enviada!')
    } catch (error) {
      toast.error('Erro ao enviar imagem')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string

    if (!name || name.length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres')
      setLoading(false)
      return
    }

    try {
      const payload: Partial<Team> = {
        id: data?.id || '00000000-0000-0000-0000-000000000000',
        name,
        logotipoUrl,
        isActive,
      }

      const result = data?.id
        ? await updateTeamAction(data.id, payload)
        : await createTeamAction(payload)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(data?.id ? 'Equipe atualizada!' : 'Equipe criada!')
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar equipe')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
      <FormLayout
        title={readOnly ? 'Visualizar Equipe' : data?.id ? 'Editar Equipe' : 'Nova Equipe'}
        description={
          readOnly
            ? 'Dados e logotipo da unidade operacional'
            : 'Gerencie identidades e configurações das equipes do sistema'
        }
        mode={readOnly ? 'view' : data?.id ? 'edit' : 'create'}
        loading={loading || uploading}
        onCancel={onCancel ?? (() => window.history.back())}
        onEdit={onEdit}
        variant="dialog"
      >
        <FormSection>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome da Equipe</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={data?.name || ''}
                placeholder="Ex: Marketing, Desenvolvimento..."
                required
                disabled={readOnly}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="logotipo">Logotipo</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {logotipoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logotipoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Spinner className="mr-2" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Selecionar Imagem
                      </Button>
                    )}
                    {logotipoUrl && !readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogotipoUrl('')}
                      >
                        <XIcon className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>
                  {!readOnly && (
                    <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP. Máx 2MB.</p>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={onFileChange}
                />
              </div>
              <input type="hidden" name="logotipoUrl" value={logotipoUrl} />
            </Field>

            <FieldLabel htmlFor="isActive">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Status da Equipe</FieldTitle>
                  <FieldDescription>
                    Define se a equipe está ativa e disponível para seleção no sistema.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={readOnly}
                />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </FormSection>
      </FormLayout>
    </form>
  )
}
