import { FileSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import {
    buildApiFileUrl,
    formatDateTime,
    isImageFile,
} from "@/features/inspections/utils/inspection-detail.utils"

type EvidenceItem = {
    id: number
    file_type?: string | null
    file_url?: string | null
    caption?: string | null
    evidence_category?: string | null
    ocr_processed?: boolean | null
    uploaded_at?: string | null
    ocr_confidence?: number | null
    ocr_extracted_text?: string | null
}

type InspectionEvidencesTabProps = {
    evidences: EvidenceItem[]
}

export function InspectionEvidencesTab({
                                           evidences,
                                       }: InspectionEvidencesTabProps) {
    if (evidences.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No hay evidencias registradas para esta inspección.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {evidences.map((evidence) => (
                <Card key={evidence.id} className="overflow-hidden">
                    <CardContent className="space-y-4 p-4">
                        {isImageFile(evidence.file_type) ? (
                            <div className="overflow-hidden rounded-xl border bg-muted">
                                <img
                                    src={buildApiFileUrl(evidence.file_url)}
                                    alt={evidence.caption || `Evidencia ${evidence.id}`}
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
                                <div className="text-center text-sm text-muted-foreground">
                                    <FileSearch className="mx-auto mb-2 h-6 w-6" />
                                    Archivo no visualizable
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {evidence.evidence_category || "Sin categoría"}
                                </Badge>

                                <Badge
                                    variant={evidence.ocr_processed ? "default" : "secondary"}
                                >
                                    {evidence.ocr_processed ? "OCR procesado" : "Sin OCR"}
                                </Badge>
                            </div>

                            <p className="font-medium">
                                {evidence.caption || "Sin descripción"}
                            </p>

                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Tipo: {evidence.file_type || "No registrado"}</p>
                                <p>Subido: {formatDateTime(evidence.uploaded_at)}</p>
                                <p>
                                    Confianza OCR:{" "}
                                    {evidence.ocr_confidence != null
                                        ? `${evidence.ocr_confidence}`
                                        : "No registrada"}
                                </p>
                            </div>
                        </div>

                        {evidence.ocr_extracted_text ? (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Texto extraído
                                    </p>
                                    <p className="line-clamp-6 text-sm text-muted-foreground">
                                        {evidence.ocr_extracted_text}
                                    </p>
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}