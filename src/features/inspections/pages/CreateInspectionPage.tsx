import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCreateInspectionMutation } from "@/features/inspections/api/inspections.queries"

import { CreateInspectionForm } from "../components/create-inspection-form"
import type { CreateInspectionFormValues } from "../types/create-inspection.types"

export function CreateInspectionPage() {
    const navigate = useNavigate()
    const createInspection = useCreateInspectionMutation()

    const errorMessage =
        createInspection.error instanceof Error
            ? createInspection.error.message
            : "No se pudo crear la inspección."

    const handleSubmit = async (values: CreateInspectionFormValues) => {
        const createdInspection = await createInspection.mutateAsync(values)
        navigate(`/inspections/${createdInspection.id}`)
    }

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
            <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/inspections">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a inspecciones
                        </Link>
                    </Button>

                    <Badge variant="outline">Primer entregable</Badge>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nueva inspección
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra la cabecera inicial de la inspección y luego continúa en la vista detalle.
                    </p>
                </div>
            </header>

            <CreateInspectionForm
                onSubmit={handleSubmit}
                isPending={createInspection.isPending}
                serverError={createInspection.isError ? errorMessage : null}
            />
        </section>
    )
}