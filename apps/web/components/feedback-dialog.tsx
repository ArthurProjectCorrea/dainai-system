'use client'

import * as React from 'react'
import { Angry, Frown, Meh, Smile, Laugh, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { sendPublicFeedback } from '@/lib/feedback-service'
import { cn } from '@/lib/utils'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ratings = [
  {
    note: 1,
    icon: Angry,
    label: 'Muito Insatisfeito',
    color: 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
  },
  {
    note: 2,
    icon: Frown,
    label: 'Insatisfeito',
    color: 'hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30',
  },
  {
    note: 3,
    icon: Meh,
    label: 'Neutro',
    color: 'hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30',
  },
  {
    note: 4,
    icon: Smile,
    label: 'Satisfeito',
    color: 'hover:text-lime-500 hover:bg-lime-50 dark:hover:bg-lime-950/30',
  },
  {
    note: 5,
    icon: Laugh,
    label: 'Muito Satisfeito',
    color: 'hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
]

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleRate = async (note: number) => {
    if (!user?.id) return

    setIsSubmitting(true)
    const result = await sendPublicFeedback(note, user.id)
    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        // Reset after dialog closes
        setTimeout(() => setIsSuccess(false), 300)
      }, 2000)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-100 dark:bg-emerald-950/50 p-3 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Obrigado pelo seu feedback!</h3>
              <p className="text-muted-foreground">
                Sua opinião nos ajuda a evoluir nossa plataforma.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">
                Como está sendo sua experiência?
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                Sua avaliação é fundamental para melhorarmos o sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-2 py-8 px-2">
              {ratings.map(rating => {
                const Icon = rating.icon
                return (
                  <button
                    key={rating.note}
                    disabled={isSubmitting}
                    onClick={() => handleRate(rating.note)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 border border-transparent',
                      'hover:border-input hover:shadow-md active:scale-95 group disabled:opacity-50 disabled:pointer-events-none',
                      rating.color,
                    )}
                  >
                    <Icon className="h-10 w-10 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-medium text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                      {rating.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Sua resposta será registrada de forma segura.
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
