import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import {
    useInspectionDetailQuery,
    useInspectionDraftsQuery,
    useInspectionEvidencesQuery,
    useInspectionFieldsQuery,
    useInspectionTranscriptionsQuery,
    useReportHistoryQuery,
    useReportStatusQuery,
    useValidateInspectionOcrMutation,
} from "@/features/inspections/api/inspections.queries"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { InspectionDetailSkeleton } from "@/features/inspections/components/inspection-detail-skeleton"
import { InspectionDetailHeader } from "@/features/inspections/components/inspection-detail-header"
import { InspectionDetailError } from "@/features/inspections/components/inspection-detail-error"
import { InspectionSummaryTab } from "@/features/inspections/components/inspection-summary-tab"
import { InspectionFieldsTab } from "@/features/inspections/components/inspection-fields-tab"
import { InspectionEvidencesTab } from "@/features/inspections/components/inspection-evidences-tab"
import { InspectionOcrTab } from "@/features/inspections/components/inspection-ocr-tab"
import { InspectionTranscriptionsTab } from "@/features/inspections/components/inspection-transcriptions-tab"
import { InspectionReportsTab } from "@/features/inspections/components/inspection-reports-tab"

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

    if (isLoading) return <InspectionDetailSkeleton />
    if (hasError || !inspection) return <InspectionDetailError />

    return (
        <section>
            <InspectionDetailHeader
                inspection={inspection}
                fieldsCount={fields.length}
                evidencesCount={evidences.length}
                transcriptionsCount={transcriptions.length}
                draftsCount={drafts.length}
            />

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

                <TabsContent value="summary">
                    <InspectionSummaryTab
                        inspection={inspection}
                        fields={fields}
                        evidences={evidences}
                        transcriptions={transcriptions}
                        drafts={drafts}
                    />
                </TabsContent>

                <TabsContent value="fields">
                    <InspectionFieldsTab fields={fields} />
                </TabsContent>

                <TabsContent value="evidences">
                    <InspectionEvidencesTab evidences={evidences} />
                </TabsContent>

                <TabsContent value="ocr">
                    <InspectionOcrTab
                        mutation={validateOcrMutation}
                        result={validateOcrMutation.data}
                    />
                </TabsContent>

                <TabsContent value="transcriptions">
                    <InspectionTranscriptionsTab transcriptions={transcriptions} />
                </TabsContent>

                <TabsContent value="reports">
                    <InspectionReportsTab
                        drafts={drafts}
                        selectedDraft={selectedDraft}
                        onSelectDraft={setSelectedDraftId}
                        reportStatusQuery={reportStatusQuery}
                        reportHistoryQuery={reportHistoryQuery}
                    />
                </TabsContent>
            </Tabs>
        </section>
    )
}