import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import {
    formatDateTime,
    getConfidenceLabel,
    getValidationBadgeVariant,
    getValidationLabel,
} from "@/features/inspections/utils/inspection-detail.utils"
import type { InspectionField } from "@/features/inspections/types/inspections.types"

type InspectionFieldsTabProps = {
    fields: InspectionField[]
}

export function InspectionFieldsTab({ fields }: InspectionFieldsTabProps) {
    if (fields.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No hay campos estructurados registrados para esta inspección.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {fields.map((field) => (
                <Card key={field.id}>
                    <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h3 className="font-semibold">{field.field_label}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {field.field_group} · {field.expected_type} · {field.field_key}
                                </p>
                            </div>

                            <Badge variant={getValidationBadgeVariant(field.validation_status)}>
                                {getValidationLabel(field.validation_status)}
                            </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Manual
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {field.manual_value || "Sin dato"}
                                </p>
                            </div>

                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    OCR
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {field.ocr_value || "Sin dato"}
                                </p>
                            </div>

                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Final
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {field.final_value || "Sin dato"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                Confianza:{" "}
                  {field.confidence != null
                      ? `${field.confidence} (${getConfidenceLabel(field.confidence)})`
                      : "No registrada"}
              </span>

                            <span>Actualizado: {formatDateTime(field.updated_at)}</span>
                        </div>

                        {field.validation_message ? (
                            <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                                {field.validation_message}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}