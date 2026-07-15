import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"

import { useCreateInspectionRequestMutation } from "../api/inspection-requests.queries"
import {
    equipment_type_options,
    inspectionRequestInitialValues,
    service_type_options,
    validateInspectionRequestForm,
    type EquipmentType,
    type InspectionRequest,
    type InspectionRequestFormErrors,
    type InspectionRequestFormValues,
    type ServiceType,
} from "../types/inspection-request.types"

function empty_to_null(value?: string): string | null {
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

    const completed_required = useMemo(() => {
        return [
            values.companyName,
            values.contactName,
            values.location,
            values.serviceType,
            values.equipmentType,
        ].filter((value) => value.trim().length > 0).length
    }, [values])

    const server_error =
        createMutation.error instanceof Error ? createMutation.error.message : null

    function sanitize_letters(value: string): string {
        return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
    }

    function sanitize_numbers(value: string): string {
        return value.replace(/\D/g, "")
    }

    function sanitize_text(value: string): string {
        return value
            .replace(/<[^>]*>/g, "")
            .replace(/javascript\s*:/gi, "")
            .replace(/on\w+\s*=/gi, "")
    }

    function update_field<K extends keyof InspectionRequestFormValues>(
        field: K,
        value: InspectionRequestFormValues[K],
    ) {
        let sanitized_value = value

        if (typeof value === "string") {
            if (field === "companyName" || field === "contactName") {
                sanitized_value = sanitize_letters(value) as InspectionRequestFormValues[K]
            } else if (field === "contactPhone") {
                sanitized_value = sanitize_numbers(value) as InspectionRequestFormValues[K]
            } else if (
                field === "contactEmail" ||
                field === "location" ||
                field === "notes"
            ) {
                sanitized_value = sanitize_text(value) as InspectionRequestFormValues[K]
            }
        }

        setValues((previous) => ({
            ...previous,
            [field]: sanitized_value,
        }))

        setErrors((previous) => ({
            ...previous,
            [field]: undefined,
        }))

        setSubmittedRequest(null)
    }

    async function handle_submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const next_errors = validateInspectionRequestForm(values)
        setErrors(next_errors)

        if (Object.keys(next_errors).length > 0) {
            return
        }

        try {
            const result = await createMutation.mutateAsync({
                companyName: values.companyName.trim(),
                contactName: values.contactName.trim(),
                contactEmail: empty_to_null(values.contactEmail),
                contactPhone: empty_to_null(values.contactPhone),
                requestedDate: values.requestedDate || null,
                location: values.location.trim(),
                serviceType: values.serviceType as ServiceType,
                equipmentType: values.equipmentType as EquipmentType,
                notes: empty_to_null(values.notes),
                status: "pending",
            })

            setSubmittedRequest(result)
            setValues(inspectionRequestInitialValues)
            setErrors({})
        } catch {
            return
        }
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

            {server_error ? (
                <Card className="border-destructive/30 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-destructive">
                            No se pudo registrar la solicitud
                        </CardTitle>
                        <CardDescription>{server_error}</CardDescription>
                    </CardHeader>
                </Card>
            ) : null}

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">Solicitar inspección</CardTitle>
                        <Badge variant="outline">
                            {completed_required}/5 obligatorios
                        </Badge>
                    </div>

                    <CardDescription>
                        Completa los datos base para registrar la solicitud y dejarla lista
                        para programación operativa.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        noValidate
                        onSubmit={handle_submit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="companyName">Empresa *</Label>
                            <Input
                                id="companyName"
                                value={values.companyName}
                                maxLength={150}
                                onChange={(event) =>
                                    update_field("companyName", event.target.value)
                                }
                                placeholder="Transportes del Norte S.A.C."
                                aria-invalid={Boolean(errors.companyName)}
                                aria-describedby={
                                    errors.companyName ? "companyName-error" : undefined
                                }
                            />
                            {errors.companyName ? (
                                <p id="companyName-error" className="text-xs text-destructive">
                                    {errors.companyName}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contacto *</Label>
                            <Input
                                id="contactName"
                                value={values.contactName}
                                maxLength={150}
                                onChange={(event) =>
                                    update_field("contactName", event.target.value)
                                }
                                placeholder="Carlos Ruiz"
                                aria-invalid={Boolean(errors.contactName)}
                                aria-describedby={
                                    errors.contactName ? "contactName-error" : undefined
                                }
                            />
                            {errors.contactName ? (
                                <p id="contactName-error" className="text-xs text-destructive">
                                    {errors.contactName}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Teléfono</Label>
                            <Input
                                id="contactPhone"
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={values.contactPhone}
                                maxLength={15}
                                onChange={(event) => update_field("contactPhone", event.target.value)}
                                placeholder="999888777"
                                aria-invalid={Boolean(errors.contactPhone)}
                                aria-describedby={errors.contactPhone ? "contactPhone-error" : undefined}
                            />
                            {errors.contactPhone ? (
                                <p
                                    id="contactPhone-error"
                                    className="text-xs text-destructive"
                                >
                                    {errors.contactPhone}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Correo</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={values.contactEmail}
                                maxLength={150}
                                onChange={(event) =>
                                    update_field("contactEmail", event.target.value)
                                }
                                placeholder="contacto@empresa.com"
                                aria-invalid={Boolean(errors.contactEmail)}
                                aria-describedby={
                                    errors.contactEmail ? "contactEmail-error" : undefined
                                }
                            />
                            {errors.contactEmail ? (
                                <p
                                    id="contactEmail-error"
                                    className="text-xs text-destructive"
                                >
                                    {errors.contactEmail}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requestedDate">Fecha solicitada</Label>
                            <Input
                                id="requestedDate"
                                type="date"
                                min={new Date().toISOString().slice(0, 10)}
                                value={values.requestedDate}
                                onChange={(event) =>
                                    update_field("requestedDate", event.target.value)
                                }
                                aria-invalid={Boolean(errors.requestedDate)}
                                aria-describedby={
                                    errors.requestedDate ? "requestedDate-error" : undefined
                                }
                            />
                            {errors.requestedDate ? (
                                <p
                                    id="requestedDate-error"
                                    className="text-xs text-destructive"
                                >
                                    {errors.requestedDate}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="location">Ubicación *</Label>
                            <Input
                                id="location"
                                value={values.location}
                                maxLength={200}
                                onChange={(event) =>
                                    update_field("location", event.target.value)
                                }
                                placeholder="Trujillo, patio principal"
                                aria-invalid={Boolean(errors.location)}
                                aria-describedby={errors.location ? "location-error" : undefined}
                            />
                            {errors.location ? (
                                <p id="location-error" className="text-xs text-destructive">
                                    {errors.location}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Tipo de servicio *</Label>
                            <select
                                id="serviceType"
                                value={values.serviceType}
                                onChange={(event) =>
                                    update_field("serviceType", event.target.value)
                                }
                                aria-invalid={Boolean(errors.serviceType)}
                                aria-describedby={
                                    errors.serviceType ? "serviceType-error" : undefined
                                }
                                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                            >
                                <option value="">Selecciona un servicio</option>
                                {service_type_options.map((service_type) => (
                                    <option key={service_type} value={service_type}>
                                        {service_type}
                                    </option>
                                ))}
                            </select>
                            {errors.serviceType ? (
                                <p id="serviceType-error" className="text-xs text-destructive">
                                    {errors.serviceType}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="equipmentType">Tipo de equipo *</Label>
                            <select
                                id="equipmentType"
                                value={values.equipmentType}
                                onChange={(event) =>
                                    update_field("equipmentType", event.target.value)
                                }
                                aria-invalid={Boolean(errors.equipmentType)}
                                aria-describedby={
                                    errors.equipmentType ? "equipmentType-error" : undefined
                                }
                                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                            >
                                <option value="">Selecciona un equipo</option>
                                {equipment_type_options.map((equipment_type) => (
                                    <option key={equipment_type} value={equipment_type}>
                                        {equipment_type}
                                    </option>
                                ))}
                            </select>
                            {errors.equipmentType ? (
                                <p
                                    id="equipmentType-error"
                                    className="text-xs text-destructive"
                                >
                                    {errors.equipmentType}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={values.notes}
                                maxLength={5000}
                                onChange={(event) => update_field("notes", event.target.value)}
                                placeholder="Detalle breve de la necesidad o condiciones de atención."
                                aria-invalid={Boolean(errors.notes)}
                                aria-describedby={errors.notes ? "notes-error" : undefined}
                            />
                            {errors.notes ? (
                                <p id="notes-error" className="text-xs text-destructive">
                                    {errors.notes}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t pt-4 md:col-span-2">
                            <p className="text-xs text-muted-foreground">
                                Los campos marcados con * son obligatorios. La solicitud se
                                registrará en estado pendiente.
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