import type { ReportDraft } from "@/features/inspections/types/inspections.types"
import type { useInspectionActions } from "../hooks/useInspectionActions"
import type { useReportTimer } from "../hooks/useReportTimer"
import { InspectionDraftsTab } from "./inspection-drafts-tab"
import { InspectionReportsTab } from "./inspection-reports-tab"

interface InspectionDraftsSectionProps {
    drafts: ReportDraft[]
    selectedDraft: ReportDraft | null
    onSelectDraft: (id: number) => void
    actions: ReturnType<typeof useInspectionActions>
    timer: ReturnType<typeof useReportTimer>
    onDraftsRefetch: () => Promise<unknown> | void
}

export function InspectionDraftsSection({
    drafts,
    selectedDraft,
    onSelectDraft,
    actions,
    timer,
    onDraftsRefetch,
}: InspectionDraftsSectionProps) {
    const generateError =
        actions.generateDraftMutation.error instanceof Error
            ? actions.generateDraftMutation.error.message
            : actions.generateLlmDraftMutation.error instanceof Error
                ? actions.generateLlmDraftMutation.error.message
                : null

    const saveError =
        actions.updateDraftMutation.error instanceof Error
            ? actions.updateDraftMutation.error.message
            : null

    return (
        <div className="space-y-4">
            <InspectionDraftsTab
                drafts={drafts}
                isGenerating={actions.generateDraftMutation.isPending}
                isGeneratingLlm={actions.generateLlmDraftMutation.isPending}
                savingDraftId={actions.savingDraftId}
                generateError={generateError}
                saveError={saveError}
                onGenerate={actions.handleGenerateDraft}
                onGenerateLlm={actions.handleGenerateLlmDraft}
                onSave={actions.handleSaveDraft}
            />

            <InspectionReportsTab
                drafts={drafts}
                selectedDraft={selectedDraft}
                onSelectDraft={onSelectDraft}
                reportStatusQuery={{
                    isLoading: timer.reportStatusQuery.isLoading,
                    data: timer.reportStatusQuery.data ?? null,
                }}
                reportHistoryQuery={{
                    isLoading: timer.reportHistoryQuery.isLoading,
                    data: timer.reportHistoryQuery.data ?? [],
                }}
                onChangeStatus={async ({ status, notes }) => {
                    await timer.updateReportStatusMutation.mutateAsync({ status, notes })
                    await Promise.all([
                        timer.reportStatusQuery.refetch(),
                        timer.reportHistoryQuery.refetch(),
                        onDraftsRefetch(),
                    ])
                }}
                isChangingStatus={timer.updateReportStatusMutation.isPending}
            />
        </div>
    )
}
