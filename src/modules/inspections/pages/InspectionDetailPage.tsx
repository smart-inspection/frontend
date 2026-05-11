import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    FileAudio,
    FileSearch,
    FileText,
    Image as ImageIcon,
    Loader2,
    MapPin,
    ScanSearch,
    ShieldAlert,
    UserRound,
    Wrench,
} from "lucide-react"

import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "../types/inspections.utils"

import {
    useInspectionDetailQuery,
    useInspectionDraftsQuery,
    useInspectionEvidencesQuery,
    useInspectionFieldsQuery,
    useInspectionTranscriptionsQuery,
    useReportHistoryQuery,
    useReportStatusQuery,
    useValidateInspectionOcrMutation,
} from "../api/inspections.queries"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function formatDateTime(value?: string | null) {
    if (!value) return "No registrado"

    try {
        return new Intl.DateTimeFormat("es-PE", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value))
    } catch {
        return value
    }
}

function getConfidenceLabel(value?: number | null) {
    if (value == null) return "Sin confianza"

    if (value >= 90) return "Alta"
    if (value >= 70) return "Media"
    return "Baja"
}

function getValidationBadgeVariant(status?: string | null) {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "matched":
            return "default"
        case "mismatch":
            return "destructive"
        case "notfound":
            return "secondary"
        default:
            return "outline"
    }
}

function getValidationLabel(status?: string | null) {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "matched":
            return "Coincide"
        case "mismatch":
            return "No coincide"
        case "notfound":
            return "No encontrado"
        case "pending":
            return "Pendiente"
        case "not_evaluated":
        case "notevaluated":
            return "No evaluado"
        default:
            return status || "Sin validar"
    }
}

function isImageFile(fileType?: string | null) {
    return !!fileType?.toLowerCase().startsWith("image/")
}

function buildApiFileUrl(path?: string | null) {
    if (!path) return "#"
    if (path.startsWith("http://") || path.startsWith("https://")) return path

    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
    if (!base) return path

    return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

function buildReportExportUrl(type: "pdf" | "docx", draftId: number) {
    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
    return `${base}/report-export/${type}/${draftId}`
}

function DetailSkeleton() {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-3 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

function MetricCard({
                        label,
                        value,
                        hint,
                        icon: Icon,
                    }: {
    label: string
    value: string | number
    hint?: string
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export default function InspectionDetailPage() {
    const { inspectionId } = useParams()
    const parsedInspectionId = Number(inspectionId)

    const inspectionQuery = useInspectionDetailQuery(parsedInspectionId)
    const fieldsQuery = useInspectionFieldsQuery(parsedInspectionId)
    const evidencesQuery = useInspectionEvidencesQuery(parsedInspectionId)
    const transcriptionsQuery = useInspectionTranscriptionsQuery(parsedInspectionId)
    const draftsQuery = useInspectionDraftsQuery(parsedInspectionId)

    const validateOcrMutation = useValidateInspectionOcrMutation(parsedInspectionId)

    const inspection = inspectionQuery.data
    const fields = fieldsQuery.data ?? []
    const evidences = evidencesQuery.data ?? []
    const transcriptions = transcriptionsQuery.data ?? []
    const drafts = draftsQuery.data ?? []

    const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null)

    useEffect(() => {
        if (!selectedDraftId && drafts.length > 0) {
            setSelectedDraftId(drafts[0].id)
        }
    }, [drafts, selectedDraftId])

    const selectedDraft = useMemo(
        () => drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null,
        [drafts, selectedDraftId],
    )

    const reportStatusQuery = useReportStatusQuery(selectedDraft?.id ?? 0)

    const reportHistoryQuery = useReportHistoryQuery(selectedDraft?.id ?? 0)

    const isLoading =
        inspectionQuery.isLoading ||
        fieldsQuery.isLoading ||
        evidencesQuery.isLoading ||
        transcriptionsQuery.isLoading ||
        draftsQuery.isLoading

    const hasError =
        inspectionQuery.isError ||
        fieldsQuery.isError ||
        evidencesQuery.isError ||
        transcriptionsQuery.isError ||
        draftsQuery.isError

    const ocrResult = validateOcrMutation.data

    if (isLoading) {
        return (
            <section className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
                <DetailSkeleton />
            </section>
        )
    }

    if (hasError || !inspection) {
        return (
            <section className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
                <Card className="border-destructive/30">
                    <CardContent className="space-y-3 py-10 text-center">
                        <h1 className="text-lg font-semibold text-destructive">
                            No se pudo cargar el detalle de la inspección
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Verifica el identificador o la conexión con el backend.
                        </p>
                        <div className="flex justify-center">
                            <Button asChild variant="outline">
                                <Link to="/inspections">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver a inspecciones
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )
    }

    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:px-6">
            <header className="space-y-4">
                <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
                    <Link to="/inspections">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Inspección #{inspection.id}</Badge>
                                    <Badge variant={getInspectionStatusVariant(inspection.status)}>
                                        {formatInspectionStatus(inspection.status)}
                                    </Badge>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        {inspection.code}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {inspection.client_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>
                  {inspection.equipment_type} · {inspection.inspection_type}
                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>{formatInspectionDate(inspection.inspection_date)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{inspection.location || "Ubicación no registrada"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4" />
                                <span>
                  {inspection.responsible_inspector || "Inspector no asignado"}
                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Campos"
                            value={fields.length}
                            hint="Estructurados y validados"
                            icon={ClipboardCheck}
                        />
                        <MetricCard
                            label="Evidencias"
                            value={evidences.length}
                            hint="Imágenes o archivos"
                            icon={ImageIcon}
                        />
                        <MetricCard
                            label="Transcripciones"
                            value={transcriptions.length}
                            hint="Audio procesado"
                            icon={FileAudio}
                        />
                        <MetricCard
                            label="Informes"
                            value={drafts.length}
                            hint="Borradores disponibles"
                            icon={FileText}
                        />
                    </CardContent>
                </Card>
            </header>

            <Tabs defaultValue="summary" className="space-y-4">
                <div className="overflow-x-auto">
                    <TabsList className="inline-flex h-auto min-w-max gap-2 rounded-xl bg-muted p-1">
                        <TabsTrigger value="summary">Resumen</TabsTrigger>
                        <TabsTrigger value="fields">Campos</TabsTrigger>
                        <TabsTrigger value="evidences">Evidencias</TabsTrigger>
                        <TabsTrigger value="ocr">OCR</TabsTrigger>
                        <TabsTrigger value="transcriptions">Transcripciones</TabsTrigger>
                        <TabsTrigger value="reports">Informes</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="summary" className="space-y-4">
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
                                    {fields.length > 0 || evidences.length > 0 || drafts.length > 0
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
                                <p className="mt-2 text-2xl font-semibold">
                                    {fields.filter((item) => item.final_value).length}
                                </p>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm font-medium">Evidencias con OCR</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {evidences.filter((item) => item.ocr_processed).length}
                                </p>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm font-medium">Transcripciones procesadas</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {transcriptions.filter((item) => item.processed).length}
                                </p>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm font-medium">Borradores editados</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {drafts.filter((item) => item.edited_text).length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                    {fields.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No hay campos estructurados registrados para esta inspección.
                            </CardContent>
                        </Card>
                    ) : (
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
                    )}
                </TabsContent>

                <TabsContent value="evidences" className="space-y-4">
                    {evidences.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No hay evidencias registradas para esta inspección.
                            </CardContent>
                        </Card>
                    ) : (
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
                                                <Badge variant="outline">{evidence.evidence_category}</Badge>
                                                <Badge variant={evidence.ocr_processed ? "default" : "secondary"}>
                                                    {evidence.ocr_processed ? "OCR procesado" : "Sin OCR"}
                                                </Badge>
                                            </div>

                                            <p className="font-medium">
                                                {evidence.caption || "Sin descripción"}
                                            </p>

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p>Tipo: {evidence.file_type}</p>
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
                    )}
                </TabsContent>

                <TabsContent value="ocr" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-base">Validación OCR por inspección</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Ejecuta la consolidación OCR para comparar texto detectado contra los campos.
                                </p>
                            </div>

                            <Button
                                onClick={() => validateOcrMutation.mutate()}
                                disabled={validateOcrMutation.isPending}
                            >
                                {validateOcrMutation.isPending ? (
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
                            {!ocrResult ? (
                                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                                    Aún no se ha ejecutado la validación OCR desde esta vista.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        <MetricCard
                                            label="Evidencias procesadas"
                                            value={ocrResult.processed_evidences}
                                            icon={FileSearch}
                                        />
                                        <MetricCard
                                            label="Coincidencias"
                                            value={ocrResult.summary.matched}
                                            icon={CheckCircle2}
                                        />
                                        <MetricCard
                                            label="Discrepancias"
                                            value={ocrResult.summary.mismatched}
                                            icon={ShieldAlert}
                                        />
                                        <MetricCard
                                            label="No encontrados"
                                            value={ocrResult.summary.not_found}
                                            hint={
                                                ocrResult.summary.average_confidence != null
                                                    ? `Promedio: ${ocrResult.summary.average_confidence}`
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
                                                {ocrResult.aggregated_text || "Sin texto agregado"}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-3">
                                        {ocrResult.results.map((item: any) => (
                                            <Card key={item.field_id}>
                                                <CardContent className="space-y-3 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <p className="font-medium">{item.field_label}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.field_key}
                                                            </p>
                                                        </div>

                                                        <Badge variant={getValidationBadgeVariant(item.validation_status)}>
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
                </TabsContent>

                <TabsContent value="transcriptions" className="space-y-4">
                    {transcriptions.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No hay transcripciones asociadas a esta inspección.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {transcriptions.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <h3 className="font-semibold">Transcripción #{item.id}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.model_name} · {item.language || "Sin idioma"}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={item.processed ? "default" : "secondary"}>
                                                    {item.processed ? "Procesada" : "Pendiente"}
                                                </Badge>
                                                <Badge variant={item.edited_manually ? "outline" : "secondary"}>
                                                    {item.edited_manually ? "Editada manualmente" : "Sin edición"}
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
                    )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Borradores disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {drafts.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                                    No hay borradores generados todavía para esta inspección.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {drafts.map((draft) => (
                                        <Button
                                            key={draft.id}
                                            variant={selectedDraft?.id === draft.id ? "default" : "outline"}
                                            onClick={() => setSelectedDraftId(draft.id)}
                                        >
                                            Draft #{draft.id}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedDraft ? (
                        <>
                            <Card>
                                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <CardTitle className="text-base">{selectedDraft.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDraft.template_version} · {selectedDraft.status}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                window.open(
                                                    buildReportExportUrl("docx", selectedDraft.id),
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                )
                                            }
                                        >
                                            DOCX
                                        </Button>

                                        <Button
                                            onClick={() =>
                                                window.open(
                                                    buildReportExportUrl("pdf", selectedDraft.id),
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                )
                                            }
                                        >
                                            PDF
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Estado
                                        </p>
                                        <p className="mt-1 font-medium">{selectedDraft.status}</p>
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Generación
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {selectedDraft.generation_time_ms != null
                                                ? `${selectedDraft.generation_time_ms} ms`
                                                : "No registrado"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Creado
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatDateTime(selectedDraft.created_at)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Actualizado
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {formatDateTime(selectedDraft.updated_at)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Contenido del informe</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-[560px] overflow-auto rounded-xl border bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {selectedDraft.edited_text || selectedDraft.generated_text}
                      </pre>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Estado del reporte</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            {reportStatusQuery.isLoading ? (
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-4 w-52" />
                                                </div>
                                            ) : reportStatusQuery.data ? (
                                                <>
                                                    <div className="rounded-xl border p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Estado actual
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {reportStatusQuery.data.status}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Última acción
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {reportStatusQuery.data.last_action || "No registrada"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Fecha de estado
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {formatDateTime(reportStatusQuery.data.status_updated_at)}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-muted-foreground">
                                                    Sin información de estado.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Historial</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {reportHistoryQuery.isLoading ? (
                                                <div className="space-y-2">
                                                    <Skeleton className="h-16 w-full rounded-xl" />
                                                    <Skeleton className="h-16 w-full rounded-xl" />
                                                </div>
                                            ) : reportHistoryQuery.data?.length ? (
                                                reportHistoryQuery.data.map((log: any) => (
                                                    <div key={log.id} className="rounded-xl border p-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-sm font-medium">
                                                                {log.action || "Acción"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDateTime(log.created_at)}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {log.from_status || "—"} → {log.to_status || "—"}
                                                        </p>
                                                        {log.notes ? (
                                                            <p className="mt-2 text-sm text-muted-foreground">
                                                                {log.notes}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No hay eventos registrados para este borrador.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : null}
                </TabsContent>
            </Tabs>
        </section>
    )
}