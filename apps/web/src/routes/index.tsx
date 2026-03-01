import ThemeToggle from '#/components/ThemeToggle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App
})

function App() {
  return (
    <div>
      <span>
        Landing Page
        <ThemeToggle />
      </span>
    </div>
  )
}
