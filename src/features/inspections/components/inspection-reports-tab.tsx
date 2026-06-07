import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
    buildReportExportUrl,
    formatDateTime,
} from "@/features/inspections/utils/inspection-detail.utils"

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
    isLoading: boolean
    data?: T
}

type InspectionReportsTabProps = {
    drafts: ReportDraftItem[]
    selectedDraft: ReportDraftItem | null
    onSelectDraft: (draftId: number) => void
    reportStatusQuery: QueryLike<ReportStatusData | null>
    reportHistoryQuery: QueryLike<ReportHistoryItem[] | null>
}

export function InspectionReportsTab({
                                         drafts,
                                         selectedDraft,
                                         onSelectDraft,
                                         reportStatusQuery,
                                         reportHistoryQuery,
                                     }: InspectionReportsTabProps) {
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
                                <CardTitle className="text-base">
                                    {selectedDraft.title || `Draft #${selectedDraft.id}`}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {selectedDraft.template_version || "Sin versión"} ·{" "}
                                    {selectedDraft.status || "Sin estado"}
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
                                <p className="mt-1 font-medium">
                                    {selectedDraft.status || "No registrado"}
                                </p>
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
                                                    {reportStatusQuery.data.status || "No registrado"}
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
                                        reportHistoryQuery.data.map((log) => (
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
        </div>
    )
}