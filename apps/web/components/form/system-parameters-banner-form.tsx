'use client'

import * as React from 'react'
import { Field, FieldLabel, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save,
  ChevronLeft
} from 'lucide-react'
import { VoxelWaves } from '@/components/ui/voxel-waves'
import { Typewriter } from '@/components/ui/typewriter'
import { FormLayout } from '../layouts/form-layout'
import { cn } from '@/lib/utils'

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Sortable Item ---
interface SortablePhraseProps {
  id: string
  phrase: string
  onRemove: () => void
  onUpdate: (val: string) => void
}

function SortablePhrase({ id, phrase, onRemove, onUpdate }: SortablePhraseProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Translate.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 group/phrase bg-background border rounded-lg p-1 pr-2 shadow-xs transition-shadow',
        isDragging && 'shadow-lg z-50 ring-2 ring-primary/20 opacity-80'
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-muted transition-colors touch-none shrink-0">
        <GripVertical className="size-4 text-muted-foreground/40" />
      </div>
      <Input value={phrase} onChange={(e) => onUpdate(e.target.value)} placeholder="Sua frase aqui..." className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 h-9" />
      <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/phrase:opacity-100 transition-opacity shrink-0" onClick={onRemove}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

interface SystemParametersBannerFormProps {
  variant?: 'page' | 'dialog'
  onCancel?: () => void
  onSave?: () => void
}

export function SystemParametersBannerForm({ variant = 'dialog', onCancel, onSave }: SystemParametersBannerFormProps) {
  const [phrases, setPhrases] = React.useState<{ id: string, text: string }[]>([
    { id: '1', text: "O futuro da gestão inteligente. Gerencie seus projetos, equipes e conhecimentos em uma única plataforma." },
    { id: '2', text: "Automatize fluxos de trabalho e elimine tarefas repetitivas para focar no que realmente importa." },
    { id: '3', text: "Obtenha visibilidade em tempo real das métricas da sua empresa com painéis avançados." }
  ])
  const [bgColor, setBgColor] = React.useState('#001969')
  const [orbColor, setOrbColor] = React.useState('#AB83F3')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPhrases((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <FormLayout
      title="Personalização do Banner"
      description="Ajuste as cores da animação e a ordem das frases da tela de login."
      mode="edit"
      variant={variant}
      hideButtons 
      onCancel={onCancel}
      className="h-full flex flex-col p-0" // Removido padding excessivo
    >
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 -mx-6 -mb-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] overflow-hidden">
          {/* Left Column: Controls */}
          <div className="flex flex-col border-r bg-muted/5 overflow-y-auto p-5 space-y-6 no-scrollbar">
            <div>
              <FieldTitle className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Cores da Animação</FieldTitle>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-[10px]">Background</FieldLabel>
                  <div className="flex items-center gap-2">
                    <div className="relative size-8 rounded-md border shrink-0 overflow-hidden shadow-sm">
                      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
                      <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </div>
                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 text-[10px] font-mono p-1.5" />
                  </div>
                </Field>
                <Field>
                  <FieldLabel className="text-[10px]">Orbs</FieldLabel>
                  <div className="flex items-center gap-2">
                    <div className="relative size-8 rounded-md border shrink-0 overflow-hidden shadow-sm">
                      <div className="absolute inset-0" style={{ backgroundColor: orbColor }} />
                      <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150" value={orbColor} onChange={(e) => setOrbColor(e.target.value)} />
                    </div>
                    <Input value={orbColor} onChange={(e) => setOrbColor(e.target.value)} className="h-8 text-[10px] font-mono p-1.5" />
                  </div>
                </Field>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <FieldLabel className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Mensagens do Carrossel</FieldLabel>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 pb-4 no-scrollbar">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={phrases.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {phrases.map((phrase) => (
                      <SortablePhrase 
                        key={phrase.id} 
                        id={phrase.id} 
                        phrase={phrase.text} 
                        onRemove={() => setPhrases(phrases.filter(p => p.id !== phrase.id))} 
                        onUpdate={(val) => setPhrases(phrases.map(p => p.id === phrase.id ? { ...p, text: val } : p))} 
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full mt-4 border-dashed bg-background h-8 text-xs" onClick={() => setPhrases([...phrases, { id: crypto.randomUUID(), text: "" }])}>
                <Plus className="size-3.5 mr-2" /> Adicionar Frase
              </Button>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="relative bg-[#001969] overflow-hidden flex items-center justify-center p-12 lg:p-20">
            <VoxelWaves bgColor={bgColor} orbColor={orbColor} />
            <div className="relative z-10 w-full max-w-2xl text-center pointer-events-none">
              <h2 className="text-xl md:text-3xl font-medium leading-relaxed tracking-wide text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-h-[140px] flex items-center justify-center">
                <Typewriter
                  words={phrases.map(p => p.text).filter(t => t.trim() !== "")}
                  typingSpeed={60}
                  deletingSpeed={30}
                  delayBetweenWords={4000}
                />
              </h2>
            </div>
            <div className="absolute top-6 right-6 z-30 px-3 py-1 bg-black/30 backdrop-blur-xl rounded-full border border-white/10 text-[9px] text-white/80 uppercase tracking-[0.3em] font-bold pointer-events-none">
              Pré-visualização
            </div>
          </div>
        </div>

        {/* Action Footer - More natural padding and sizes */}
        <div className="flex items-center justify-end gap-3 p-3 border-t bg-muted/40 shrink-0">
          <Button variant="ghost" type="button" onClick={onCancel} className="gap-2 h-9">
            <ChevronLeft className="size-4" />
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} className="gap-2 min-w-32 h-9 shadow-sm">
            <Save className="size-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </FormLayout>
  )
}
