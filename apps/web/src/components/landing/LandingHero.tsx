import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export function LandingHero({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-32',
        className
      )}
    >
      <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:text-6xl">
          Gestão de atletas para alta performance
        </h1>
        <p className="text-muted-foreground mt-6 text-base sm:text-lg sm:text-xl">
          Zentria ajuda coaches e instituições a acompanhar a evolução dos
          atletas, com métricas, gráficos, histórico de lesões e planos de
          nutrição — tudo num só lugar.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Button size="lg" className="min-h-11 w-full rounded-xl py-3 sm:w-auto" asChild>
            <Link to="/signup">Começar grátis</Link>
          </Button>
          <Button size="lg" variant="outline" className="min-h-11 w-full rounded-xl py-3 sm:w-auto" asChild>
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
