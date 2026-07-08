import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    FolderOpen,
    Languages,
    PlayCircle,
    ShieldCheck,
    UserRound,
    Wrench,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {
    useCreateInspectionEvidenceMutation,
    useCreateInspectionFieldMutation,
    useCreateTranscriptionMutation,
    useExtractEvidenceOcrMutation,
    useGenerateLlmReportDraftMutation,
    useGenerateReportDraftMutation,
    useInspectionDetailQuery,
    useInspectionDraftsQuery,
    useInspectionEvidencesQuery,
    useInspectionFieldsQuery,
    useInspectionTranscriptionsQuery,
    useProductivityByInspectionQuery,
    useReportHistoryQuery,
    useReportStatusQuery,
    useRunEvidenceOcrMutation,
    useStartProductivityMutation,
    useUpdateReportDraftMutation,
    useUpdateReportStatusMutation,
    useUpdateTranscriptionMutation,
    useValidateInspectionOcrMutation,
} from "@/features/inspections/api/inspections.queries"

import { InspectionDraftsTab } from "../components/inspection-drafts-tab"
import { InspectionEvidencesTab } from "../components/inspection-evidences-tab"
import { InspectionFieldsTab } from "../components/inspection-fields-tab"
import { InspectionTranscriptionsTab } from "../components/inspection-transcriptions-tab"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "../types/inspections.utils"
import type {
    EvidenceCreateInput,
    TranscriptionCreateInput,
} from "../types/inspections.types"
import { InspectionReportsTab } from "@/features/inspections/components/inspection-reports-tab"
import {InspectionDetailHeader} from "@/features/inspections/components/inspection-detail-header";
import {apiPatch} from "@/lib/api";

function InspectionDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="border-border/60 shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-28" />
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-8 w-96 max-w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function InspectionDetailPage() {
    const { inspectionId: inspectionIdParam } = useParams()
    const inspectionId = Number(inspectionIdParam)

    const [runningEvidenceId, setRunningEvidenceId] = useState<number | null>(null)
    const [extractingEvidenceId, setExtractingEvidenceId] = useState<number | null>(null)
    const [savingTranscriptionId, setSavingTranscriptionId] = useState<number | null>(null)
    const [savingDraftId, setSavingDraftId] = useState<number | null>(null)
    const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null)

    const isInvalidInspectionId = !Number.isFinite(inspectionId) || inspectionId <= 0

    const inspectionQuery = useInspectionDetailQuery(inspectionId)
    const fieldsQuery = useInspectionFieldsQuery(inspectionId)
    const evidencesQuery = useInspectionEvidencesQuery(inspectionId)
    const transcriptionsQuery = useInspectionTranscriptionsQuery(inspectionId)
    const draftsQuery = useInspectionDraftsQuery(inspectionId)

    const validateOcrMutation = useValidateInspectionOcrMutation(inspectionId)
    const createEvidenceMutation = useCreateInspectionEvidenceMutation(inspectionId)
    const runEvidenceOcrMutation = useRunEvidenceOcrMutation(inspectionId)
    const extractEvidenceOcrMutation = useExtractEvidenceOcrMutation(inspectionId)

    const createTranscriptionMutation = useCreateTranscriptionMutation(inspectionId)
    const updateTranscriptionMutation = useUpdateTranscriptionMutation(inspectionId)

    const generateDraftMutation = useGenerateReportDraftMutation(inspectionId)
    const generateLlmDraftMutation = useGenerateLlmReportDraftMutation(inspectionId)
    const updateDraftMutation = useUpdateReportDraftMutation(inspectionId)

    const createFieldMutation = useCreateInspectionFieldMutation(inspectionId)

    const startProductivityMutation = useStartProductivityMutation(inspectionId)

    const productivity_query = useProductivityByInspectionQuery(inspectionId)

    if (isInvalidInspectionId) {
        return (
            <section className="space-y-5">
                <Card className="border-destructive/30">
                    <CardContent className="py-10 text-center">
                        <h2 className="text-lg font-semibold">Inspección no válida</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            El identificador recibido en la URL no es correcto.
                        </p>
                        <div className="mt-4">
                            <Button asChild variant="outline">
                                <Link to="/inspections">Volver al listado</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )
    }

    const fields = fieldsQuery.data ?? []
    const evidences = evidencesQuery.data ?? []
    const transcriptions = transcriptionsQuery.data ?? []
    const drafts = draftsQuery.data ?? []

    const REPORT_GOAL_MINUTES = 20

    const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null)
    const [optimisticStartedAt, setOptimisticStartedAt] = useState<string | null>(null)
    const [optimisticFinishedAt, setOptimisticFinishedAt] = useState<string | null>(null)
    const [productivity_started_at, set_productivity_started_at] = useState<string | null>(null)
    const [productivity_finished_at, set_productivity_finished_at] = useState<string | null>(null)

    const selectedDraft =
        drafts.find((draft) => draft.id === selectedDraftId) ??
        drafts[0] ??
        null

    const active_draft_id = selectedDraft?.id ?? 0
    const reportStatusQuery = useReportStatusQuery(active_draft_id)
    const reportHistoryQuery = useReportHistoryQuery(active_draft_id, 20)
    const updateReportStatusMutation = useUpdateReportStatusMutation(
        active_draft_id,
        inspectionId,
    )

    const reportStatus = reportStatusQuery.data ?? null
    const reportHistory = reportHistoryQuery.data ?? []

    const currentReportStatus = (
        optimisticStatus ??
        reportStatus?.status ??
        selectedDraft?.status ??
        (productivity_finished_at || productivity_query.data?.report_finished_at
            ? "finalized"
            : productivity_started_at || productivity_query.data?.report_started_at
                ? "in_review"
                : null) ??
        "draft"
    ).toLowerCase()

    const visualReportStatus =
        optimisticStatus || reportStatus?.status || selectedDraft?.status || "draft"

    const reportStartedAt =
        optimisticStartedAt ??
        reportHistory.find((item) => item.to_status?.toLowerCase() === "in_review")?.created_at ??
        productivity_started_at ??
        null

    const reportFinishedAt =
        optimisticFinishedAt ??
        reportHistory.find((item) => item.to_status?.toLowerCase() === "finalized")?.created_at ??
        productivity_query.data?.report_finished_at ??
        productivity_finished_at ??
        null

    const reportDurationMinutes =
        reportStartedAt && reportFinishedAt
            ? Math.max(
                0,
                Math.round(
                    (new Date(reportFinishedAt).getTime() -
                        new Date(reportStartedAt).getTime()) /
                    60000,
                ),
            )
            : null
    const [liveElapsedMs, setLiveElapsedMs] = useState(0)

    useEffect(() => {
        if (currentReportStatus !== "in_review" || !reportStartedAt || reportFinishedAt) {
            setLiveElapsedMs(0)
            return
        }

        const updateElapsed = () => {
            setLiveElapsedMs(
                Math.max(0, new Date().getTime() - new Date(reportStartedAt).getTime()),
            )
        }

        updateElapsed()
        const intervalId = window.setInterval(updateElapsed, 1000)

        return () => window.clearInterval(intervalId)
    }, [currentReportStatus, reportStartedAt, reportFinishedAt])

    const liveElapsedMinutes = Math.max(0, Math.floor(liveElapsedMs / 60000))
    const liveElapsedSeconds = Math.max(0, Math.floor((liveElapsedMs % 60000) / 1000))

    const liveElapsedLabel =
        currentReportStatus === "in_review" && reportStartedAt && !reportFinishedAt
            ? `${String(liveElapsedMinutes).padStart(2, "0")}:${String(
                liveElapsedSeconds,
            ).padStart(2, "0")}`
            : null

    const isOverGoal =
        currentReportStatus === "in_review"
            ? liveElapsedMs > REPORT_GOAL_MINUTES * 60 * 1000
            : reportDurationMinutes !== null && reportDurationMinutes > REPORT_GOAL_MINUTES

    const isStartingReport =
        startProductivityMutation.isPending || updateReportStatusMutation.isPending

    const is_in_review = currentReportStatus === "in_review"

    const canStartReport =
        inspectionId > 0 &&
        !isStartingReport &&
        !is_in_review &&
        currentReportStatus !== "finalized"

    const canFinishReport =
        !isStartingReport &&
        is_in_review

    useEffect(() => {
        if (!drafts.length) {
            setSelectedDraftId(null)
            return
        }

        const stillExists = drafts.some((draft) => draft.id === selectedDraftId)

        if (!selectedDraftId || !stillExists) {
            setSelectedDraftId(drafts[0].id)
        }
    }, [drafts, selectedDraftId])

    useEffect(() => {
        const server_started = productivity_query.data?.report_started_at ?? null
        const server_finished = productivity_query.data?.report_finished_at ?? null

        if (server_started && !productivity_started_at) {
            set_productivity_started_at(server_started)
        }
        if (server_finished && !productivity_finished_at) {
            set_productivity_finished_at(server_finished)
        }
    }, [productivity_query.data])

    if (inspectionQuery.isLoading) {
        return (
            <section className="space-y-5">
                <InspectionDetailSkeleton />
            </section>
        )
    }

    if (inspectionQuery.isError || !inspectionQuery.data) {
        const message =
            inspectionQuery.error instanceof Error
                ? inspectionQuery.error.message
                : "No se pudo cargar la inspección."

        return (
            <section className="space-y-5">
                <Card className="border-destructive/30">
                    <CardContent className="py-10 text-center">
                        <h2 className="text-lg font-semibold text-destructive">
                            Error al cargar la inspección
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                        <div className="mt-4">
                            <Button asChild variant="outline">
                                <Link to="/inspections">Volver al listado</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )
    }

    const inspection = inspectionQuery.data

    const observedFields = fields.filter(
        (field) => field.validation_status === "mismatch",
    ).length

    const handleValidateOcr = async () => {
        await validateOcrMutation.mutateAsync()
    }

    const handleUploadEvidence = async (payload: EvidenceCreateInput) => {
        await createEvidenceMutation.mutateAsync(payload)
    }

    async function handleCreateField(payload: {
        field_key: string
        field_label: string
        field_group: string
        expected_type: string
        manual_value: string
    }) {
        await createFieldMutation.mutateAsync(payload)
    }

    const handleRunEvidenceOcr = async (evidenceId: number) => {
        try {
            setRunningEvidenceId(evidenceId)
            await runEvidenceOcrMutation.mutateAsync(evidenceId)
        } finally {
            setRunningEvidenceId(null)
        }
    }

    const handleExtractEvidenceOcr = async (evidenceId: number) => {
        try {
            setExtractingEvidenceId(evidenceId)
            await extractEvidenceOcrMutation.mutateAsync(evidenceId)
        } finally {
            setExtractingEvidenceId(null)
        }
    }

    const handleCreateTranscription = async (
        payload: Omit<TranscriptionCreateInput, "inspection_id">,
    ) => {
        await createTranscriptionMutation.mutateAsync({
            inspection_id: inspectionId,
            ...payload,
        })
    }

    const handleSaveTranscription = async (
        transcriptionId: number,
        finalText: string,
    ) => {
        try {
            setSavingTranscriptionId(transcriptionId)
            await updateTranscriptionMutation.mutateAsync({
                transcriptionId,
                payload: {
                    final_text: finalText,
                },
            })
        } finally {
            setSavingTranscriptionId(null)
        }
    }

    const handleGenerateDraft = async (templateVersion?: string) => {
        await generateDraftMutation.mutateAsync(templateVersion)
    }

    const handleGenerateLlmDraft = async (templateVersion?: string) => {
        await generateLlmDraftMutation.mutateAsync(templateVersion)
    }

    const handleSaveDraft = async (draftId: number, editedText: string) => {
        try {
            setSavingDraftId(draftId)
            await updateDraftMutation.mutateAsync({
                draftId,
                edited_text: editedText,
                status: "edited",
            })
        } finally {
            setSavingDraftId(null)
        }
    }

    const handleStartReport = async () => {
        const started_at = new Date().toISOString()
        setOptimisticStatus("in_review")
        setOptimisticStartedAt(started_at)
        setOptimisticFinishedAt(null)

        try {
            if (selectedDraft) {
                await updateReportStatusMutation.mutateAsync({
                    status: "in_review",
                    notes: "Informe iniciado desde el detalle de inspección",
                })
                await Promise.all([
                    reportStatusQuery.refetch(),
                    reportHistoryQuery.refetch(),
                    draftsQuery.refetch(),
                ])
            } else {
                await startProductivityMutation.mutateAsync()

                set_productivity_started_at(started_at)

                await inspectionQuery.refetch()
                await draftsQuery.refetch()
            }
        } catch (_error) {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
            set_productivity_started_at(null)
        } finally {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
        }
    }

    const handleFinishReport = async () => {
        const finished_at = new Date().toISOString()
        setOptimisticStatus("finalized")
        setOptimisticFinishedAt(finished_at)

        try {
            if (selectedDraft) {
                await updateReportStatusMutation.mutateAsync({
                    status: "finalized",
                    notes: "Informe finalizado desde el detalle de inspección",
                })
                await Promise.all([
                    reportStatusQuery.refetch(),
                    reportHistoryQuery.refetch(),
                    draftsQuery.refetch(),
                ])
            } else {
                await apiPatch(`/productivity/inspection/${inspectionId}/finish`, {
                    report_finished_at: finished_at,
                })
                set_productivity_finished_at(finished_at)
                await productivity_query.refetch()
                await inspectionQuery.refetch()
            }
        } catch (_error) {
            setOptimisticStatus(null)
            setOptimisticFinishedAt(null)
            set_productivity_finished_at(null)
        } finally {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
        }
    }

    const handleCreateVoiceTranscription = async (audioBlob: Blob) => {
        const audioFile = new File(
            [audioBlob],
            `inspection-${inspectionId}-${Date.now()}.webm`,
            { type: audioBlob.type || "audio/webm" },
        )

        const createdEvidence = await createEvidenceMutation.mutateAsync({
            file: audioFile,
            evidence_category: "audio",
            caption: "Audio grabado desde micrófono",
        })

        await createTranscriptionMutation.mutateAsync({
            inspection_id: inspectionId,
            evidence_id: createdEvidence.id,
            source_file_path: createdEvidence.file_path,
            language: "es",
            model_name: "base",
        })
    }

    return (
        <section className="space-y-5">
            <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/inspections">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a inspecciones
                        </Link>
                    </Button>

                    <Badge variant={getInspectionStatusVariant(inspection.status)}>
                        {formatInspectionStatus(inspection.status)}
                    </Badge>
                </div>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="space-y-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Expediente técnico
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {inspection.code}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {inspection.client_name} · {inspection.equipment_type} ·{" "}
                                    {inspection.inspection_type}
                                </p>
                            </div>

                            <div className="grid gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{formatInspectionDate(inspection.inspection_date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4" />
                                    <span>
                                        {inspection.responsible_inspector_id || "Inspector no asignado"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    <span>{inspection.location || "Ubicación no registrada"}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </header>

            <InspectionDetailHeader
                inspection={inspection}
                fieldsCount={fields.length}
                evidencesCount={evidences.length}
                transcriptionsCount={transcriptions.length}
                draftsCount={drafts.length}
                observedFieldsCount={observedFields}
            />

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            Operación del informe
                        </CardTitle>
                        <CardDescription>
                            Controla el inicio y cierre del informe técnico desde la inspección.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={handleStartReport}
                            disabled={!canStartReport}
                        >
                            <PlayCircle className="h-4 w-4" />
                            {isStartingReport ? "Iniciando..." : "Iniciar informe"}
                        </Button>

                        <Button onClick={handleFinishReport} disabled={!canFinishReport}>
                            <CheckCircle2 className="h-4 w-4" />
                            {updateReportStatusMutation.isPending ? "Finalizando..." : "Finalizar informe"}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Borrador activo
                        </p>
                        <p className="mt-1 text-sm font-medium">
                            {selectedDraft ? `Draft #${selectedDraft.id}` : "No disponible"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Estado actual
                        </p>
                        <div className="mt-2">
                            <Badge variant={getInspectionStatusVariant(visualReportStatus)}>
                                {formatInspectionStatus(visualReportStatus)}
                            </Badge>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Inicio del informe
                        </p>
                        <p className="mt-1 text-sm font-medium">
                            {reportStartedAt
                                ? new Date(reportStartedAt).toLocaleString("es-PE")
                                : "Pendiente"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Duración acumulada
                        </p>

                        <p className={`mt-1 text-sm font-medium ${isOverGoal ? "text-destructive" : ""}`}>
                            {liveElapsedLabel
                                ? `${liveElapsedLabel} min`
                                : reportDurationMinutes !== null
                                    ? `${reportDurationMinutes} min`
                                    : "No iniciada"}
                        </p>

                        <p className={`mt-1 text-xs ${isOverGoal ? "text-destructive" : "text-muted-foreground"}`}>
                            {liveElapsedLabel
                                ? isOverGoal
                                    ? "Superó la meta operativa de 20 min"
                                    : "Contador en vivo del informe en proceso"
                                : reportDurationMinutes !== null
                                    ? reportDurationMinutes <= REPORT_GOAL_MINUTES
                                        ? "Cumple meta de 20 min"
                                        : "Fuera de meta de 20 min"
                                    : "La meta se calcula al finalizar"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="fields" className="gap-4">
                <TabsList
                    variant="line"
                    className="flex w-full justify-start gap-1 overflow-x-auto whitespace-nowrap rounded-none border-b pb-1"
                >
                    <TabsTrigger value="fields" className="shrink-0 px-3">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Campos</span>
                    </TabsTrigger>

                    <TabsTrigger value="evidences" className="shrink-0 px-3">
                        <FolderOpen className="h-4 w-4" />
                        <span>Evidencias</span>
                    </TabsTrigger>

                    <TabsTrigger value="transcriptions" className="shrink-0 px-3">
                        <Languages className="h-4 w-4" />
                        <span>Transcripciones</span>
                    </TabsTrigger>

                    <TabsTrigger value="drafts" className="shrink-0 px-3">
                        <FileText className="h-4 w-4" />
                        <span>Informes</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4">
                    <InspectionFieldsTab
                        inspectionId={inspectionId}
                        fields={fields}
                        validation={validateOcrMutation.data ?? null}
                        isValidating={validateOcrMutation.isPending}
                        isCreatingField={createFieldMutation.isPending}
                        createFieldError={
                            createFieldMutation.error instanceof Error
                                ? createFieldMutation.error.message
                                : null
                        }
                        onValidate={handleValidateOcr}
                        onCreateField={handleCreateField}
                    />
                </TabsContent>

                <TabsContent value="evidences" className="space-y-4">
                    <InspectionEvidencesTab
                        evidences={evidences}
                        isUploading={createEvidenceMutation.isPending}
                        uploadError={
                            createEvidenceMutation.error instanceof Error
                                ? createEvidenceMutation.error.message
                                : null
                        }
                        runningEvidenceId={runningEvidenceId}
                        extractingEvidenceId={extractingEvidenceId}
                        onUpload={handleUploadEvidence}
                        onRunOcr={handleRunEvidenceOcr}
                        onExtract={handleExtractEvidenceOcr}
                    />
                </TabsContent>

                <TabsContent value="transcriptions" className="space-y-4">
                    <InspectionTranscriptionsTab
                        evidences={evidences}
                        transcriptions={transcriptions}
                        isCreating={createTranscriptionMutation.isPending}
                        savingTranscriptionId={savingTranscriptionId}
                        createError={
                            createTranscriptionMutation.error instanceof Error
                                ? createTranscriptionMutation.error.message
                                : null
                        }
                        updateError={
                            updateTranscriptionMutation.error instanceof Error
                                ? updateTranscriptionMutation.error.message
                                : null
                        }
                        onCreate={handleCreateTranscription}
                        onSave={handleSaveTranscription}
                        onCreateVoiceTranscription={handleCreateVoiceTranscription}
                    />
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4">
                    <div className="space-y-4">
                        <InspectionDraftsTab
                            drafts={drafts}
                            isGenerating={generateDraftMutation.isPending}
                            isGeneratingLlm={generateLlmDraftMutation.isPending}
                            savingDraftId={savingDraftId}
                            generateError={
                                generateDraftMutation.error instanceof Error
                                    ? generateDraftMutation.error.message
                                    : generateLlmDraftMutation.error instanceof Error
                                        ? generateLlmDraftMutation.error.message
                                        : null
                            }
                            saveError={
                                updateDraftMutation.error instanceof Error
                                    ? updateDraftMutation.error.message
                                    : null
                            }
                            onGenerate={handleGenerateDraft}
                            onGenerateLlm={handleGenerateLlmDraft}
                            onSave={handleSaveDraft}
                        />

                        <InspectionReportsTab
                            drafts={drafts}
                            selectedDraft={selectedDraft}
                            onSelectDraft={setSelectedDraftId}
                            reportStatusQuery={{
                                isLoading: reportStatusQuery.isLoading,
                                data: reportStatusQuery.data ?? null,
                            }}
                            reportHistoryQuery={{
                                isLoading: reportHistoryQuery.isLoading,
                                data: reportHistoryQuery.data ?? [],
                            }}
                            onChangeStatus={async ({ status, notes }) => {
                                await updateReportStatusMutation.mutateAsync({ status, notes })
                                await Promise.all([
                                    reportStatusQuery.refetch(),
                                    reportHistoryQuery.refetch(),
                                    draftsQuery.refetch(),
                                ])
                            }}
                            isChangingStatus={updateReportStatusMutation.isPending}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {(fieldsQuery.isError ||
                evidencesQuery.isError ||
                transcriptionsQuery.isError ||
                draftsQuery.isError) && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="py-4 text-sm text-amber-700">
                        Algunas secciones no se cargaron completamente. Revisa los endpoints
                        secundarios si ves contenido faltante.
                    </CardContent>
                </Card>
            )}

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Resumen técnico
                    </CardTitle>
                    <CardDescription>
                        Información general disponible en la cabecera de la inspección.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Cliente
                        </p>
                        <p className="mt-1 text-sm font-medium">{inspection.client_name}</p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Solicitado por
                        </p>
                        <p className="mt-1 text-sm font-medium">
                            {inspection.requested_by || "No registrado"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Inspector responsable
                        </p>
                        <p className="mt-1 text-sm font-medium">
                            {inspection.responsible_inspector_id || "No asignado"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}