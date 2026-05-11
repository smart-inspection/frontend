import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { formatDateTime } from "@/features/inspections/utils/inspection-detail.utils"
import type {
    Inspection,
    ReportDraft,
    Evidence,
    InspectionField,
    Transcription,
} from "@/features/inspections/types/inspections.types"

type InspectionSummaryTabProps = {
    inspection: Inspection
    fields: InspectionField[]
    evidences: Evidence[]
    transcriptions: Transcription[]
    drafts: ReportDraft[]
}

export function InspectionSummaryTab({
                                         inspection,
                                         fields,
                                         evidences,
                                         transcriptions,
                                         drafts,
                                     }: InspectionSummaryTabProps) {
    const hasRelatedData =
        fields.length > 0 || evidences.length > 0 || drafts.length > 0

    const fieldsWithFinalValue = fields.filter((item) => item.final_value).length
    const evidencesWithOcr = evidences.filter((item) => item.ocr_processed).length
    const processedTranscriptions = transcriptions.filter(
        (item) => item.processed,
    ).length
    const editedDrafts = drafts.filter((item) => item.edited_text).length

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ficha general</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Solicitado por
                        </p>
                        <p className="mt-1 font-medium">
                            {inspection.requested_by || "No registrado"}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Última actualización
                        </p>
                        <p className="mt-1 font-medium">
                            {formatDateTime(inspection.updated_at)}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Fecha de creación
                        </p>
                        <p className="mt-1 font-medium">
                            {formatDateTime(inspection.created_at)}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Estado del módulo
                        </p>
                        <p className="mt-1 font-medium">
                            {hasRelatedData
                                ? "Con información asociada"
                                : "Aún sin insumos relacionados"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Actividad asociada</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-medium">Campos con valor final</p>
                        <p className="mt-2 text-2xl font-semibold">{fieldsWithFinalValue}</p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-medium">Evidencias con OCR</p>
                        <p className="mt-2 text-2xl font-semibold">{evidencesWithOcr}</p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-medium">Transcripciones procesadas</p>
                        <p className="mt-2 text-2xl font-semibold">
                            {processedTranscriptions}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-medium">Borradores editados</p>
                        <p className="mt-2 text-2xl font-semibold">{editedDrafts}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}