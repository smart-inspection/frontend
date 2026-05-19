import {
    CheckCircle2,
    FileSearch,
    Loader2,
    ScanSearch,
    ShieldAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { InspectionMetricCard } from "@/features/inspections/components/inspection-metric-card"
import {
    getValidationBadgeVariant,
    getValidationLabel,
} from "@/features/inspections/utils/inspection-detail.utils"

type OcrResultItem = {
    field_id: number
    field_label?: string | null
    field_key?: string | null
    validation_status?: string | null
    manual_value?: string | null
    ocr_value?: string | null
    final_value?: string | null
    validation_message?: string | null
}

type OcrValidationResult = {
    processed_evidences: number
    aggregated_text?: string | null
    summary: {
        matched: number
        mismatched: number
        not_found: number
        average_confidence?: number | null
    }
    results: OcrResultItem[]
}

type OcrMutationLike = {
    mutate: () => void
    isPending: boolean
}

type InspectionOcrTabProps = {
    mutation: OcrMutationLike
    result?: OcrValidationResult | null
}

export function InspectionOcrTab({
                                     mutation,
                                     result,
                                 }: InspectionOcrTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="text-base">
                        Validación OCR por inspección
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Ejecuta la consolidación OCR para comparar texto detectado contra
                        los campos.
                    </p>
                </div>

                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Validando...
                        </>
                    ) : (
                        <>
                            <ScanSearch className="mr-2 h-4 w-4" />
                            Validar OCR
                        </>
                    )}
                </Button>
            </CardHeader>

            <CardContent>
                {!result ? (
                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                        Aún no se ha ejecutado la validación OCR desde esta vista.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <InspectionMetricCard
                                label="Evidencias procesadas"
                                value={result.processed_evidences}
                                icon={FileSearch}
                            />

                            <InspectionMetricCard
                                label="Coincidencias"
                                value={result.summary.matched}
                                icon={CheckCircle2}
                            />

                            <InspectionMetricCard
                                label="Discrepancias"
                                value={result.summary.mismatched}
                                icon={ShieldAlert}
                            />

                            <InspectionMetricCard
                                label="No encontrados"
                                value={result.summary.not_found}
                                hint={
                                    result.summary.average_confidence != null
                                        ? `Promedio: ${result.summary.average_confidence}`
                                        : "Sin promedio"
                                }
                                icon={ScanSearch}
                            />
                        </div>

                        <Card className="border-dashed">
                            <CardContent className="space-y-2 p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Texto agregado
                                </p>
                                <p className="max-h-52 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                                    {result.aggregated_text || "Sin texto agregado"}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            {result.results.map((item) => (
                                <Card key={item.field_id}>
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <p className="font-medium">
                                                    {item.field_label || "Campo"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.field_key || "Sin clave"}
                                                </p>
                                            </div>

                                            <Badge
                                                variant={getValidationBadgeVariant(
                                                    item.validation_status,
                                                )}
                                            >
                                                {getValidationLabel(item.validation_status)}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="rounded-xl border p-3">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Manual
                                                </p>
                                                <p className="mt-1 text-sm font-medium">
                                                    {item.manual_value || "Sin dato"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    OCR
                                                </p>
                                                <p className="mt-1 text-sm font-medium">
                                                    {item.ocr_value || "Sin dato"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Final
                                                </p>
                                                <p className="mt-1 text-sm font-medium">
                                                    {item.final_value || "Sin dato"}
                                                </p>
                                            </div>
                                        </div>

                                        {item.validation_message ? (
                                            <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                                                {item.validation_message}
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}