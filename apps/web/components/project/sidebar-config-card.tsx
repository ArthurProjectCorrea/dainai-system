'use client'

import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import {
  FolderPlusIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  LibraryIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  LogOutIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarGroup, SidebarGroupType, SidebarItem } from '@/types'
import { Document } from '@/types'
import { getDocumentsAction } from '@/lib/action/document-action'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'

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
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Helpers ---

const DynamicIcon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return <FileTextIcon className={className} />

  const normalizedName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/Icon$/i, '')

  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  const Icon = icons[normalizedName] || icons[`${normalizedName}Icon`] || HelpCircleIcon
  return <Icon className={className} />
}

// --- Responsive Wrapper ---

interface ResponsiveSettingsProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  children: React.ReactNode
}

function ResponsiveSettings({ trigger, title, description, children }: ResponsiveSettingsProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="p-0">
          {title || description ? (
            <DrawerHeader className="text-left px-6 pt-6 pb-2">
              {title && <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>}
              {description && (
                <DrawerDescription className="text-sm">{description}</DrawerDescription>
              )}
            </DrawerHeader>
          ) : (
            <DrawerTitle className="sr-only">Opções</DrawerTitle>
          )}
          <div className="px-6 py-6 pb-12">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl" align="end">
        <div className="grid gap-4">
          {(title || description) && (
            <div className="space-y-2">
              {title && <h4 className="font-medium leading-none">{title}</h4>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// --- Sortable Item Component ---

interface SortableDocumentProps {
  id: string
  groupId: string
  item: SidebarItem
  group?: SidebarGroup // Added for Solo items
  isSolo?: boolean
  readOnly?: boolean
  onRemove?: () => void
  onUpdate?: (data: Partial<SidebarGroup>) => void
  groupIcon?: string
  hideSettings?: boolean
}

interface DocumentItemUIProps {
  item: SidebarItem
  groupIcon?: string
  isSolo?: boolean
  hideSettings?: boolean
  isDragging?: boolean
  isOverlay?: boolean
  onUpdate?: (data: Partial<SidebarGroup>) => void
  onRemove?: () => void
  readOnly?: boolean
  setNodeRef?: (element: HTMLElement | null) => void
  style?: React.CSSProperties
  attributes?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  listeners?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function DocumentItemUI({
  item,
  groupIcon,
  isSolo,
  hideSettings,
  isDragging,
  isOverlay,
  onUpdate,
  onRemove,
  readOnly,
  setNodeRef,
  style,
  attributes,
  listeners,
}: DocumentItemUIProps) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between p-2 rounded-lg bg-background border shadow-sm group/item transition-all w-full',
        isDragging && !isOverlay && 'opacity-30 border-primary ring-2 ring-primary/20',
        isOverlay && 'border-primary shadow-2xl cursor-grabbing z-50 bg-card rotate-1 scale-105',
        isSolo && 'bg-muted/30 border-dashed',
        !isDragging && !isOverlay && 'mb-1.5',
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors touch-none"
        >
          <GripVerticalIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
        </div>

        {isSolo ? (
          <DynamicIcon name={groupIcon} className="h-4 w-4 text-primary/70 shrink-0" />
        ) : (
          <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
        )}

        <span className={cn('text-xs font-medium truncate flex-1', isSolo && 'font-bold text-sm')}>
          {item.documentName || 'Documento...'}
        </span>

        {item.isPublished === false && (
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-[8px] uppercase font-bold border-yellow-500/50 text-yellow-500 bg-yellow-500/5 whitespace-nowrap"
          >
            Draft
          </Badge>
        )}
      </div>

      {!readOnly && !hideSettings && isSolo && onUpdate && (
        <div className="flex items-center gap-1 ml-2">
          <ResponsiveSettings
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            }
          >
            <div className="grid gap-4 pt-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-xs font-medium">Ícone</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 shrink-0 border rounded bg-muted/30">
                    <DynamicIcon name={groupIcon} className="h-4 w-4" />
                  </div>
                  <Input
                    value={groupIcon || ''}
                    onChange={e => onUpdate?.({ icon: e.target.value })}
                    placeholder="Ex: book..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-[10px] font-bold uppercase gap-2 hover:bg-muted"
                  onClick={() => onRemove?.()}
                >
                  <LogOutIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Desagrupar
                </Button>
              )}
            </div>
          </ResponsiveSettings>
        </div>
      )}
    </div>
  )
}

function SortableDocumentItem({
  id,
  groupId,
  item,
  group,
  isSolo,
  readOnly,
  onRemove,
  onUpdate,
  groupIcon,
  hideSettings,
}: SortableDocumentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'item', groupId, item, group },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <DocumentItemUI
      item={item}
      groupIcon={groupIcon}
      isSolo={isSolo}
      hideSettings={hideSettings}
      isDragging={isDragging}
      isOverlay={false}
      onUpdate={onUpdate}
      onRemove={onRemove}
      readOnly={readOnly}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  )
}

// --- Sortable Group Component ---

interface GroupCardUIProps {
  group: SidebarGroup
  isDragging?: boolean
  isOverlay?: boolean
  onUpdate?: (id: string, updates: Partial<SidebarGroup>) => void
  onRemove?: (id: string) => void
  setNodeRef?: (element: HTMLElement | null) => void
  style?: React.CSSProperties
  readOnly?: boolean
  attributes?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  listeners?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function GroupCardUI({
  group,
  readOnly,
  isDragging,
  isOverlay,
  onUpdate,
  onRemove,
  setNodeRef,
  style,
  attributes,
  listeners,
}: GroupCardUIProps) {
  const itemIds = React.useMemo(
    () => group.items.map((item: SidebarItem) => item.id),
    [group.items],
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/group relative border rounded-xl bg-card transition-all mb-4 shadow-sm pb-3',
        isDragging && !isOverlay && 'opacity-30 ring-2 ring-primary/10',
        isOverlay &&
          'border-primary shadow-2xl cursor-grabbing rotate-1 scale-105 z-50 bg-background',
      )}
    >
      <div className="flex items-stretch justify-between group/header mb-2 border-b border-muted/50 pb-1">
        <div className="flex items-stretch flex-1 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing px-3 flex items-center justify-center hover:bg-muted/50 transition-colors touch-none shrink-0 rounded-tl-xl relative z-20"
          >
            <GripVerticalIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
          </div>

          <div className="flex-1 py-3 px-2 w-full relative z-10 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <DynamicIcon name={group.icon} className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <span className="text-sm font-bold truncate leading-tight w-full">{group.title}</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {group.items.length} {group.items.length === 1 ? 'documento' : 'documentos'}
              </span>
            </div>
          </div>
        </div>

        {!readOnly && !isOverlay && (
          <div className="flex items-center px-3 shrink-0 ml-auto relative z-20">
            <ResponsiveSettings
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
            >
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-xs font-medium">Título</Label>
                  <Input
                    value={group.title}
                    onChange={e => onUpdate?.(group.id, { title: e.target.value })}
                    disabled={group.title.toLowerCase() === 'outros'}
                    className="col-span-2 h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-xs font-medium">Exibição</Label>
                  <Select
                    value={group.type}
                    onValueChange={val => onUpdate?.(group.id, { type: val as SidebarGroupType })}
                  >
                    <SelectTrigger className="col-span-2 h-8 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="List">Lista</SelectItem>
                      <SelectItem value="Collapse">Collapse</SelectItem>
                      <SelectItem value="Dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-xs font-medium">Ícone</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 shrink-0 border rounded bg-muted/30">
                      <DynamicIcon name={group.icon} className="h-4 w-4" />
                    </div>
                    <Input
                      value={group.icon || ''}
                      onChange={e => onUpdate?.(group.id, { icon: e.target.value })}
                      placeholder="Ex: folder..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                {group.title.toLowerCase() !== 'outros' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 h-8 text-[10px] font-bold uppercase gap-2 hover:bg-muted"
                    onClick={() => onRemove?.(group.id)}
                  >
                    <LogOutIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Desagrupar
                  </Button>
                )}
              </div>
            </ResponsiveSettings>
          </div>
        )}
      </div>

      <div className="px-4">
        <div className="pl-6 border-l-2 border-muted/50 ml-2 space-y-2">
          {!isOverlay ? (
            <SortableContext id={group.id} items={itemIds} strategy={verticalListSortingStrategy}>
              <div className="min-h-[40px] flex flex-col gap-2">
                {group.items.length === 0 && (
                  <div className="w-full h-10 rounded-full flex items-center justify-center border-dashed border-2 border-muted-foreground/20 bg-muted/10 transition-colors group-hover/group:border-primary group-hover/group:bg-primary/5">
                    <span className="text-xs font-bold text-muted-foreground group-hover/group:text-primary">
                      Soltar Item Aqui
                    </span>
                  </div>
                )}
                {group.items.map((item: SidebarItem) => (
                  <SortableDocumentItem
                    key={item.id}
                    id={item.id}
                    groupId={group.id}
                    item={item}
                    readOnly={readOnly}
                    hideSettings={true}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="min-h-[40px] flex flex-col gap-2">
              {group.items.map((item: SidebarItem) => (
                <DocumentItemUI key={item.id} item={item} isOverlay={true} hideSettings={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SortableGroupCard({
  id,
  group,
  readOnly,
  onUpdate,
  onRemove,
}: {
  id: string
  group: SidebarGroup
  readOnly?: boolean
  onUpdate: (id: string, updates: Partial<SidebarGroup>) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'group', group },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <GroupCardUI
      group={group}
      readOnly={readOnly}
      isDragging={isDragging}
      isOverlay={false}
      onUpdate={onUpdate}
      onRemove={onRemove}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  )
}

function BetweenDropZone({ id, index }: { id: string; index: number }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type: 'between', index },
  })
  return (
    <div ref={setNodeRef} className="w-full relative py-0.5">
      <div
        className={cn(
          'w-full rounded-full transition-all duration-200 flex items-center justify-center',
          isOver
            ? 'h-8 bg-primary/10 border border-primary border-dashed my-1'
            : 'h-1 bg-transparent',
        )}
      >
        {isOver && <span className="text-[10px] font-bold text-primary">Soltar como Solo</span>}
      </div>
    </div>
  )
}

// --- Main Component ---

interface SidebarConfigCardProps {
  projectId: string
  initialConfig?: SidebarGroup[]
  onChange: (config: SidebarGroup[]) => void
  readOnly?: boolean
}

export function SidebarConfigCard({
  projectId,
  initialConfig = [],
  onChange,
  readOnly,
}: SidebarConfigCardProps) {
  const [groups, setGroups] = React.useState<SidebarGroup[]>(initialConfig)
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = React.useState(true)

  // DND tracking state
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeType, setActiveType] = React.useState<'group' | 'item' | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  React.useEffect(() => {
    async function fetchDocs() {
      setLoadingDocs(true)
      const result = await getDocumentsAction()
      if (result.data) {
        setDocuments(result.data.documents.filter(d => d.projectId === projectId))
      }
      setLoadingDocs(false)
    }
    fetchDocs()
  }, [projectId])

  React.useEffect(() => {
    if (documents.length === 0) return

    setGroups(prev => {
      const assignedDocIds = new Set(prev.flatMap(g => g.items.map(i => i.documentId)))
      const unassignedDocs = documents.filter(doc => !assignedDocIds.has(doc.id))

      if (unassignedDocs.length === 0) return prev

      const newSoloGroups: SidebarGroup[] = unassignedDocs.map((doc, idx) => ({
        id: crypto.randomUUID(),
        title: doc.name || 'Solo',
        type: 'Solo',
        order: prev.length + idx,
        icon: 'file-text',
        items: [
          {
            id: crypto.randomUUID(),
            documentId: doc.id,
            documentName: doc.name,
            order: 0,
            isPublished: doc.isPublished,
          },
        ],
      }))

      return [...prev, ...newSoloGroups]
    })
  }, [documents])

  const handleUpdate = React.useCallback(
    (newGroupsOrFn: SidebarGroup[] | ((prev: SidebarGroup[]) => SidebarGroup[])) => {
      setGroups(prev => {
        const next = typeof newGroupsOrFn === 'function' ? newGroupsOrFn(prev) : newGroupsOrFn
        return next
      })
    },
    [],
  )

  React.useEffect(() => {
    onChange(groups)
  }, [groups, onChange])

  const findContainer = (id: string) => {
    if (groups.some(g => g.id === id)) return id
    // Check if it's an item ID
    const group = groups.find(g => g.items.some(i => i.id === id))
    if (group) return group.id
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveType(event.active.data.current?.type || null)
  }

  const activeItemData = React.useMemo(() => {
    if (activeType !== 'item' || !activeId) return null
    const foundGroup = groups.find(g => g.items.some(i => i.id === activeId))
    if (!foundGroup) return null
    const item = foundGroup.items.find(i => i.id === activeId)
    return item ? { ...item, groupId: foundGroup.id } : null
  }, [activeId, activeType, groups])

  const activeGroupData = React.useMemo(() => {
    if (activeType !== 'group' || !activeId) return null
    return groups.find(g => g.id === activeId) || null
  }, [activeId, activeType, groups])

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    if (active.data.current?.type === 'item') {
      if (overContainer === 'root') {
        // Handle in DragEnd
        return
      }

      // Moving between groups
      handleUpdate(prev => {
        const activeGroup = prev.find(g => g.id === activeContainer)
        const overGroup = prev.find(g => g.id === overContainer)

        if (!activeGroup || !overGroup) return prev
        // IMPORTANT: Prevent dropping items into a Solo group!
        if (overGroup.type === 'Solo') return prev

        const activeIndex = activeGroup.items.findIndex(i => i.id === activeId)
        const itemMove = activeGroup.items[activeIndex]
        if (!itemMove) return prev

        const overIndex = overGroup.items.findIndex(i => i.id === overId)

        return prev
          .map(g => {
            if (g.id === activeContainer) {
              return { ...g, items: g.items.filter(i => i.id !== activeId) }
            }
            if (g.id === overContainer) {
              const newItems = [...g.items]
              newItems.splice(overIndex >= 0 ? overIndex : newItems.length, 0, itemMove)
              return { ...g, items: newItems }
            }
            return g
          })
          .filter(g => !(g.type === 'Solo' && g.items.length === 0))
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveType(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Item dropping between groups (making it Solo)
    if (active.data.current?.type === 'item' && over.data.current?.type === 'between') {
      const activeContainer = findContainer(activeId)
      const insertIndex = over.data.current.index as number

      if (activeContainer && activeContainer !== 'pool') {
        handleUpdate(prev => {
          const groupIndex = prev.findIndex(g => g.id === activeContainer)
          if (groupIndex === -1) return prev
          const item = prev[groupIndex].items.find(i => i.id === activeId)
          if (!item) return prev

          // Create new Solo group
          const newSoloGroup: SidebarGroup = {
            id: crypto.randomUUID(),
            title: item.documentName || 'Solo',
            type: 'Solo',
            order: 0, // Order will be recalculated
            icon: 'file-text',
            items: [{ ...item, order: 0 }],
          }

          const newGroups = [...prev]
          // Remove item from old group
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            items: newGroups[groupIndex].items.filter(i => i.id !== activeId),
          }

          // Insert Solo group at the target index
          newGroups.splice(insertIndex, 0, newSoloGroup)

          // Recalculate orders and remove empty solos
          return newGroups
            .filter(g => !(g.type === 'Solo' && g.items.length === 0))
            .map((g, i) => ({ ...g, order: i }))
        })
      }
      return
    }

    // Group sorting
    if (active.data.current?.type === 'group') {
      if (activeId !== overId) {
        const oldIndex = groups.findIndex(g => g.id === activeId)
        const newIndex = groups.findIndex(g => g.id === overId)
        handleUpdate(arrayMove(groups, oldIndex, newIndex).map((g, i) => ({ ...g, order: i })))
      }
      return
    }

    // Item sorting within the same group
    if (active.data.current?.type === 'item') {
      const activeContainer = findContainer(activeId)
      const overContainer = findContainer(overId)

      if (activeContainer && overContainer && activeContainer === overContainer) {
        handleUpdate(prev => {
          const groupIndex = prev.findIndex(g => g.id === activeContainer)
          if (groupIndex === -1) return prev

          const group = prev[groupIndex]
          const oldIndex = group.items.findIndex(i => i.id === activeId)
          const newIndex = group.items.findIndex(i => i.id === overId)

          if (oldIndex !== newIndex) {
            const newItems = arrayMove(group.items, oldIndex, newIndex).map((item, i) => ({
              ...item,
              order: i,
            }))
            const newGroups = [...prev]
            newGroups[groupIndex] = { ...group, items: newItems }
            return newGroups
          }
          return prev
        })
      }
    }
  }

  return (
    <Card className="shadow-sm border-muted/40 overflow-visible">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Estrutura da Wiki</CardTitle>
            <CardDescription className="text-xs">
              Configure como os documentos aparecem na navegação.
            </CardDescription>
          </div>
          {!readOnly && (
            <Button
              onClick={() =>
                handleUpdate([
                  ...groups,
                  {
                    id: crypto.randomUUID(),
                    title: 'Novo Grupo',
                    type: 'List',
                    order: groups.length,
                    icon: 'folder',
                    items: [],
                  },
                ])
              }
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-xs font-semibold border-dashed hover:border-primary/50 hover:bg-primary/5"
            >
              <FolderPlusIcon className="h-4 w-4" />
              Agrupador
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6 py-4 pt-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2 pb-2">
            <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
              {groups.map((group, index) => {
                const renderGroup = () => {
                  if (group.type === 'Solo' && group.items.length === 1) {
                    return (
                      <SortableDocumentItem
                        key={group.id}
                        id={group.items[0].id} // Reverted to item id to allow it to be moved
                        groupId={group.id}
                        group={group}
                        item={group.items[0]}
                        readOnly={readOnly}
                        isSolo={true}
                        groupIcon={group.icon}
                        onRemove={() => {
                          const outros = groups.find(g => g.title.toLowerCase() === 'outros')
                          if (outros && group.title.toLowerCase() !== 'outros') {
                            handleUpdate(prev => {
                              const item = group.items[0]
                              const next = prev.filter(g => g.id !== group.id)
                              const outrosIdx = next.findIndex(g => g.id === outros.id)
                              next[outrosIdx].items.push(item)
                              return next
                            })
                          }
                        }}
                        onUpdate={data =>
                          handleUpdate(prev =>
                            prev.map(g => (g.id === group.id ? { ...g, ...data } : g)),
                          )
                        }
                      />
                    )
                  }
                  return (
                    <SortableGroupCard
                      key={group.id}
                      id={group.id}
                      group={group}
                      readOnly={readOnly}
                      onUpdate={(id, updates) =>
                        handleUpdate(prev =>
                          prev.map(g => (g.id === id ? { ...g, ...updates } : g)),
                        )
                      }
                      onRemove={() => {
                        handleUpdate(prev => {
                          const itemsToMove = prev.find(g => g.id === group.id)?.items || []
                          const next = prev.filter(g => g.id !== group.id)

                          const newSoloGroups: SidebarGroup[] = itemsToMove.map((item, idx) => ({
                            id: crypto.randomUUID(),
                            title: item.documentName || 'Solo',
                            type: 'Solo',
                            order: next.length + idx,
                            icon: 'file-text',
                            items: [{ ...item, order: 0 }],
                          }))

                          return [...next, ...newSoloGroups]
                        })
                      }}
                    />
                  )
                }

                return (
                  <React.Fragment key={group.id}>
                    {activeType === 'item' && (
                      <BetweenDropZone id={`between-${index}`} index={index} />
                    )}
                    {renderGroup()}
                  </React.Fragment>
                )
              })}
              {activeType === 'item' && (
                <BetweenDropZone id={`between-${groups.length}`} index={groups.length} />
              )}
            </SortableContext>

            {groups.length === 0 && !loadingDocs && (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl bg-muted/5">
                <LibraryIcon className="h-10 w-10 text-muted/30 mb-3" />
                <p className="text-xs text-muted-foreground font-semibold">
                  Clique em &quot;Agrupador&quot; ou arraste documentos abaixo para começar.
                </p>
              </div>
            )}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeId && activeType === 'item' && activeItemData ? (
              <div className="w-[300px]">
                <DocumentItemUI
                  item={activeItemData}
                  isSolo={
                    activeItemData.groupId
                      ? groups.find(g => g.id === activeItemData.groupId)?.type === 'Solo'
                      : false
                  }
                  hideSettings={true}
                  isOverlay={true}
                  groupIcon={groups.find(g => g.id === activeItemData.groupId)?.icon}
                />
              </div>
            ) : activeId && activeType === 'group' && activeGroupData ? (
              <div className="w-[300px]">
                <GroupCardUI group={activeGroupData} isOverlay={true} readOnly={true} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  )
}
