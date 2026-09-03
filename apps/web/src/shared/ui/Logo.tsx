import { cn } from "@/shared/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 44 44" className="h-7 w-7 flex-shrink-0" fill="none">
        <rect width="44" height="44" rx="10" fill="#2b3a55" />
        <path d="M10 33V19L22 10L34 19V33H25V24H19V33H10Z" fill="#3a80e6" />
        <circle cx="22" cy="17" r="3" fill="#00b3c6" />
      </svg>
      <span className="text-title-sm font-bold tracking-tight">
        Alianza
      </span>
    </div>
  )
}
