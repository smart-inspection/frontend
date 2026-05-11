import { useState } from "react"
import { ExternalLink, FileImage, FileText, ScanSearch, Upload } from "lucide-react"

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

import type {
    Evidence,
    EvidenceCreateInput,
} from "@/features/inspections/types/inspections.types"

type InspectionEvidencesTabProps = {
    evidences: Evidence[]
    isUploading: boolean
    uploadError?: string | null
    runningEvidenceId: number | null
    extractingEvidenceId: number | null
    onUpload: (payload: EvidenceCreateInput) => Promise<void> | void
    onRunOcr: (evidenceId: number) => Promise<void> | void
    onExtract: (evidenceId: number) => Promise<void> | void
}

export function InspectionEvidencesTab({
                                           evidences,
                                           isUploading,
                                           uploadError,
                                           runningEvidenceId,
                                           extractingEvidenceId,
                                           onUpload,
                                           onRunOcr,
                                           onExtract,
                                       }: InspectionEvidencesTabProps) {
    const [file, setFile] = useState<File | null>(null)
    const [evidenceCategory, setEvidenceCategory] = useState("general")
    const [caption, setCaption] = useState("")

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!file) return

        await onUpload({
            file,
            evidence_category: evidenceCategory.trim(),
            caption: caption.trim() || null,
        })

        setFile(null)
        setCaption("")
        setEvidenceCategory("general")
    }

    return (
        <div className="space-y-5">
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Cargar evidencia
                    </CardTitle>
                    <CardDescription>
                        Sube una imagen o archivo para asociarlo a esta inspección.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="evidence-file">Archivo</Label>
                            <Input
                                id="evidence-file"
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence-category">Categoría</Label>
                            <Input
                                id="evidence-category"
                                value={evidenceCategory}
                                onChange={(e) => setEvidenceCategory(e.target.value)}
                                placeholder="placa, serie, tablero, daño, general"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence-caption">Descripción corta</Label>
                            <Input
                                id="evidence-caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Foto lateral del equipo"
                            />
                        </div>

                        {uploadError ? (
                            <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                {uploadError}
                            </div>
                        ) : null}

                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" disabled={isUploading || !file}>
                                {isUploading ? "Subiendo..." : "Registrar evidencia"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {!evidences.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Todavía no hay evidencias cargadas para esta inspección.
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
                {evidences.map((evidence) => {
                    const isImage = evidence.file_type?.startsWith("image/")

                    return (
                        <Card key={evidence.id} className="border-border/60 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">
                                            Evidencia #{evidence.id}
                                        </CardTitle>
                                        <CardDescription>
                                            {evidence.evidence_category}
                                        </CardDescription>
                                    </div>

                                    <Badge variant={evidence.ocr_processed ? "default" : "outline"}>
                                        {evidence.ocr_processed ? "OCR procesado" : "OCR pendiente"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {isImage ? (
                                    <div className="overflow-hidden rounded-lg border bg-muted/20">
                                        <img
                                            src={evidence.file_url}
                                            alt={evidence.caption || `Evidencia ${evidence.id}`}
                                            className="h-52 w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
                                        Vista previa no disponible
                                    </div>
                                )}

                                <div className="grid gap-2 text-sm text-muted-foreground">
                                    <p>
                                        <span className="font-medium text-foreground">Tipo:</span>{" "}
                                        {evidence.file_type}
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">Descripción:</span>{" "}
                                        {evidence.caption || "Sin descripción"}
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">Confianza OCR:</span>{" "}
                                        {typeof evidence.ocr_confidence === "number"
                                            ? `${Math.round(evidence.ocr_confidence * 100)}%`
                                            : "Sin dato"}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Texto OCR</Label>
                                    <Textarea
                                        readOnly
                                        value={evidence.ocr_extracted_text || ""}
                                        placeholder="El texto extraído por OCR aparecerá aquí."
                                        className="min-h-28"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onRunOcr(evidence.id)}
                                        disabled={runningEvidenceId === evidence.id}
                                    >
                                        <ScanSearch className="h-4 w-4" />
                                        {runningEvidenceId === evidence.id
                                            ? "Procesando OCR..."
                                            : "Ejecutar OCR"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onExtract(evidence.id)}
                                        disabled={extractingEvidenceId === evidence.id}
                                    >
                                        {extractingEvidenceId === evidence.id
                                            ? "Extrayendo..."
                                            : "Extraer texto"}
                                    </Button>

                                    <Button asChild variant="ghost">
                                        <a
                                            href={evidence.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Abrir archivo
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {isImage ? (
                                        <FileImage className="h-4 w-4" />
                                    ) : (
                                        <FileText className="h-4 w-4" />
                                    )}
                                    <span>{evidence.file_path}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}