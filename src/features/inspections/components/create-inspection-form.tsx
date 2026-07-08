import { useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardPlus, Save, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAdminUsersQuery } from "@/features/admin/api/admin.queries"

import {
    createInspectionInitialValues,
    type CreateInspectionFormErrors,
    type CreateInspectionFormValues,
    validateCreateInspection,
    CODE_MAX_LENGTH,
    CLIENT_NAME_MAX_LENGTH,
    EQUIPMENT_TYPE_MAX_LENGTH,
    INSPECTION_TYPE_MAX_LENGTH,
    LOCATION_MAX_LENGTH,
    REQUESTED_BY_MAX_LENGTH,
    RESPONSIBLE_INSPECTOR_MAX_LENGTH,
    inspection_date_bounds,
} from "../types/create-inspection.types"

type CreateInspectionFormProps = {
    onSubmit: (values: CreateInspectionFormValues) => Promise<void> | void
    isPending?: boolean
    serverError?: string | null
}

const requiredFields: Array<keyof CreateInspectionFormValues> = [
    "code",
    "client_name",
    "equipment_type",
    "inspection_type",
    "inspection_date",
]

function emptyToNull(value?: string | null): string | null {
    const normalized = value?.trim() ?? ""
    return normalized ? normalized : null
}

export function CreateInspectionForm({
                                         onSubmit,
                                         isPending = false,
                                         serverError,
                                     }: CreateInspectionFormProps) {
    const [values, setValues] = useState<CreateInspectionFormValues>(
        createInspectionInitialValues,
    )
    const [errors, setErrors] = useState<CreateInspectionFormErrors>({})

    const { data: admin_users } = useAdminUsersQuery()
    const inspector_options = (admin_users ?? []).filter(
        (user) => user.role === "inspector",
    )

    const completedRequired = requiredFields.filter((field) => {
        const value = values[field]
        return typeof value === "string" ? value.trim().length > 0 : false
    }).length

    const updateField = <K extends keyof CreateInspectionFormValues>(
        field: K,
        value: CreateInspectionFormValues[K],
    ) => {
        setValues((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextErrors = validateCreateInspection(values)
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) {
            return
        }

        await onSubmit({
            code: values.code.trim(),
            client_name: values.client_name.trim(),
            equipment_type: values.equipment_type.trim(),
            inspection_type: values.inspection_type.trim(),
            inspection_date: values.inspection_date,
            location: emptyToNull(values.location),
            requested_by: emptyToNull(values.requested_by),
            responsible_inspector: emptyToNull(values.responsible_inspector),
        })
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
            <div className="space-y-6">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardPlus className="h-4 w-4" />
                            Datos principales
                        </CardTitle>
                        <CardDescription>
                            Completa la información base que el backend ya requiere para registrar una inspección.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="code">Código</Label>
                            <Input
                                id="code"
                                value={values.code}
                                maxLength={CODE_MAX_LENGTH}
                                onChange={(e) => updateField("code", e.target.value)}
                                placeholder="INSP-2026-001"
                                aria-invalid={Boolean(errors.code)}
                            />
                            {errors.code ? (
                                <p className="text-xs text-destructive">{errors.code}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="client_name">Cliente</Label>
                            <Input
                                id="client_name"
                                value={values.client_name}
                                maxLength={CLIENT_NAME_MAX_LENGTH}
                                onChange={(e) => updateField("client_name", e.target.value)}
                                placeholder="Transportes del Norte S.A.C."
                                aria-invalid={Boolean(errors.client_name)}
                            />
                            {errors.client_name ? (
                                <p className="text-xs text-destructive">{errors.client_name}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="equipment_type">Tipo de equipo</Label>
                            <Input
                                id="equipment_type"
                                value={values.equipment_type}
                                maxLength={EQUIPMENT_TYPE_MAX_LENGTH}
                                onChange={(e) => updateField("equipment_type", e.target.value)}
                                placeholder="Semirremolque"
                                aria-invalid={Boolean(errors.equipment_type)}
                            />
                            {errors.equipment_type ? (
                                <p className="text-xs text-destructive">{errors.equipment_type}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inspection_type">Tipo de inspección</Label>
                            <Input
                                id="inspection_type"
                                value={values.inspection_type}
                                maxLength={INSPECTION_TYPE_MAX_LENGTH}
                                onChange={(e) => updateField("inspection_type", e.target.value)}
                                placeholder="Inspección visual"
                                aria-invalid={Boolean(errors.inspection_type)}
                            />
                            {errors.inspection_type ? (
                                <p className="text-xs text-destructive">{errors.inspection_type}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inspection_date">Fecha de inspección</Label>
                            <Input
                                id="inspection_date"
                                type="date"
                                min={inspection_date_bounds.min}
                                max={inspection_date_bounds.max}
                                value={values.inspection_date}
                                onChange={(e) => updateField("inspection_date", e.target.value)}
                                aria-invalid={Boolean(errors.inspection_date)}
                            />
                            {errors.inspection_date ? (
                                <p className="text-xs text-destructive">{errors.inspection_date}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input
                                id="location"
                                value={values.location ?? ""}
                                maxLength={LOCATION_MAX_LENGTH}
                                onChange={(e) => updateField("location", e.target.value)}
                                placeholder="Trujillo, La Libertad"
                                aria-invalid={Boolean(errors.location)}
                            />
                            {errors.location ? (
                                <p className="text-xs text-destructive">{errors.location}</p>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Datos complementarios</CardTitle>
                        <CardDescription>
                            Estos campos son opcionales, pero ayudan a dejar lista la cabecera del detalle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="requested_by">Solicitado por</Label>
                            <Input
                                id="requested_by"
                                value={values.requested_by ?? ""}
                                maxLength={REQUESTED_BY_MAX_LENGTH}
                                onChange={(e) => updateField("requested_by", e.target.value)}
                                placeholder="Área de operaciones"
                                aria-invalid={Boolean(errors.requested_by)}
                            />
                            {errors.requested_by ? (
                                <p className="text-xs text-destructive">{errors.requested_by}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="responsible_inspector">Inspector responsable</Label>
                            {inspector_options.length > 0 ? (
                                <select
                                    id="responsible_inspector"
                                    value={values.responsible_inspector ?? ""}
                                    onChange={(e) =>
                                        updateField("responsible_inspector", e.target.value)
                                    }
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="">Selecciona un inspector</option>
                                    {inspector_options.map((inspector) => (
                                        <option key={inspector.id} value={inspector.full_name}>
                                            {inspector.full_name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    id="responsible_inspector"
                                    value={values.responsible_inspector ?? ""}
                                    maxLength={RESPONSIBLE_INSPECTOR_MAX_LENGTH}
                                    onChange={(e) =>
                                        updateField("responsible_inspector", e.target.value)
                                    }
                                    placeholder="Ing. Juan Pérez"
                                    aria-invalid={Boolean(errors.responsible_inspector)}
                                />
                            )}
                            {errors.responsible_inspector ? (
                                <p className="text-xs text-destructive">
                                    {errors.responsible_inspector}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Resumen
                        </CardTitle>
                        <CardDescription>
                            La inspección se creará en estado inicial de borrador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">Estado inicial</span>
                            <Badge variant="secondary">Borrador</Badge>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Campos obligatorios</p>
                            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                {completedRequired} de {requiredFields.length} completos
                            </div>
                        </div>
                        {serverError ? (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                {serverError}
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                            <Link to="/inspections">Cancelar</Link>
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                            <Save className="h-4 w-4" />
                            {isPending ? "Guardando..." : "Guardar inspección"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    )
}