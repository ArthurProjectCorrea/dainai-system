'use client'

import * as React from 'react'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-background p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent w-full',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: date => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-full', defaultClassNames.root),
        months: cn('relative flex w-full flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-10 sm:size-8 p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-10 sm:size-8 p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-10 w-full items-center justify-center',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-10 w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn('relative rounded-md', defaultClassNames.dropdown_root),
        dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
        caption_label: cn('font-medium select-none text-sm', defaultClassNames.caption_label),
        table: 'w-full border-collapse',
        weekdays: cn('flex w-full', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 text-[0.8rem] font-normal text-muted-foreground select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-10 sm:w-8 select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'text-[0.8rem] text-muted-foreground select-none w-10 sm:w-8 flex items-center justify-center',
          defaultClassNames.week_number,
        ),
        day: cn('flex-1 aspect-square p-0 text-center select-none', defaultClassNames.day),
        range_start: cn(
          'relative isolate z-0 bg-muted rounded-l-md',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none bg-muted', defaultClassNames.range_middle),
        range_end: cn('relative isolate z-0 bg-muted rounded-r-md', defaultClassNames.range_end),
        today: cn('text-accent-foreground font-bold', defaultClassNames.today),
        outside: cn(
          'text-muted-foreground/30 aria-selected:text-muted-foreground/50',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn('w-full', className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-10 sm:size-8 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'size-full aspect-square p-0 font-normal rounded-md aria-selected:opacity-100 data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:bg-muted data-[range-middle=true]:text-muted-foreground',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
