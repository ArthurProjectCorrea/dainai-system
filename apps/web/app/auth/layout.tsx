import Image from 'next/image'
import Link from 'next/link'

import { VoxelWaves } from '@/components/ui/voxel-waves'
import { Typewriter } from '@/components/ui/typewriter'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

function LegalDrawer({ title }: { title: string }) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground h-auto p-0"
        >
          {title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>Informações legais do DAINAI System.</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const phrases = [
    'O futuro da gestão inteligente. Gerencie seus projetos, equipes e conhecimentos em uma única plataforma.',
    'Automatize fluxos de trabalho e elimine tarefas repetitivas para focar no que realmente importa.',
    'Obtenha visibilidade em tempo real das métricas da sua empresa com painéis avançados.',
    'Organize as informações, alinhe a comunicação corporativa e impulsione seus resultados.',
  ]

  return (
    <main className="grid min-h-svh lg:grid-cols-2 bg-background overflow-hidden">
      <div className="relative flex flex-col gap-4 p-6 md:p-10 animate-in fade-in slide-in-from-left-4 duration-700 z-10 bg-background shadow-2xl">
        {/* Header/Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              className="dark:invert"
              src="/logo.png"
              alt="DAINAI Logo"
              width={124}
              height={24}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[350px] animate-in fade-in zoom-in-95 duration-1000 delay-200">
            {children}
          </div>
        </div>

        {/* Footer info & Legal Drawers */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/50 text-center mt-auto">
          <span>© {new Date().getFullYear()} DAINAI System. Todos os direitos reservados.</span>
          <div className="flex items-center justify-center gap-4">
            <LegalDrawer title="Termos de Privacidade" />
            <LegalDrawer title="Política" />
          </div>
        </div>
      </div>

      {/* Decorative Side */}
      <div className="relative hidden overflow-hidden lg:block animate-in fade-in duration-1000">
        <VoxelWaves />

        <div className="absolute inset-0 flex items-center justify-center p-16 z-10 pointer-events-none">
          <div className="w-full max-w-lg text-center">
            <h2 className="text-2xl md:text-3xl font-medium leading-relaxed tracking-wide text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] min-h-[120px] flex items-center justify-center">
              <Typewriter
                words={phrases}
                typingSpeed={60}
                deletingSpeed={30}
                delayBetweenWords={4000}
              />
            </h2>
          </div>
        </div>
      </div>
    </main>
  )
}
