import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Quita el foco del input activo antes de desmontarlo (ej. al cerrar un
 * modal tras guardar). Sin esto, el navegador puede dejar su propio popup
 * de autocompletado (direcciones, nombres guardados) pintado en pantalla
 * porque el input desaparece antes de que el navegador alcance a cerrarlo.
 */
export function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
