import { useEffect, useMemo, useRef, useState } from "react"
import {
    Camera,
    Check,
    ExternalLink,
    FileImage,
    ImagePlus,
    Paperclip,
    ScanSearch,
    Upload,
} from "lucide-react"

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

import { resolveBackendFileUrl } from "@/lib/api"

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

const QUICK_CATEGORIES = [
    { value: "general", label: "General" },
    { value: "placa", label: "Placa" },
    { value: "serie", label: "Serie" },
    { value: "tablero", label: "Tablero" },
    { value: "daño", label: "Daño" },
    { value: "vin", label: "VIN" },
]

function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getSourceLabel(source: "camera" | "gallery" | "file" | null) {
    if (source === "camera") return "Capturada desde cámara"
    if (source === "gallery") return "Elegida desde galería"
    if (source === "file") return "Adjuntada como archivo"
    return "Sin selección"
}

function is_image_evidence(file_type?: string | null) {
    return Boolean(file_type?.toLowerCase().startsWith("image/"))
}

export function InspectionEvidencesTab({
                                           evidences,
                                           isUploading,
                                           uploadError,
                                           extractingEvidenceId,
                                           onUpload,
                                           onExtract,
                                       }: InspectionEvidencesTabProps) {
    const [file, setFile] = useState<File | null>(null)
    const [source, setSource] = useState<"camera" | "gallery" | "file" | null>(null)
    const [evidenceCategory, setEvidenceCategory] = useState("general")
    const [caption, setCaption] = useState("")
    const [axleNumber, setAxleNumber] = useState("")
    const [side, setSide] = useState("")
    const [isReference, setIsReference] = useState(false)

    const cameraInputRef = useRef<HTMLInputElement | null>(null)
    const imageInputRef = useRef<HTMLInputElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const previewUrl = useMemo(() => {
        if (!file || !file.type.startsWith("image/")) return null
        return URL.createObjectURL(file)
    }, [file])

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const orderedImageEvidences = useMemo(
        () =>
            [...evidences]
                .filter((item) => is_image_evidence(item.file_type))
                .sort((a, b) => b.id - a.id),
        [evidences],
    )

    const resetForm = () => {
        setFile(null)
        setSource(null)
        setEvidenceCategory("general")
        setCaption("")
        setAxleNumber("")
        setSide("")
        setIsReference(false)

        if (cameraInputRef.current) cameraInputRef.current.value = ""
        if (imageInputRef.current) imageInputRef.current.value = ""
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handlePickedFile = (
        nextFile: File | null,
        nextSource: "camera" | "gallery" | "file",
    ) => {
        if (!nextFile) return
        if (!nextFile.type.startsWith("image/")) return

        setFile(nextFile)
        setSource(nextSource)

        if (!caption.trim()) {
            if (nextSource === "camera") {
                setCaption("Foto capturada en inspección")
            } else if (nextFile.type.startsWith("image/")) {
                setCaption("Imagen de evidencia")
            } else {
                setCaption(nextFile.name)
            }
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!file) return

        const categoryValue = evidenceCategory.trim()

        await onUpload({
            file,
            evidence_category: categoryValue,
            caption: caption.trim() || null,
            raw_label: categoryValue || null,
            component_code: categoryValue || null,
            axle_number: axleNumber.trim() ? Number(axleNumber) : null,
            side: side || null,
            is_reference: isReference,
        })

        resetForm()
    }

    return (
        <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Cargar evidencia
                            </CardTitle>
                            <CardDescription>
                                Aquí solo se registran evidencias visuales.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <Camera className="h-4 w-4" />
                            Tomar foto
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <ImagePlus className="h-4 w-4" />
                            Elegir imagen
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="h-4 w-4" />
                            Adjuntar imagen
                        </Button>
                    </div>

                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(event) =>
                            handlePickedFile(event.target.files?.[0] ?? null, "camera")
                        }
                    />

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                            handlePickedFile(event.target.files?.[0] ?? null, "gallery")
                        }
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                            handlePickedFile(event.target.files?.[0] ?? null, "file")
                        }
                    />

                    <div className="rounded-xl border bg-muted/30 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Evidencia seleccionada
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {file ? file.name : "Aún no seleccionaste ninguna imagen"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {file
                                        ? `${file.type || "Tipo no disponible"} · ${formatFileSize(file.size)}`
                                        : "Usa la cámara o adjunta una imagen para continuar"}
                                </p>
                            </div>

                            <Badge variant={file ? "default" : "outline"}>
                                {getSourceLabel(source)}
                            </Badge>
                        </div>

                        {previewUrl ? (
                            <div className="mt-3 overflow-hidden rounded-lg border bg-background">
                                <img
                                    src={previewUrl}
                                    alt={caption || file?.name || "Vista previa de evidencia"}
                                    className="h-56 w-full object-cover"
                                />
                            </div>
                        ) : null}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Categoría rápida</Label>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_CATEGORIES.map((category) => {
                                    const isActive = evidenceCategory === category.value

                                    return (
                                        <Button
                                            key={category.value}
                                            type="button"
                                            size="sm"
                                            variant={isActive ? "default" : "outline"}
                                            onClick={() => setEvidenceCategory(category.value)}
                                        >
                                            {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                                            {category.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="evidence-category">Categoría</Label>
                                <Input
                                    id="evidence-category"
                                    value={evidenceCategory}
                                    onChange={(event) => setEvidenceCategory(event.target.value)}
                                    placeholder="placa, serie, tablero, daño, general"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evidence-caption">Descripción corta</Label>
                                <Input
                                    id="evidence-caption"
                                    value={caption}
                                    onChange={(event) => setCaption(event.target.value)}
                                    placeholder="Foto lateral del equipo"
                                />
                            </div>
                        </div>

                        <details className="rounded-xl border bg-muted/20 p-3">
                            <summary className="cursor-pointer text-sm font-medium">
                                Metadatos opcionales
                            </summary>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="evidence-axle-number">N° de eje</Label>
                                    <Input
                                        id="evidence-axle-number"
                                        type="number"
                                        min="1"
                                        value={axleNumber}
                                        onChange={(event) => setAxleNumber(event.target.value)}
                                        placeholder="1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="evidence-side">Lado</Label>
                                    <select
                                        id="evidence-side"
                                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                        value={side}
                                        onChange={(event) => setSide(event.target.value)}
                                    >
                                        <option value="">Sin lado</option>
                                        <option value="left">Izquierdo</option>
                                        <option value="right">Derecho</option>
                                        <option value="center">Centro</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="evidence-notes">Observación</Label>
                                    <Textarea
                                        id="evidence-notes"
                                        value={caption}
                                        onChange={(event) => setCaption(event.target.value)}
                                        placeholder="Describe brevemente la evidencia capturada"
                                        className="min-h-24"
                                    />
                                </div>

                                <div className="flex items-center gap-2 md:col-span-2">
                                    <input
                                        id="evidence-is-reference"
                                        type="checkbox"
                                        checked={isReference}
                                        onChange={(event) => setIsReference(event.target.checked)}
                                    />
                                    <Label htmlFor="evidence-is-reference">Es referencia</Label>
                                </div>
                            </div>
                        </details>

                        {uploadError ? (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                {uploadError}
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                disabled={isUploading}
                            >
                                Limpiar
                            </Button>

                            <Button type="submit" disabled={isUploading || !file}>
                                {isUploading ? "Subiendo..." : "Registrar evidencia"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {!orderedImageEvidences.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Todavía no hay evidencias visuales cargadas para esta inspección.
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
                {orderedImageEvidences.map((evidence) => {
                    const fileUrl = resolveBackendFileUrl(
                        evidence.file_url ?? evidence.file_path,
                    )

                    return (
                        <Card key={evidence.id} className="border-border/60 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">
                                            Evidencia #{evidence.id}
                                        </CardTitle>
                                        <CardDescription>
                                            {evidence.evidence_category}
                                        </CardDescription>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {evidence.is_reference ? (
                                            <Badge variant="secondary">Referencia</Badge>
                                        ) : null}

                                        <Badge variant={evidence.ocr_processed ? "default" : "outline"}>
                                            {evidence.ocr_processed ? "OCR procesado" : "OCR pendiente"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="overflow-hidden rounded-lg border bg-muted/20">
                                        <img
                                            src={fileUrl}
                                            alt={evidence.caption ?? `Evidencia ${evidence.id}`}
                                            className="h-52 w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground">
                                        <p>
                                            <span className="font-medium text-foreground">Tipo:</span>{" "}
                                            {evidence.file_type || "Sin dato"}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">Descripción:</span>{" "}
                                            {evidence.caption || "Sin descripción"}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">Lado:</span>{" "}
                                            {evidence.side || "Sin lado"}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">N° eje:</span>{" "}
                                            {evidence.axle_number ?? "Sin dato"}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">Confianza OCR:</span>{" "}
                                            {typeof evidence.ocr_confidence === "number"
                                                ? `${Math.round(evidence.ocr_confidence * 100)}%`
                                                : "Sin dato"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Texto OCR</Label>
                                    <Textarea
                                        readOnly
                                        value={evidence.ocr_extracted_text ?? ""}
                                        placeholder="El texto extraído por OCR aparecerá aquí."
                                        className="min-h-28"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onExtract(evidence.id)}
                                        disabled={extractingEvidenceId === evidence.id}
                                    >
                                        <ScanSearch className="h-4 w-4" />
                                        {extractingEvidenceId === evidence.id
                                            ? "Extrayendo OCR..."
                                            : "Extraer OCR"}
                                    </Button>

                                    <Button asChild variant="ghost">
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Abrir archivo
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileImage className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{evidence.file_path}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}