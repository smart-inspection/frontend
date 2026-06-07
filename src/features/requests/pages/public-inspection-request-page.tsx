import { ArrowRight, CalendarDays, ClipboardList, TimerReset } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PublicInspectionRequestForm } from "../components/public-inspection-request-form"

const steps = [
    {
        title: "Registro",
        description: "La empresa cliente registra su requerimiento de inspección.",
    },
    {
        title: "Programación",
        description: "El equipo operativo agenda fecha, lugar e inspector responsable.",
    },
    {
        title: "Ejecución y medición",
        description: "La inspección y el informe avanzan con trazabilidad y KPIs.",
    },
]

export function PublicInspectionRequestPage() {
    return (
        <section className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                <header className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-lg font-semibold tracking-tight">Smart Inspect</p>
                        <p className="text-sm text-slate-600">
                            Solicitud pública de inspecciones
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link to="/">
                            Ir al sistema
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </header>

                <div className="grid flex-1 gap-6 py-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Badge variant="outline">Flujo operativo</Badge>
                            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance">
                                Registra una solicitud y déjala lista para programación,
                                ejecución y seguimiento.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                Esta vista pública permite capturar el requerimiento inicial del
                                cliente sin entrar al módulo interno. El equipo operativo podrá
                                continuar después con programación, informe y dashboard.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ClipboardList className="h-4 w-4" />
                                        Solicitud
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Registro inicial de empresa, contacto, ubicación y servicio.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <CalendarDays className="h-4 w-4" />
                                        Programación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Base lista para asignar responsable y fecha operativa.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TimerReset className="h-4 w-4" />
                                        Productividad
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Entrada natural al flujo de medición y KPIs del módulo.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Cómo queda el flujo
                                </CardTitle>
                                <CardDescription>
                                    Secuencia mínima para enlazar registro público con operación
                                    interna.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={step.title} className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium">{step.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                        {index < steps.length - 1 ? <Separator /> : null}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <PublicInspectionRequestForm />
                </div>
            </div>
        </section>
    )
}