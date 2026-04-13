import Image from 'next/image'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start  ">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              className="dark:invert h-5 w-auto animate-pulse"
              src="/logo.png"
              alt="Next.js logo"
              width={124}
              height={24}
              priority
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      <div className="bg-linear-to-br dark:from-[#001969] from-[#AB83F3] to-[#2EB8FF]"></div>
    </main>
  )
}
