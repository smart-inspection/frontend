import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    useConvertInspectionRequestMutation,
    useCreateInspectionMutation,
} from "@/features/inspections/api/inspections.queries"
import { CreateInspectionForm } from "../components/create-inspection-form"
import type { CreateInspectionFormValues } from "../types/create-inspection.types"

export function CreateInspectionPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const createInspection = useCreateInspectionMutation()
    const convertInspectionRequest = useConvertInspectionRequestMutation()

    const requestIdParam = searchParams.get("requestId")
    const inspectionRequestId = requestIdParam ? Number(requestIdParam) : null
    const hasValidInspectionRequestId =
        inspectionRequestId !== null &&
        Number.isFinite(inspectionRequestId) &&
        inspectionRequestId > 0

    const createErrorMessage =
        createInspection.error instanceof Error
            ? createInspection.error.message
            : "No se pudo crear la inspección."

    const convertErrorMessage =
        convertInspectionRequest.error instanceof Error
            ? convertInspectionRequest.error.message
            : "No se pudo convertir la solicitud en inspección."

    const errorMessage = createInspection.isError
        ? createErrorMessage
        : convertInspectionRequest.isError
            ? convertErrorMessage
            : null

    const handleSubmit = async (values: CreateInspectionFormValues) => {
        const createdInspection = await createInspection.mutateAsync(values)

        if (hasValidInspectionRequestId) {
            await convertInspectionRequest.mutateAsync({
                inspectionRequestId,
                payload: {
                    inspection_id: createdInspection.id,
                    status: "converted",
                },
            })
        }

        navigate(`/inspections/${createdInspection.id}`)
    }

    return (
        <section className="space-y-5">
            <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="px-0 hover:bg-transparent">
                        <Link to="/inspections">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a inspecciones
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Primer entregable</Badge>
                    {hasValidInspectionRequestId ? (
                        <Badge variant="secondary">Solicitud #{inspectionRequestId}</Badge>
                    ) : null}
                </div>

                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Nueva inspección
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra la cabecera inicial de la inspección y continúa luego en la vista
                        detalle.
                    </p>
                </div>
            </header>

            <CreateInspectionForm
                onSubmit={handleSubmit}
                isPending={createInspection.isPending || convertInspectionRequest.isPending}
                serverError={errorMessage}
            />
        </section>
    )
}