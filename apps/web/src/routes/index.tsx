import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingPricing,
} from '#/components/landing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
