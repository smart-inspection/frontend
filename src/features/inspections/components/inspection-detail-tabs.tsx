import {
    ClipboardList,
    FileText,
    FolderOpen,
    Languages,
    ScanSearch,
    ShieldCheck,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
    Evidence,
    Inspection,
    InspectionField,
    ReportDraft,
    Transcription,
} from "@/features/inspections/types/inspections.types"
import type { useInspectionActions } from "../hooks/useInspectionActions"
import type { useReportTimer } from "../hooks/useReportTimer"
import { InspectionDraftsSection } from "./inspection-drafts-section"
import { InspectionEvidencesTab } from "./inspection-evidences-tab"
import { InspectionFieldsTab } from "./inspection-fields-tab"
import { InspectionOcrTab } from "./inspection-ocr-tab"
import { InspectionSummaryTab } from "./inspection-summary-tab"
import { InspectionTranscriptionsTab } from "./inspection-transcriptions-tab"

interface InspectionDetailTabsProps {
    inspectionId: number
    inspection: Inspection
    fields: InspectionField[]
    evidences: Evidence[]
    transcriptions: Transcription[]
    drafts: ReportDraft[]
    selectedDraft: ReportDraft | null
    onSelectDraft: (id: number) => void
    actions: ReturnType<typeof useInspectionActions>
    timer: ReturnType<typeof useReportTimer>
    onDraftsRefetch: () => Promise<unknown> | void
}

export function InspectionDetailTabs({
    inspectionId,
    inspection,
    fields,
    evidences,
    transcriptions,
    drafts,
    selectedDraft,
    onSelectDraft,
    actions,
    timer,
    onDraftsRefetch,
}: InspectionDetailTabsProps) {
    return (
        <Tabs defaultValue="fields" className="gap-4">
            <TabsList
                variant="line"
                className="flex w-full justify-start gap-1 overflow-x-auto whitespace-nowrap rounded-none border-b pb-1"
            >
                <TabsTrigger
                    value="fields"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ShieldCheck className="h-4 w-4" /> <span>Campos</span>
                </TabsTrigger>
                <TabsTrigger
                    value="evidences"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <FolderOpen className="h-4 w-4" /> <span>Evidencias</span>
                </TabsTrigger>
                <TabsTrigger
                    value="ocr"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ScanSearch className="h-4 w-4" /> <span>OCR</span>
                </TabsTrigger>
                <TabsTrigger
                    value="transcriptions"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Languages className="h-4 w-4" /> <span>Transcripciones</span>
                </TabsTrigger>
                <TabsTrigger
                    value="drafts"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <FileText className="h-4 w-4" /> <span>Borradores/Informes</span>
                </TabsTrigger>
                <TabsTrigger
                    value="summary"
                    className="min-h-[44px] shrink-0 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ClipboardList className="h-4 w-4" /> <span>Resumen</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="space-y-4">
                <InspectionFieldsTab
                    inspectionId={inspectionId}
                    fields={fields}
                    validation={actions.validateOcrMutation.data ?? null}
                    isValidating={actions.validateOcrMutation.isPending}
                    isCreatingField={actions.createFieldMutation.isPending}
                    createFieldError={
                        actions.createFieldMutation.error instanceof Error
                            ? actions.createFieldMutation.error.message
                            : null
                    }
                    onValidate={actions.handleValidateOcr}
                    onCreateField={actions.handleCreateField}
                />
            </TabsContent>

            <TabsContent value="evidences" className="space-y-4">
                <InspectionEvidencesTab
                    evidences={evidences}
                    isUploading={actions.createEvidenceMutation.isPending}
                    uploadError={
                        actions.createEvidenceMutation.error instanceof Error
                            ? actions.createEvidenceMutation.error.message
                            : null
                    }
                    runningEvidenceId={actions.runningEvidenceId}
                    extractingEvidenceId={actions.extractingEvidenceId}
                    onUpload={actions.handleUploadEvidence}
                    onRunOcr={actions.handleRunEvidenceOcr}
                    onExtract={actions.handleExtractEvidenceOcr}
                />
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
                <InspectionOcrTab
                    mutation={{
                        mutate: actions.handleValidateOcr,
                        isPending: actions.validateOcrMutation.isPending,
                    }}
                    result={actions.validateOcrMutation.data ?? null}
                />
            </TabsContent>

            <TabsContent value="transcriptions" className="space-y-4">
                <InspectionTranscriptionsTab
                    evidences={evidences}
                    transcriptions={transcriptions}
                    isCreating={actions.createTranscriptionMutation.isPending}
                    savingTranscriptionId={actions.savingTranscriptionId}
                    createError={
                        actions.createTranscriptionMutation.error instanceof Error
                            ? actions.createTranscriptionMutation.error.message
                            : null
                    }
                    updateError={
                        actions.updateTranscriptionMutation.error instanceof Error
                            ? actions.updateTranscriptionMutation.error.message
                            : null
                    }
                    onCreate={actions.handleCreateTranscription}
                    onSave={actions.handleSaveTranscription}
                    onCreateVoiceTranscription={actions.handleCreateVoiceTranscription}
                />
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
                <InspectionDraftsSection
                    drafts={drafts}
                    selectedDraft={selectedDraft}
                    onSelectDraft={onSelectDraft}
                    actions={actions}
                    timer={timer}
                    onDraftsRefetch={onDraftsRefetch}
                />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
                <InspectionSummaryTab
                    inspection={inspection}
                    fields={fields}
                    evidences={evidences}
                    transcriptions={transcriptions}
                    drafts={drafts}
                />
            </TabsContent>
        </Tabs>
    )
}
