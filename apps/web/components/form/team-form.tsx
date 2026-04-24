'use client'

import * as React from 'react'
import { notify } from '@/lib/notifications'
import { Team } from '@/types'
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

import { FormLayout } from '../layouts/form-layout'
import { FormSection } from '../layouts/form-section'

import { createTeamAction, updateTeamAction } from '@/lib/action/admin-action'

interface TeamFormProps {
  data?: Team | null
  onSuccess: () => void
  onCancel?: () => void
  readOnly?: boolean
  onEdit?: () => void
}

export function TeamForm({ data, onSuccess, onCancel, readOnly, onEdit }: TeamFormProps) {
  const isEdit = !!data
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const values = {
      name: formData.get('name') as string,
      isActive: formData.get('isActive') === 'on',
    }

    try {
      if (isEdit) {
        await updateTeamAction(data.id, values)
        notify.admin.team.saveSuccess(true)
      } else {
        await createTeamAction(values)
        notify.admin.team.saveSuccess(false)
      }
      onSuccess()
    } catch (error) {
      notify.system.error('Erro ao salvar time.')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form id="team-form" onSubmit={handleSubmit}>
      <FormLayout
        title={isEdit ? 'Editar Time' : 'Novo Time'}
        description={
          isEdit ? 'Atualize as informações do time' : 'Cadastre um novo time no sistema'
        }
        mode={readOnly ? 'view' : isEdit ? 'edit' : 'create'}
        loading={isPending}
        onCancel={onCancel}
        onEdit={onEdit}
        formId="team-form"
        variant="dialog"
      >
        <FormSection>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome do Time</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Time de Desenvolvimento"
                  defaultValue={data?.name}
                  required
                  disabled={readOnly}
                />
              </FieldContent>
              <FieldDescription>O nome que identificará este time no sistema.</FieldDescription>
            </Field>

            <FieldLabel htmlFor="isActive" className="md:col-span-2">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Status do Time</FieldTitle>
                  <FieldDescription>
                    Define se o time está ativo para novos projetos.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={data?.isActive ?? true}
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
