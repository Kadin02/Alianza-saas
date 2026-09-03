import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Home,
  Landmark,
  Mail,
  MapPin,
  Palette,
  Phone,
  ShieldCheck,
  Tent,
  X,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import loginBackground from "@/assets/images/login-background.jpg"
import type { OrganizationType } from "@/modules/auth/types"
import { setActiveOrgId } from "@/shared/lib/org-storage"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Logo } from "@/shared/ui/Logo"

import { checkSlugAvailability, createOrganization } from "./api"
import { brandColorPalette, orgTypeLabels } from "./labels"

const orgTypeIcons: Record<OrganizationType, typeof Home> = {
  RESIDENCIAL: Home,
  CORPORATIVO: Building2,
  PARCELAS: Tent,
  ADMINISTRADORA: Landmark,
}

const onboardingSchema = z.object({
  name: z.string().min(2, "Ingresa el nombre de la organización"),
  org_type: z.enum(["RESIDENCIAL", "CORPORATIVO", "PARCELAS", "ADMINISTRADORA"]),
  tax_id: z.string().optional(),
  contact_email: z.string().email("Correo inválido").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  brand_color: z.string(),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { org_type: "RESIDENCIAL", brand_color: "#005CBB", slug: "" },
  })

  const name = watch("name")
  const orgType = watch("org_type")
  const slug = watch("slug")
  const brandColor = watch("brand_color")
  const [slugTouched, setSlugTouched] = useState(false)

  const slugQuery = useQuery({
    queryKey: ["check-slug", slug],
    queryFn: () => checkSlugAvailability(slug),
    enabled: slug.length >= 3,
  })

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (membership) => {
      setActiveOrgId(membership.organization.id)
      navigate("/org-home")
    },
  })

  async function goToStep2() {
    const valid = await trigger(["name", "org_type"])
    if (valid) setStep(2)
  }

  function onSubmit(values: OnboardingValues) {
    mutation.mutate({
      name: values.name,
      slug: values.slug,
      org_type: values.org_type,
      tax_id: values.tax_id || undefined,
      contact_email: values.contact_email || undefined,
      contact_phone: values.contact_phone || undefined,
      address: values.address || undefined,
      brand_color: values.brand_color,
    })
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img src={loginBackground} alt="" className="h-full w-full scale-105 object-cover object-center blur-[2px] brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-[#1a2538]/90 to-[#0f172a]/95" />
      </div>

      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 text-white backdrop-blur-md">
          <Logo />
        </div>
        <button
          onClick={() => navigate("/select-organization")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-body-sm font-medium text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Cancelar y volver
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="mb-6 text-center text-white">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-label-md text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
            Setup Multi-Tenant
          </div>
          <h1 className="text-headline-lg">Alta de Nueva Organización</h1>
        </div>

        {/* Stepper */}
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-sm">
          {(["Datos de Organización", "Marca & Acceso"] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2
            const done = step > n
            const active = step === n
            return (
              <button
                key={label}
                type="button"
                onClick={() => (n === 1 || step === 2) && setStep(n)}
                className={cn(
                  "flex items-center gap-2 rounded-xl p-2 text-left transition-colors",
                  active && "bg-secondary-fixed text-on-secondary-fixed",
                  !active && "hover:bg-surface-container-low"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-bold",
                    done ? "bg-emerald-600 text-white" : active ? "bg-brand-blue text-white" : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </div>
                <div className="min-w-0">
                  <div className="text-label-sm font-bold uppercase text-on-surface-variant">Paso {n}</div>
                  <p className="truncate text-title-sm">{label}</p>
                </div>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 items-start gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {step === 1 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-title-sm text-primary-container">Información General de la Entidad</h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name">Nombre de la organización *</Label>
                    <Input id="name" className="mt-1" placeholder="Condominio Parque Oriente" {...register("name")} />
                    {errors.name && <p className="mt-1 text-body-sm text-danger">{errors.name.message}</p>}
                  </div>

                  <div>
                    <Label>Tipo de organización</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(Object.keys(orgTypeLabels) as OrganizationType[]).map((type) => {
                        const Icon = orgTypeIcons[type]
                        const selected = orgType === type
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue("org_type", type, { shouldValidate: true })}
                            className={cn(
                              "flex flex-col rounded-xl p-3 text-left transition-all",
                              selected ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm" : "bg-surface-container-low hover:bg-surface-container"
                            )}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <Icon className="h-5 w-5" />
                              {selected && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-label-md font-semibold">{orgTypeLabels[type].title}</div>
                            <div className="text-body-sm opacity-80">{orgTypeLabels[type].subtitle}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="tax_id">RUT / Identificación tributaria</Label>
                      <Input id="tax_id" className="mt-1" placeholder="77.456.789-K" {...register("tax_id")} />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Teléfono de contacto</Label>
                      <div className="relative mt-1 flex items-center">
                        <Phone className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                        <Input id="contact_phone" className="pl-9" placeholder="+56 9 8765 4321" {...register("contact_phone")} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_email">Email de operaciones y cobros</Label>
                    <div className="relative mt-1 flex items-center">
                      <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                      <Input id="contact_email" type="email" className="pl-9" placeholder="administracion@tuorganizacion.com" {...register("contact_email")} />
                    </div>
                    {errors.contact_email && <p className="mt-1 text-body-sm text-danger">{errors.contact_email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <div className="relative mt-1 flex items-center">
                      <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
                      <Input id="address" className="pl-9" placeholder="Av. Las Condes 12400, Las Condes" {...register("address")} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-title-sm text-primary-container">Marca e Identificador de Acceso</h2>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label>Color de acento de la organización</Label>
                      <span className="font-mono text-body-sm text-on-surface">{brandColor}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {brandColorPalette.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setValue("brand_color", c.hex, { shouldValidate: true })}
                          className={cn(
                            "flex items-center gap-2 rounded-xl p-2 text-left transition-colors",
                            brandColor === c.hex ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container-low hover:bg-surface-container"
                          )}
                        >
                          <span className="h-6 w-6 flex-shrink-0 rounded-lg shadow-sm" style={{ backgroundColor: c.hex }} />
                          <span className="truncate text-label-sm font-semibold">{c.label}</span>
                        </button>
                      ))}
                      <label className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2">
                        <Controller
                          control={control}
                          name="brand_color"
                          render={({ field }) => (
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                            />
                          )}
                        />
                        <span className="text-label-sm font-semibold text-on-surface-variant">Hex libre</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug">Identificador de acceso (portal de propietarios)</Label>
                    <div className="mt-1 flex overflow-hidden rounded-lg bg-surface-container-low shadow-inner">
                      <span className="inline-flex items-center px-3 font-mono text-label-md text-on-surface-variant">alianza.app/</span>
                      <input
                        id="slug"
                        className="h-10 flex-1 bg-transparent px-2 font-mono text-body-md font-semibold text-on-surface focus:outline-none"
                        {...register("slug")}
                        onChange={(e) => {
                          setSlugTouched(true)
                          setValue("slug", slugify(e.target.value), { shouldValidate: true })
                        }}
                        onFocus={() => {
                          if (!slugTouched && name) setValue("slug", slugify(name), { shouldValidate: true })
                        }}
                      />
                      {slug.length >= 3 && (
                        <span
                          className={cn(
                            "flex items-center gap-1 px-3 text-label-sm font-semibold",
                            slugQuery.data?.available ? "text-emerald-600" : "text-danger"
                          )}
                        >
                          {slugQuery.isFetching ? "…" : slugQuery.data?.available ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Disponible
                            </>
                          ) : (
                            "No disponible"
                          )}
                        </span>
                      )}
                    </div>
                    {errors.slug && <p className="mt-1 text-body-sm text-danger">{errors.slug.message}</p>}
                    <p className="mt-1 text-body-sm text-outline">
                      Este enlace servirá para el ingreso de propietarios al portal.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-surface-container-low p-3 text-on-surface-variant">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" />
                    <p className="text-body-sm">
                      Podrás invitar a tu equipo (administradores, portería, propietarios) desde Administración una vez creada la organización.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={step === 1}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Paso anterior
              </Button>
              {step === 1 ? (
                <Button type="button" onClick={goToStep2} className="w-full sm:w-auto">
                  Continuar al Paso 2
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
                  {mutation.isPending ? "Creando…" : "Finalizar y Crear Organización"}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
            {mutation.isError && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger-text">
                No se pudo crear la organización. Intenta de nuevo.
              </p>
            )}
          </div>

          {/* Live preview */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-brand-blue" />
                <h3 className="text-label-md font-bold uppercase tracking-wider text-primary-container">Vista previa</h3>
              </div>
              <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-inner">
                <div className="flex h-10 items-center justify-between px-3 text-white" style={{ backgroundColor: brandColor }}>
                  <span className="truncate text-label-sm font-semibold">{name || "Nueva Organización"}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="space-y-1 p-3">
                  <div className="truncate text-title-sm font-bold text-on-surface">{name || "Nueva Organización"}</div>
                  <div className="text-label-sm font-medium" style={{ color: brandColor }}>
                    {orgTypeLabels[orgType].title}
                  </div>
                  <div className="pt-1 text-label-sm uppercase text-outline">Portal propietarios</div>
                  <div className="truncate font-mono text-body-sm text-on-surface-variant">
                    alianza.app/{slug || "mi-organizacion"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
