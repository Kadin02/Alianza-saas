import { useNavigate } from "react-router-dom"

import { Button } from "@/shared/ui/button"

/** Placeholder: el módulo de Onboarding (alta de organización nueva) va aquí a continuación. */
export default function OnboardingPlaceholder() {
  const navigate = useNavigate()
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg rounded-2xl border border-primary-container/8 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="text-headline-md text-primary-container">Onboarding</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Próximo módulo a construir.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate("/select-organization")}>
          Volver al selector
        </Button>
      </div>
    </main>
  )
}
