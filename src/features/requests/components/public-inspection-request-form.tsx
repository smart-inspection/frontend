import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateInspectionRequestMutation } from "../api/inspection-requests.queries"
import type {
    InspectionRequest,
    InspectionRequestFormErrors,
    InspectionRequestFormValues,
} from "../types/inspection-request.types"
import {
    inspectionRequestInitialValues,
    validateInspectionRequestForm,
} from "../types/inspection-request.types"

function emptyToNull(value?: string): string | null {
    const normalized = value?.trim() ?? ""
    return normalized ? normalized : null
}

export function PublicInspectionRequestForm() {
    const [values, setValues] = useState<InspectionRequestFormValues>(
        inspectionRequestInitialValues,
    )
    const [errors, setErrors] = useState<InspectionRequestFormErrors>({})
    const [submittedRequest, setSubmittedRequest] =
        useState<InspectionRequest | null>(null)

    const createMutation = useCreateInspectionRequestMutation()

    const completedRequired = useMemo(() => {
        return ["companyName", "contactName", "location"].filter((field) => {
            const value = values[field as keyof InspectionRequestFormValues]
            return typeof value === "string" && value.trim().length > 0
        }).length
    }, [values])

    const serverError =
        createMutation.error instanceof Error ? createMutation.error.message : null

    function updateField<K extends keyof InspectionRequestFormValues>(
        field: K,
        value: InspectionRequestFormValues[K],
    ) {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }))

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const nextErrors = validateInspectionRequestForm(values)
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) {
            return
        }

        const result = await createMutation.mutateAsync({
            companyName: values.companyName.trim(),
            contactName: values.contactName.trim(),
            contactEmail: emptyToNull(values.contactEmail),
            contactPhone: emptyToNull(values.contactPhone),
            requestedDate: values.requestedDate || null,
            location: values.location.trim(),
            serviceType: emptyToNull(values.serviceType),
            equipmentType: emptyToNull(values.equipmentType),
            notes: emptyToNull(values.notes),
            status: "pending",
        })

        setSubmittedRequest(result)
        setValues(inspectionRequestInitialValues)
        setErrors({})
    }

    return (
        <div className="space-y-4">
            {submittedRequest ? (
                <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Solicitud registrada
                        </CardTitle>
                        <CardDescription className="text-emerald-700/80">
                            Se creó la solicitud #{submittedRequest.id} y quedó en estado
                            pendiente.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            {serverError ? (
                <Card className="border-destructive/30 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-destructive">
                            No se pudo registrar la solicitud
                        </CardTitle>
                        <CardDescription>{serverError}</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">Solicitar inspección</CardTitle>
                        <Badge variant="outline">{completedRequired}/3 obligatorios</Badge>
                    </div>
                    <CardDescription>
                        Completa los datos base para registrar la solicitud y dejarla lista
                        para programación operativa.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="companyName">Empresa</Label>
                            <Input
                                id="companyName"
                                value={values.companyName}
                                onChange={(event) =>
                                    updateField("companyName", event.target.value)
                                }
                                placeholder="Transportes del Norte S.A.C."
                                aria-invalid={Boolean(errors.companyName)}
                            />
                            {errors.companyName ? (
                                <p className="text-xs text-destructive">{errors.companyName}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contacto</Label>
                            <Input
                                id="contactName"
                                value={values.contactName}
                                onChange={(event) =>
                                    updateField("contactName", event.target.value)
                                }
                                placeholder="Carlos Ruiz"
                                aria-invalid={Boolean(errors.contactName)}
                            />
                            {errors.contactName ? (
                                <p className="text-xs text-destructive">{errors.contactName}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Teléfono</Label>
                            <Input
                                id="contactPhone"
                                value={values.contactPhone}
                                onChange={(event) =>
                                    updateField("contactPhone", event.target.value)
                                }
                                placeholder="999888777"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Correo</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={values.contactEmail}
                                onChange={(event) =>
                                    updateField("contactEmail", event.target.value)
                                }
                                placeholder="contacto@empresa.com"
                                aria-invalid={Boolean(errors.contactEmail)}
                            />
                            {errors.contactEmail ? (
                                <p className="text-xs text-destructive">{errors.contactEmail}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requestedDate">Fecha solicitada</Label>
                            <Input
                                id="requestedDate"
                                type="date"
                                value={values.requestedDate}
                                onChange={(event) =>
                                    updateField("requestedDate", event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input
                                id="location"
                                value={values.location}
                                onChange={(event) => updateField("location", event.target.value)}
                                placeholder="Trujillo, patio principal"
                                aria-invalid={Boolean(errors.location)}
                            />
                            {errors.location ? (
                                <p className="text-xs text-destructive">{errors.location}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Tipo de servicio</Label>
                            <Input
                                id="serviceType"
                                value={values.serviceType}
                                onChange={(event) =>
                                    updateField("serviceType", event.target.value)
                                }
                                placeholder="Inspección técnica"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="equipmentType">Tipo de equipo</Label>
                            <Input
                                id="equipmentType"
                                value={values.equipmentType}
                                onChange={(event) =>
                                    updateField("equipmentType", event.target.value)
                                }
                                placeholder="Semirremolque"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={values.notes}
                                onChange={(event) => updateField("notes", event.target.value)}
                                placeholder="Detalle breve de la necesidad o condiciones de atención."
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between gap-3 border-t pt-4">
                            <p className="text-xs text-muted-foreground">
                                La solicitud se registrará en estado pendiente.
                            </p>

                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {createMutation.isPending
                                    ? "Registrando..."
                                    : "Enviar solicitud"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}