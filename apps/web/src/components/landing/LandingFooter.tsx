import { cn } from '#/lib/utils'

const footerLinks = [
  { label: 'Termos', href: '/termos' },
  { label: 'Privacidade', href: '/privacidade' },
  { label: 'Contacto', href: '/contacto' },
] as const

export function LandingFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear()

  return (
    <footer className={cn('border-t bg-muted/30 py-6 sm:py-8', className)}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-muted-foreground text-center text-sm sm:text-left">
          © {year} Zentria. Todos os direitos reservados.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {footerLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground py-2 text-sm transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
