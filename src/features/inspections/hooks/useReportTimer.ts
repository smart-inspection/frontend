import { useEffect, useState } from "react"
import {
    useFinishProductivityMutation,
    useProductivityByInspectionQuery,
    useReportHistoryQuery,
    useReportStatusQuery,
    useStartProductivityMutation,
    useUpdateReportStatusMutation,
} from "@/features/inspections/api/inspections.queries"
import type { ReportDraft } from "@/features/inspections/types/inspections.types"

export const REPORT_GOAL_MINUTES = 20

interface UseReportTimerOptions {
    inspectionId: number
    selectedDraft: ReportDraft | null
    onInspectionRefetch?: () => Promise<unknown> | void
    onDraftsRefetch?: () => Promise<unknown> | void
}

export function useReportTimer({
    inspectionId,
    selectedDraft,
    onInspectionRefetch,
    onDraftsRefetch,
}: UseReportTimerOptions) {
    const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null)
    const [optimisticStartedAt, setOptimisticStartedAt] = useState<string | null>(null)
    const [optimisticFinishedAt, setOptimisticFinishedAt] = useState<string | null>(null)
    const [productivityStartedAt, setProductivityStartedAt] = useState<string | null>(null)
    const [productivityFinishedAt, setProductivityFinishedAt] = useState<string | null>(null)

    const activeDraftId = selectedDraft?.id ?? 0
    const productivityQuery = useProductivityByInspectionQuery(inspectionId)
    const reportStatusQuery = useReportStatusQuery(activeDraftId)
    const reportHistoryQuery = useReportHistoryQuery(activeDraftId, 20)
    const updateReportStatusMutation = useUpdateReportStatusMutation(activeDraftId, inspectionId)
    const startProductivityMutation = useStartProductivityMutation(inspectionId)
    const finishProductivityMutation = useFinishProductivityMutation(inspectionId)

    useEffect(() => {
        const serverStarted = productivityQuery.data?.report_started_at ?? null
        const serverFinished = productivityQuery.data?.report_finished_at ?? null

        if (serverStarted && !productivityStartedAt) {
            setProductivityStartedAt(serverStarted)
        }
        if (serverFinished && !productivityFinishedAt) {
            setProductivityFinishedAt(serverFinished)
        }
    }, [productivityQuery.data, productivityStartedAt, productivityFinishedAt])

    const reportStatus = reportStatusQuery.data ?? null
    const reportHistory = reportHistoryQuery.data ?? []

    const currentReportStatus = (
        optimisticStatus ??
        reportStatus?.status ??
        selectedDraft?.status ??
        (productivityFinishedAt || productivityQuery.data?.report_finished_at
            ? "finalized"
            : productivityStartedAt || productivityQuery.data?.report_started_at
                ? "in_review"
                : null) ??
        "draft"
    ).toLowerCase()

    const visualReportStatus =
        optimisticStatus || reportStatus?.status || selectedDraft?.status || "draft"

    const reportStartedAt =
        optimisticStartedAt ??
        reportHistory.find((item) => item.to_status?.toLowerCase() === "in_review")?.created_at ??
        productivityStartedAt ??
        null

    const reportFinishedAt =
        optimisticFinishedAt ??
        reportHistory.find((item) => item.to_status?.toLowerCase() === "finalized")?.created_at ??
        productivityQuery.data?.report_finished_at ??
        productivityFinishedAt ??
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

    const isFinishingReport =
        updateReportStatusMutation.isPending || finishProductivityMutation.isPending

    const isInReview = currentReportStatus === "in_review"

    const canStartReport =
        inspectionId > 0 &&
        !isStartingReport &&
        !isInReview &&
        currentReportStatus !== "finalized"

    const canFinishReport =
        !isStartingReport &&
        !isFinishingReport &&
        isInReview

    const handleStartReport = async () => {
        const startedAt = new Date().toISOString()
        setOptimisticStatus("in_review")
        setOptimisticStartedAt(startedAt)
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
                    onDraftsRefetch?.(),
                ])
            } else {
                await startProductivityMutation.mutateAsync()
                setProductivityStartedAt(startedAt)
                await Promise.all([
                    onInspectionRefetch?.(),
                    onDraftsRefetch?.(),
                ])
            }
        } catch (_error) {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
            setProductivityStartedAt(null)
        } finally {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
        }
    }

    const handleFinishReport = async () => {
        const finishedAt = new Date().toISOString()
        setOptimisticStatus("finalized")
        setOptimisticFinishedAt(finishedAt)

        try {
            if (selectedDraft) {
                await updateReportStatusMutation.mutateAsync({
                    status: "finalized",
                    notes: "Informe finalizado desde el detalle de inspección",
                })
                await Promise.all([
                    reportStatusQuery.refetch(),
                    reportHistoryQuery.refetch(),
                    onDraftsRefetch?.(),
                ])
            } else {
                await finishProductivityMutation.mutateAsync(finishedAt)
                setProductivityFinishedAt(finishedAt)
                await Promise.all([
                    productivityQuery.refetch(),
                    onInspectionRefetch?.(),
                ])
            }
        } catch (_error) {
            setOptimisticStatus(null)
            setOptimisticFinishedAt(null)
            setProductivityFinishedAt(null)
        } finally {
            setOptimisticStatus(null)
            setOptimisticStartedAt(null)
            setOptimisticFinishedAt(null)
        }
    }

    return {
        currentReportStatus,
        visualReportStatus,
        reportStartedAt,
        reportFinishedAt,
        reportDurationMinutes,
        liveElapsedLabel,
        isOverGoal,
        canStartReport,
        canFinishReport,
        isStartingReport,
        isFinishingReport,
        handleStartReport,
        handleFinishReport,
        reportStatusQuery,
        reportHistoryQuery,
        updateReportStatusMutation,
    }
}
