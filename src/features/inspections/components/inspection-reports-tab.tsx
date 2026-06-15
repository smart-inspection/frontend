import { useEffect, useState } from "react"
import { CheckCircle2, Clock3, Eye, FileCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useCurrentUserQuery } from "@/features/auth/api/auth.queries"
import {
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"
import {
    buildReportExportUrl,
    formatDateTime,
} from "@/features/inspections/utils/inspection-detail.utils"

const REPORT_GOAL_MINUTES = 20

const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
    admin: {
        draft: ["in_review"],
        generated: ["in_review"],
        generated_llm: ["in_review"],
        edited: ["in_review"],
        in_review: ["observed", "finalized"],
        observed: ["in_review", "finalized"],
        finalized: [],
    },
    inspector: {
        draft: ["in_review"],
        generated: ["in_review"],
        generated_llm: ["in_review"],
        edited: ["in_review"],
        in_review: ["finalized"],
        observed: ["in_review"],
        finalized: [],
    },
    viewer: {},
}

const TRANSITION_LABELS: Record<string, string> = {
    in_review: "Iniciar revisión",
    observed: "Marcar observado",
    finalized: "Finalizar informe",
}

const TRANSITION_ICONS: Record<string, React.ElementType> = {
    in_review: Clock3,
    observed: Eye,
    finalized: FileCheck,
}

type ReportDraftItem = {
    id: number
    title?: string | null
    template_version?: string | null
    status?: string | null
    generation_time_ms?: number | null
    created_at?: string | null
    updated_at?: string | null
    generated_text?: string | null
    edited_text?: string | null
}

type ReportStatusData = {
    status?: string | null
    last_action?: string | null
    status_updated_at?: string | null
}

type ReportHistoryItem = {
    id: number
    action?: string | null
    created_at?: string | null
    from_status?: string | null
    to_status?: string | null
    notes?: string | null
}

type QueryLike<T> = {
    isLoading: boolean;
    data?: T | null
}

type StatusMutationFn = (args: { status: string; notes: string }) => Promise<void>

type InspectionReportsTabProps = {
    drafts: ReportDraftItem[]
    selectedDraft: ReportDraftItem | null
    onSelectDraft: (draftId: number) => void
    reportStatusQuery: QueryLike<ReportStatusData | null>
    reportHistoryQuery: QueryLike<ReportHistoryItem[]>
    onChangeStatus: StatusMutationFn
    isChangingStatus?: boolean
}

export function InspectionReportsTab({
                                         drafts,
                                         selectedDraft,
                                         onSelectDraft,
                                         reportStatusQuery,
                                         reportHistoryQuery,
                                         onChangeStatus,
                                         isChangingStatus = false,
                                     }: InspectionReportsTabProps) {
    const { data: current_user } = useCurrentUserQuery()
    const user_role = current_user?.role ?? "viewer"

    const current_status = (
        reportStatusQuery.data?.status ??
        selectedDraft?.status ??
        "draft"
    ).toLowerCase()

    const visual_status =
        reportStatusQuery.data?.status ?? selectedDraft?.status ?? "draft"

    const report_history = reportHistoryQuery.data ?? []

    const report_started_at =
        report_history.find(
            (item) => item.to_status?.toLowerCase() === "in_review",
        )?.created_at ?? null

    const report_finished_at =
        report_history.find(
            (item) => item.to_status?.toLowerCase() === "finalized",
        )?.created_at ?? null

    const report_duration_minutes =
        report_started_at && report_finished_at
            ? Math.max(
                0,
                Math.round(
                    (new Date(report_finished_at).getTime() -
                        new Date(report_started_at).getTime()) /
                    60000,
                ),
            )
            : null

    const [live_elapsed_ms, set_live_elapsed_ms] = useState(0)

    useEffect(() => {
        if (
            current_status !== "in_review" ||
            !report_started_at ||
            report_finished_at
        ) {
            set_live_elapsed_ms(0)
            return
        }

        const update = () =>
            set_live_elapsed_ms(
                Math.max(0, new Date().getTime() - new Date(report_started_at).getTime()),
            )
        update()
        const interval = window.setInterval(update, 1000)
        return () => window.clearInterval(interval)
    }, [current_status, report_started_at, report_finished_at])

    const live_minutes = Math.max(0, Math.floor(live_elapsed_ms / 60000))
    const live_seconds = Math.max(
        0,
        Math.floor((live_elapsed_ms % 60000) / 1000),
    )
    const live_label =
        current_status === "in_review" && report_started_at && !report_finished_at
            ? `${String(live_minutes).padStart(2, "0")}:${String(live_seconds).padStart(2, "0")}`
            : null

    const is_over_goal =
        current_status === "in_review"
            ? live_elapsed_ms > REPORT_GOAL_MINUTES * 60 * 1000
            : report_duration_minutes !== null &&
            report_duration_minutes > REPORT_GOAL_MINUTES

    const available_transitions =
        ALLOWED_TRANSITIONS[user_role]?.[current_status] ?? []

    const [transition_notes, set_transition_notes] = useState("")
    const [pending_transition, set_pending_transition] = useState<string | null>(
        null,
    )

    async function handle_transition(new_status: string) {
        set_pending_transition(new_status)
        try {
            await onChangeStatus({
                status: new_status,
                notes:
                    transition_notes.trim() ||
                    `Estado cambiado a ${TRANSITION_LABELS[new_status] ?? new_status}`,
            })
            set_transition_notes("")
        } finally {
            set_pending_transition(null)
        }
    }

    return (
        <div className="space-y-4">
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
                                    onClick={() => onSelectDraft(draft.id)}
                                >
                                    Draft {draft.id}
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
                                <CardTitle className="text-base">
                                    {selectedDraft.title ?? `Draft ${selectedDraft.id}`}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {selectedDraft.template_version ?? "Sin versión"} ·{" "}
                                    <Badge variant={getInspectionStatusVariant(visual_status)}>
                                        {formatInspectionStatus(visual_status)}
                                    </Badge>
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

                        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Estado
                                </p>
                                <div className="mt-2">
                                    <Badge variant={getInspectionStatusVariant(visual_status)}>
                                        {formatInspectionStatus(visual_status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Inicio del informe
                                </p>
                                <p className="mt-1 font-medium">
                                    {report_started_at
                                        ? new Date(report_started_at).toLocaleString("es-PE")
                                        : "Pendiente"}
                                </p>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Duración acumulada
                                </p>
                                <p
                                    className={`mt-1 font-medium ${is_over_goal ? "text-destructive" : ""}`}
                                >
                                    {live_label
                                        ? `${live_label} min`
                                        : report_duration_minutes !== null
                                            ? `${report_duration_minutes} min`
                                            : "No iniciada"}
                                </p>
                                <p
                                    className={`mt-1 text-xs ${is_over_goal ? "text-destructive" : "text-muted-foreground"}`}
                                >
                                    {live_label
                                        ? is_over_goal
                                            ? "Superó la meta operativa de 20 min"
                                            : "Contador en vivo"
                                        : report_duration_minutes !== null
                                            ? report_duration_minutes <= REPORT_GOAL_MINUTES
                                                ? "Cumple meta de 20 min"
                                                : "Fuera de meta de 20 min"
                                            : "La meta se calcula al finalizar"}
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
                                        {selectedDraft.edited_text ?? selectedDraft.generated_text}
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
                                                    {formatInspectionStatus(
                                                        reportStatusQuery.data.status ?? "",
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Última acción
                                                </p>
                                                <p className="mt-1 font-medium">
                                                    {reportStatusQuery.data.last_action ?? "No registrada"}
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

                            {available_transitions.length > 0 ? (
                                <Card className="border-border/60 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Cambiar estado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Nota opcional
                                            </label>
                                            <Textarea
                                                placeholder="Agrega una observación al cambio de estado…"
                                                value={transition_notes}
                                                onChange={(e) => set_transition_notes(e.target.value)}
                                                rows={2}
                                                disabled={isChangingStatus}
                                                className="resize-none text-sm"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {available_transitions.map((new_status) => {
                                                const Icon =
                                                    TRANSITION_ICONS[new_status] ?? CheckCircle2
                                                const is_loading =
                                                    isChangingStatus &&
                                                    pending_transition === new_status

                                                return (
                                                    <Button
                                                        key={new_status}
                                                        variant={
                                                            new_status === "finalized"
                                                                ? "default"
                                                                : new_status === "observed"
                                                                    ? "destructive"
                                                                    : "outline"
                                                        }
                                                        disabled={isChangingStatus}
                                                        onClick={() => handle_transition(new_status)}
                                                        className="w-full justify-start gap-2"
                                                    >
                                                        <Icon className="h-4 w-4 shrink-0" />
                                                        {is_loading
                                                            ? "Guardando..."
                                                            : TRANSITION_LABELS[new_status] ?? new_status}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : current_status === "finalized" ? (
                                <Card className="border-green-200 bg-green-50/50">
                                    <CardContent className="py-4">
                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                            <FileCheck className="h-4 w-4 shrink-0" />
                                            <span>Informe finalizado. No se permiten más cambios.</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>
                    </div>

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
                            ) : report_history.length ? (
                                report_history.map((log) => (
                                    <div key={log.id} className="rounded-xl border p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium">
                                                {log.action ?? "Acción"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(log.created_at)}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {log.from_status} → {log.to_status}
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
                </>
            ) : null}
        </div>
    )
}