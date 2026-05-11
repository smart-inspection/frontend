import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { formatDateTime } from "@/features/inspections/utils/inspection-detail.utils"

type TranscriptionItem = {
    id: number
    model_name?: string | null
    language?: string | null
    processed?: boolean | null
    edited_manually?: boolean | null
    raw_text?: string | null
    final_text?: string | null
    confidence?: number | null
    created_at?: string | null
    updated_at?: string | null
}

type InspectionTranscriptionsTabProps = {
    transcriptions: TranscriptionItem[]
}

export function InspectionTranscriptionsTab({
                                                transcriptions,
                                            }: InspectionTranscriptionsTabProps) {
    if (transcriptions.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No hay transcripciones asociadas a esta inspección.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {transcriptions.map((item) => (
                <Card key={item.id}>
                    <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h3 className="font-semibold">Transcripción #{item.id}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.model_name || "Modelo no registrado"} ·{" "}
                                    {item.language || "Sin idioma"}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant={item.processed ? "default" : "secondary"}>
                                    {item.processed ? "Procesada" : "Pendiente"}
                                </Badge>

                                <Badge variant={item.edited_manually ? "outline" : "secondary"}>
                                    {item.edited_manually
                                        ? "Editada manualmente"
                                        : "Sin edición"}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Texto crudo
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                    {item.raw_text || "Sin contenido"}
                                </p>
                            </div>

                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Texto final
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                    {item.final_text || "Sin contenido"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                Confianza:{" "}
                  {item.confidence != null ? item.confidence : "No registrada"}
              </span>
                            <span>Creado: {formatDateTime(item.created_at)}</span>
                            <span>Actualizado: {formatDateTime(item.updated_at)}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}