import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useAdminUsersQuery } from "@/features/admin/api/admin.queries"
import { useCreateInspectionMutation } from "@/features/inspections/api/inspections.queries"
import { useConvertInspectionRequestMutation } from "../api/inspection-requests.queries"
import type {
    ConversionFormErrors,
    ConversionFormValues,
    InspectionRequest,
} from "../types/inspection-request.types"
import {
    buildInitialConversionValues,
    validateConversionForm,
} from "../types/inspection-request.types"

interface ConvertRequestSheetProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    request: InspectionRequest | null
}

function emptyToNull(value?: string) {
    const normalized = value?.trim() ?? ""
    return normalized ? normalized : null
}

function ConvertRequestForm({
    request,
    onClose,
}: {
    request: InspectionRequest
    onClose: () => void
}) {
    const navigate = useNavigate()
    const createInspectionMutation = useCreateInspectionMutation()
    const convertInspectionRequestMutation = useConvertInspectionRequestMutation()
    const { data: inspectors = [] } = useAdminUsersQuery()

    const [formValues, setFormValues] = useState<ConversionFormValues>(() =>
        buildInitialConversionValues(request),
    )
    const [formErrors, setFormErrors] = useState<ConversionFormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    function updateField<K extends keyof ConversionFormValues>(
        field: K,
        value: ConversionFormValues[K],
    ) {
        setFormValues((prev) => ({ ...prev, [field]: value }))
        setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    const createError =
        createInspectionMutation.error instanceof Error
            ? createInspectionMutation.error.message
            : null

    const convertError =
        convertInspectionRequestMutation.error instanceof Error
            ? convertInspectionRequestMutation.error.message
            : null

    const serverError = createError ?? convertError
    const isPending =
        isSubmitting ||
        createInspectionMutation.isPending ||
        convertInspectionRequestMutation.isPending

    async function handleConvert(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const errors = validateConversionForm(formValues)
        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        setIsSubmitting(true)
        try {
            const createdInspection = await createInspectionMutation.mutateAsync({
                code: formValues.code.trim(),
                client_name: formValues.client_name.trim(),
                equipment_type: formValues.equipment_type.trim(),
                inspection_type: formValues.inspection_type.trim(),
                inspection_date: formValues.inspection_date,
                location: emptyToNull(formValues.location),
                requested_by: emptyToNull(formValues.requested_by),
                responsible_inspector_id: formValues.responsible_inspector_id
                    ? Number(formValues.responsible_inspector_id)
                    : null,
            })

            await convertInspectionRequestMutation.mutateAsync({
                inspectionRequestId: request.id,
                payload: {
                    inspection_id: createdInspection.id,
                    status: "converted",
                },
            })

            onClose()
            navigate(`/inspections/${createdInspection.id}`)
        } catch (_error) {
            // El error es manejado en createError/convertError y la limpieza de loading ocurre en finally
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleConvert} className="flex h-full flex-col gap-4 p-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium">{request.companyName}</p>
                <p className="text-muted-foreground">
                    Solicitud #{request.id} · {request.location}
                </p>
            </div>

            {serverError ? (
                <div className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                    {serverError}
                </div>
            ) : null}

            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                        id="code"
                        value={formValues.code}
                        onChange={(event) => updateField("code", event.target.value)}
                        placeholder="INSP-2026-001"
                        aria-invalid={Boolean(formErrors.code)}
                    />
                    {formErrors.code ? (
                        <p className="text-xs text-destructive">{formErrors.code}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="client_name">Cliente</Label>
                    <Input
                        id="client_name"
                        value={formValues.client_name}
                        onChange={(event) => updateField("client_name", event.target.value)}
                        aria-invalid={Boolean(formErrors.client_name)}
                    />
                    {formErrors.client_name ? (
                        <p className="text-xs text-destructive">{formErrors.client_name}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="inspection_type">Tipo de inspección</Label>
                    <Input
                        id="inspection_type"
                        value={formValues.inspection_type}
                        onChange={(event) => updateField("inspection_type", event.target.value)}
                        aria-invalid={Boolean(formErrors.inspection_type)}
                    />
                    {formErrors.inspection_type ? (
                        <p className="text-xs text-destructive">{formErrors.inspection_type}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="equipment_type">Tipo de equipo</Label>
                    <Input
                        id="equipment_type"
                        value={formValues.equipment_type}
                        onChange={(event) => updateField("equipment_type", event.target.value)}
                        aria-invalid={Boolean(formErrors.equipment_type)}
                    />
                    {formErrors.equipment_type ? (
                        <p className="text-xs text-destructive">{formErrors.equipment_type}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="inspection_date">Fecha programada</Label>
                    <Input
                        id="inspection_date"
                        type="date"
                        value={formValues.inspection_date}
                        onChange={(event) => updateField("inspection_date", event.target.value)}
                        aria-invalid={Boolean(formErrors.inspection_date)}
                    />
                    {formErrors.inspection_date ? (
                        <p className="text-xs text-destructive">{formErrors.inspection_date}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="responsible_inspector_id">Inspector responsable</Label>
                    <select
                        id="responsible_inspector_id"
                        value={formValues.responsible_inspector_id}
                        onChange={(event) =>
                            updateField("responsible_inspector_id", event.target.value)
                        }
                        aria-invalid={Boolean(formErrors.responsible_inspector_id)}
                        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value="">Selecciona un inspector</option>
                        {inspectors
                            .filter((u) => u.role === "inspector")
                            .map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                    {inspector.full_name}
                                </option>
                            ))}
                    </select>
                    {formErrors.responsible_inspector_id ? (
                        <p className="text-xs text-destructive">
                            {formErrors.responsible_inspector_id}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                        id="location"
                        value={formValues.location}
                        onChange={(event) => updateField("location", event.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requested_by">Solicitante</Label>
                    <Input
                        id="requested_by"
                        value={formValues.requested_by}
                        onChange={(event) => updateField("requested_by", event.target.value)}
                    />
                </div>
            </div>

            <SheetFooter className="mt-auto px-0">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Al convertir, la solicitud quedará en estado convertido.
                    </p>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="min-h-[44px]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Convirtiendo...
                            </>
                        ) : (
                            <>
                                <ClipboardList className="h-4 w-4" />
                                Crear inspección
                            </>
                        )}
                    </Button>
                </div>
            </SheetFooter>
        </form>
    )
}

export function ConvertRequestSheet({
    isOpen,
    onOpenChange,
    request,
}: ConvertRequestSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Convertir solicitud en inspección</SheetTitle>
                    <SheetDescription>
                        Completa los datos operativos mínimos para programar la inspección.
                    </SheetDescription>
                </SheetHeader>

                {request ? (
                    <ConvertRequestForm
                        key={request.id}
                        request={request}
                        onClose={() => onOpenChange(false)}
                    />
                ) : null}
            </SheetContent>
        </Sheet>
    )
}
