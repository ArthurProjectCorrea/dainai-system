'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Option {
  value: string
  label: string
}

interface CreatableComboboxProps {
  options: Option[]
  value?: string
  onValueChange: (value: string, isNew: boolean) => void
  placeholder?: string
  emptyMessage?: string
  createLabel?: string
  disabled?: boolean
}

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção...',
  emptyMessage = 'Nenhum resultado encontrado.',
  createLabel = 'Criar novo',
  disabled,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedOption = options.find(option => option.value === value)

  // Verifica se o termo pesquisado já existe exatamente nas opções
  const exactMatch = options.find(option => option.label.toLowerCase() === search.toLowerCase())

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value ? selectedOption?.label || value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Pesquisar..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty className="py-2">
              <div className="px-2 py-1 text-xs text-muted-foreground">{emptyMessage}</div>
              {search && !exactMatch && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => {
                    onValueChange(search, true)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {createLabel}: <span className="font-bold">&quot;{search}&quot;</span>
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value, false)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {search && !exactMatch && options.length > 0 && (
              <CommandGroup heading="Sugestão">
                <CommandItem
                  value={search}
                  onSelect={() => {
                    onValueChange(search, true)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="text-primary font-medium data-selected:bg-primary/10 data-selected:text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabel}: &quot;{search}&quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
