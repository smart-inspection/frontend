import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
    useInspectionDetailQuery,
    useInspectionDraftsQuery,
    useInspectionEvidencesQuery,
    useInspectionFieldsQuery,
    useInspectionTranscriptionsQuery,
} from "@/features/inspections/api/inspections.queries"
import { InspectionDetailHeader } from "../components/inspection-detail-header"
import { InspectionDetailSkeleton } from "../components/inspection-detail-skeleton"
import { InspectionDetailTabs } from "../components/inspection-detail-tabs"
import { InspectionReportOperationCard } from "../components/inspection-report-operation-card"
import { useInspectionActions } from "../hooks/useInspectionActions"
import { useReportTimer } from "../hooks/useReportTimer"

export default function InspectionDetailPage() {
    const { inspectionId: inspectionIdParam } = useParams()
    const inspectionId = Number(inspectionIdParam)
    const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null)

    const isInvalidInspectionId = !Number.isFinite(inspectionId) || inspectionId <= 0

    const inspectionQuery = useInspectionDetailQuery(inspectionId)
    const fieldsQuery = useInspectionFieldsQuery(inspectionId)
    const evidencesQuery = useInspectionEvidencesQuery(inspectionId)
    const transcriptionsQuery = useInspectionTranscriptionsQuery(inspectionId)
    const draftsQuery = useInspectionDraftsQuery(inspectionId)

    const fields = fieldsQuery.data ?? []
    const evidences = evidencesQuery.data ?? []
    const transcriptions = transcriptionsQuery.data ?? []
    const drafts = draftsQuery.data ?? []

    const selectedDraft =
        drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null

    const timer = useReportTimer({
        inspectionId,
        selectedDraft,
        onInspectionRefetch: inspectionQuery.refetch,
        onDraftsRefetch: draftsQuery.refetch,
    })

    const actions = useInspectionActions(inspectionId)

    useEffect(() => {
        if (!drafts.length) {
            setSelectedDraftId(null)
            return
        }
        if (!selectedDraftId || !drafts.some((d) => d.id === selectedDraftId)) {
            setSelectedDraftId(drafts[0].id)
        }
    }, [drafts, selectedDraftId])

    if (isInvalidInspectionId) {
        return (
            <Card className="border-destructive/30">
                <CardContent className="py-10 text-center">
                    <h2 className="text-lg font-semibold">Inspección no válida</h2>
                    <p className="mt-2 text-sm text-muted-foreground">El identificador en la URL no es correcto.</p>
                    <Button asChild variant="outline" className="mt-4 min-h-[44px]">
                        <Link to="/inspections">Volver al listado</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (inspectionQuery.isLoading) return <InspectionDetailSkeleton />

    if (inspectionQuery.isError || !inspectionQuery.data) {
        return (
            <Card className="border-destructive/30">
                <CardContent className="py-10 text-center">
                    <h2 className="text-lg font-semibold text-destructive">Error al cargar inspección</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {inspectionQuery.error instanceof Error ? inspectionQuery.error.message : "Error desconocido."}
                    </p>
                    <Button asChild variant="outline" className="mt-4 min-h-[44px]">
                        <Link to="/inspections">Volver al listado</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const inspection = inspectionQuery.data
    const observedFields = fields.filter((f) => f.validation_status === "mismatch").length

    return (
        <section className="space-y-5">
            <InspectionDetailHeader
                inspection={inspection}
                fieldsCount={fields.length}
                evidencesCount={evidences.length}
                transcriptionsCount={transcriptions.length}
                draftsCount={drafts.length}
                observedFieldsCount={observedFields}
            />

            <InspectionReportOperationCard
                selectedDraft={selectedDraft}
                visualReportStatus={timer.visualReportStatus}
                reportStartedAt={timer.reportStartedAt}
                reportDurationMinutes={timer.reportDurationMinutes}
                liveElapsedLabel={timer.liveElapsedLabel}
                isOverGoal={timer.isOverGoal}
                canStartReport={timer.canStartReport}
                canFinishReport={timer.canFinishReport}
                isStartingReport={timer.isStartingReport}
                isFinishingReport={timer.isFinishingReport}
                onStartReport={timer.handleStartReport}
                onFinishReport={timer.handleFinishReport}
            />

            <InspectionDetailTabs
                inspectionId={inspectionId}
                inspection={inspection}
                fields={fields}
                evidences={evidences}
                transcriptions={transcriptions}
                drafts={drafts}
                selectedDraft={selectedDraft}
                onSelectDraft={setSelectedDraftId}
                actions={actions}
                timer={timer}
                onDraftsRefetch={draftsQuery.refetch}
            />

            {(fieldsQuery.isError || evidencesQuery.isError || transcriptionsQuery.isError || draftsQuery.isError) && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="py-4 text-sm text-amber-700">
                        Algunas secciones no se cargaron completamente. Revisa los endpoints secundarios si ves contenido faltante.
                    </CardContent>
                </Card>
            )}
        </section>
    )
}