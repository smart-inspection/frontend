import { Sparkles } from "lucide-react"

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

    const isAiGenerated = selectedDraft?.is_ai_generated || drafts.some((d) => d.is_ai_generated)
    const disclaimer =
        selectedDraft?.disclaimer ||
        drafts.find((d) => d.is_ai_generated)?.disclaimer

    return (
        <div className="space-y-4">
            {isAiGenerated ? (
                <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200"
                >
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <div className="space-y-1 text-sm">
                        <p className="font-semibold">Borrador asistido por Inteligencia Artificial</p>
                        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                            {disclaimer || "Este contenido ha sido generado automáticamente mediante modelos de lenguaje (LLM). Requiere revisión, verificación y validación humana obligatoria antes de emitir el informe final."}
                        </p>
                    </div>
                </div>
            ) : null}

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
