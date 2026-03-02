import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'

const plans = [
  {
    name: 'Plano Coach',
    description: 'Um coach, número ilimitado de alunos.',
    features: [
      'Um coach por organização',
      'Alunos ilimitados',
      'Métricas e avaliações',
      'Gráficos de evolução',
      'Histórico de lesões',
      'Planos de nutrição',
    ],
    cta: 'Escolher Coach',
    highlighted: false,
  },
  {
    name: 'Plano Enterprise',
    description: 'Vários coaches; valor com base em alunos ativos.',
    features: [
      'Múltiplos coaches',
      'Várias organizações',
      'Billing por alunos ativos',
      'Todas as funcionalidades Coach',
      'Suporte dedicado',
    ],
    cta: 'Contactar vendas',
    highlighted: true,
  },
] as const

export function LandingPricing({ className }: { className?: string }) {
  return (
    <section
      id="planos"
      className={cn(
        'mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16',
        className
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Planos para cada necessidade
        </h2>
        <p className="text-muted-foreground mt-4 text-base">
          Coach para começar; Enterprise para crescer.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'mx-auto w-full max-w-md rounded-2xl p-5 shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-6 lg:max-w-none',
              plan.highlighted &&
                'border-primary ring-2 ring-primary/20 shadow-lg lg:scale-[1.02]'
            )}
          >
            <CardHeader className="px-0">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="text-primary size-5 shrink-0" />
                    <span className="text-muted-foreground text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="px-0">
              <Button
                className="min-h-11 w-full rounded-xl"
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link
                  to="/signup"
                  search={plan.highlighted ? { plan: 'enterprise' } : undefined}
                >
                  {plan.cta}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
