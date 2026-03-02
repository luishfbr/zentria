import {
  Activity,
  BarChart3,
  Heart,
  Users,
  UtensilsCrossed,
  Trophy,
} from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'

const features = [
  {
    icon: BarChart3,
    title: 'Evolução e gráficos',
    description:
      'Regista resultados nas métricas e acompanha a evolução de cada atleta com gráficos claros e relatórios.',
  },
  {
    icon: Users,
    title: 'Comparar atletas',
    description:
      'Compara atletas lado a lado e analisa desempenho por modalidade ou período.',
  },
  {
    icon: Heart,
    title: 'Histórico de lesões',
    description:
      'Controla lesões com status em tempo real e histórico completo por atleta.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Planos de nutrição',
    description:
      'Cria e gere planos alimentares e histórico de dietas para cada atleta.',
  },
  {
    icon: Activity,
    title: 'Múltiplas modalidades',
    description:
      'Cadastra esportes na organização e define métricas de avaliação por modalidade.',
  },
  {
    icon: Trophy,
    title: 'Portal do atleta',
    description:
      'Os atletas acedem ao seu perfil: resumo, avaliações, saúde e nutrição.',
  },
] as const

export function LandingFeatures({ className }: { className?: string }) {
  return (
    <section
      id="funcionalidades"
      className={cn(
        'mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20',
        className
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Tudo o que precisas para gerir atletas
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
          Ferramentas pensadas para coaches e instituições que querem resultados.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="rounded-2xl p-5 shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-6"
          >
            <CardHeader className="px-0 sm:px-0">
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl sm:size-12">
                <Icon className="size-5 sm:size-6" />
              </div>
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
