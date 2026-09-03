import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import loginBackground from "@/assets/images/login-background.jpg"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { setToken } from "@/shared/lib/auth-storage"
import { setActiveOrgId } from "@/shared/lib/org-storage"

import { login } from "./api"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.access_token)
      if (data.memberships.length === 1) {
        setActiveOrgId(data.memberships[0].organization.id)
        navigate("/app")
      } else {
        navigate("/select-organization")
      }
    },
  })

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values)

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
      {/* Fondo: foto arquitectónica del diseño de Stitch + degradado corporativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img
          src={loginBackground}
          alt=""
          className="h-full w-full scale-105 transform object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-brand-blue/45 backdrop-blur-[2px]" />
      </div>

      <section
        aria-label="Formulario de acceso"
        className="relative w-full max-w-[440px] rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl sm:p-10"
      >
        <header className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 mt-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-surface-container px-2.5 py-1 text-label-sm text-primary-container">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-cyan" />
            Plataforma Multi-Organización B2B
          </span>
          <h1 className="text-headline-lg text-primary-container">Iniciar Sesión</h1>
          <p className="mt-1 max-w-[320px] text-body-md text-on-surface-variant">
            Ingresa tus credenciales para acceder a la administración de tu comunidad
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Usuario o Correo electrónico</Label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-outline" />
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="ej. admin@tuorganizacion.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-body-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-outline" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-body-sm text-danger">{errors.password.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
              Correo o contraseña incorrectos.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>
      </section>
    </main>
  )
}
