import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderOpen,
    Languages,
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
    useCreateTranscriptionMutation,
    useExtractEvidenceOcrMutation,
    useGenerateLlmReportDraftMutation,
    useGenerateReportDraftMutation,
    useInspectionDetailQuery,
    useInspectionDraftsQuery,
    useInspectionEvidencesQuery,
    useInspectionFieldsQuery,
    useInspectionTranscriptionsQuery,
    useRunEvidenceOcrMutation,
    useUpdateReportDraftMutation,
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

    if (isInvalidInspectionId) {
        return (
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
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

    const inspection = inspectionQuery.data
    const fields = fieldsQuery.data ?? []
    const evidences = evidencesQuery.data ?? []
    const transcriptions = transcriptionsQuery.data ?? []
    const drafts = draftsQuery.data ?? []

    const observedFields = fields.filter(
        (field) => field.validation_status === "mismatch",
    ).length

    const handleValidateOcr = async () => {
        await validateOcrMutation.mutateAsync()
    }

    const handleUploadEvidence = async (payload: EvidenceCreateInput) => {
        await createEvidenceMutation.mutateAsync(payload)
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
            await updateDraftMutation.mutateAsync({
                draftId,
                edited_text: editedText,
                status: "edited",
            })
        } finally {
            setSavingDraftId(null)
        }
    }

    if (inspectionQuery.isLoading) {
        return (
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
                <InspectionDetailSkeleton />
            </section>
        )
    }

    if (inspectionQuery.isError || !inspection) {
        const message =
            inspectionQuery.error instanceof Error
                ? inspectionQuery.error.message
                : "No se pudo cargar la inspección."

        return (
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
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

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
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
                                        {inspection.responsible_inspector || "Inspector no asignado"}
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card size="sm" className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardDescription>Campos</CardDescription>
                        <CardTitle>{fields.length}</CardTitle>
                    </CardHeader>
                </Card>

                <Card size="sm" className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardDescription>Evidencias</CardDescription>
                        <CardTitle>{evidences.length}</CardTitle>
                    </CardHeader>
                </Card>

                <Card size="sm" className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardDescription>Transcripciones</CardDescription>
                        <CardTitle>{transcriptions.length}</CardTitle>
                    </CardHeader>
                </Card>

                <Card size="sm" className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardDescription>Campos observados</CardDescription>
                        <CardTitle>{observedFields}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Tabs defaultValue="fields" className="gap-5">
                <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="fields">
                        <ShieldCheck className="h-4 w-4" />
                        Campos
                    </TabsTrigger>
                    <TabsTrigger value="evidences">
                        <FolderOpen className="h-4 w-4" />
                        Evidencias
                    </TabsTrigger>
                    <TabsTrigger value="transcriptions">
                        <Languages className="h-4 w-4" />
                        Transcripciones
                    </TabsTrigger>
                    <TabsTrigger value="drafts">
                        <FileText className="h-4 w-4" />
                        Informes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fields">
                    <InspectionFieldsTab
                        fields={fields}
                        validation={validateOcrMutation.data ?? null}
                        isValidating={validateOcrMutation.isPending}
                        onValidate={handleValidateOcr}
                    />
                </TabsContent>

                <TabsContent value="evidences">
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

                <TabsContent value="transcriptions">
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
                    />
                </TabsContent>

                <TabsContent value="drafts">
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
                            {inspection.responsible_inspector || "No asignado"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}