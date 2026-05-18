import { useState } from "react"
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import type {
    InspectionField,
    OcrValidationResponse,
} from "@/features/inspections/types/inspections.types"
import { useUpdateInspectionFieldMutation } from "../api/inspections.queries"

type InspectionFieldsTabProps = {
    inspectionId: number
    fields: InspectionField[]
    validation: OcrValidationResponse | null
    isValidating: boolean
    onValidate: () => void
}

function getValidationBadgeVariant(status: string) {
    switch (status?.toLowerCase()) {
        case "matched":
            return "default"
        case "mismatch":
            return "destructive"
        case "notfound":
            return "outline"
        default:
            return "secondary"
    }
}

export function InspectionFieldsTab({
                                        inspectionId,
                                        fields,
                                        validation,
                                        isValidating,
                                        onValidate,
                                    }: InspectionFieldsTabProps) {
    const [editingFieldId, setEditingFieldId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState<string>("")

    const updateFieldMutation = useUpdateInspectionFieldMutation(inspectionId)

    const matched =
        validation?.summary.matched ??
        fields.filter((field) => field.validation_status === "matched").length

    const mismatched =
        validation?.summary.mismatched ??
        fields.filter((field) => field.validation_status === "mismatch").length

    const pending =
        validation?.summary.not_found ??
        fields.filter(
            (field) =>
                field.validation_status !== "matched" &&
                field.validation_status !== "mismatch",
        ).length

    const handleStartEdit = (field: InspectionField) => {
        setEditingFieldId(field.id)
        setEditValue(field.final_value || field.ocr_value || field.manual_value || "")
    }

    const handleCancelEdit = () => {
        setEditingFieldId(null)
        setEditValue("")
    }

    const handleSaveEdit = (fieldId: number) => {
        updateFieldMutation.mutate(
            {
                fieldId,
                payload: { final_value: editValue },
            },
            {
                onSuccess: () => {
                    setEditingFieldId(null)
                    setEditValue("")
                },
            },
        )
    }

    if (!fields.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Aún no hay campos registrados para esta inspección.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:justify-between">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 flex-1 w-full">
                    <Card size="sm" className="border-border/60 shadow-sm w-full">
                        <CardHeader>
                            <CardDescription>Coinciden</CardDescription>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                {matched}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card size="sm" className="border-border/60 shadow-sm w-full">
                        <CardHeader>
                            <CardDescription>Observados</CardDescription>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-600" />
                                {mismatched}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card size="sm" className="border-border/60 shadow-sm w-full">
                        <CardHeader>
                            <CardDescription>Pendientes</CardDescription>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldQuestion className="h-4 w-4 text-amber-600" />
                                {pending}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Button onClick={onValidate} disabled={isValidating} className="shrink-0">
                    {isValidating ? "Validando OCR..." : "Ejecutar validación OCR"}
                </Button>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle>Campos estructurados</CardTitle>
                    <CardDescription>
                        Valores manuales, OCR y estado de validación por campo.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campo</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Manual</TableHead>
                                <TableHead>OCR</TableHead>
                                <TableHead>Final</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {fields.map((field) => (
                                <TableRow key={field.id}>
                                    <TableCell className="whitespace-normal">
                                        <div className="font-medium">{field.field_label}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {field.field_key}
                                        </div>
                                    </TableCell>
                                    <TableCell>{field.field_group}</TableCell>
                                    <TableCell>{field.manual_value || "—"}</TableCell>
                                    <TableCell>{field.ocr_value || "—"}</TableCell>
                                    <TableCell>
                                        {editingFieldId === field.id ? (
                                            <div className="flex items-center gap-1.5 min-w-[200px]">
                                                <Input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-2 text-xs"
                                                    onClick={() => handleSaveEdit(field.id)}
                                                    disabled={updateFieldMutation.isPending}
                                                >
                                                    Guardar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-2 min-w-[150px]">
                                                <span>{field.final_value || "—"}</span>
                                                {field.validation_status?.toLowerCase() !== "matched" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                        onClick={() => handleStartEdit(field)}
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Badge variant={getValidationBadgeVariant(field.validation_status)}>
                                                {field.validation_status}
                                            </Badge>
                                            {field.validation_message ? (
                                                <p className="max-w-56 whitespace-normal text-xs text-muted-foreground">
                                                    {field.validation_message}
                                                </p>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}