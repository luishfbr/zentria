import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <p className="text-muted-foreground text-center text-sm">
        Página de registo em construção. Será integrada com better-auth.
      </p>
    </div>
  )
}
