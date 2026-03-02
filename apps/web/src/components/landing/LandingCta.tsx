import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export function LandingCta({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16',
        className
      )}
    >
      <div className="bg-primary/10 ring-primary/20 rounded-2xl px-5 py-12 text-center ring-1 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Pronto para elevar a performance dos teus atletas?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base sm:text-lg">
            Cria a tua conta e começa a organizar avaliações, lesões e nutrição em
            minutos.
          </p>
          <div className="mt-8">
            <Button size="lg" className="min-h-11 px-8 rounded-xl" asChild>
              <Link to="/signup">Criar conta</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
