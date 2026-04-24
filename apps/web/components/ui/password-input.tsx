'use client'

import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

/**
 * Componente de Input de Senha com alternância de visibilidade.
 * Utiliza o padrão InputGroup para uma estética premium e integrada.
 */
export type PasswordInputProps = React.ComponentProps<'input'>

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <InputGroup className={cn(className)}>
        <InputGroupInput ref={ref} type={showPassword ? 'text' : 'password'} {...props} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            title={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
