import { useState } from "react"
import { CheckCircle2, Clock, History, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

import {
    useReportHistoryQuery,
    useTransitionInspectionStatusMutation,
} from "../api/inspections.queries"
import type { Inspection } from "../types/inspections.types"
import {
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "../types/inspections.utils"
import { formatDateTime } from "../utils/inspection-detail.utils"

const WORKFLOW_STEPS = [
    { key: "draft", label: "Borrador" },
    { key: "in_review", label: "En revisión" },
    { key: "observed", label: "Observado" },
    { key: "finalized", label: "Finalizado" },
] as const

interface InspectionStatusManagerProps {
    inspection: Inspection
    canEdit: boolean
    currentRole?: string
    draftId?: number | null
}

export function InspectionStatusManager({
    inspection,
    canEdit,
    currentRole,
    draftId,
}: InspectionStatusManagerProps) {
    const [targetStatus, setTargetStatus] = useState<string>("")
    const [notes, setNotes] = useState<string>("")

    const transitionMutation = useTransitionInspectionStatusMutation(inspection.id)
    const historyQuery = useReportHistoryQuery(draftId ?? 0, 50)
    const historyLogs = historyQuery.data ?? []

    const currentStatus = inspection?.status?.toLowerCase() ?? "draft"
    const isInspector = currentRole === "inspector"

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!targetStatus || targetStatus === currentStatus || !canEdit) return

        transitionMutation.mutate(
            {
                to_status: targetStatus,
                notes: notes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setNotes("")
                    setTargetStatus("")
                },
            },
        )
    }

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4" />
                            Gestión del estado de la inspección
                        </CardTitle>
                        <CardDescription>
                            Controla el ciclo de vida operativo y la bitácora de auditoría técnica.
                        </CardDescription>
                    </div>
                    <Badge variant={getInspectionStatusVariant(currentStatus)} className="self-start sm:self-auto">
                        Estado actual: {formatInspectionStatus(currentStatus)}
                    </Badge>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Flujo operativo del informe
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {WORKFLOW_STEPS.map((step, idx) => {
                            const isCurrent = currentStatus === step.key
                            return (
                                <div key={step.key} className="flex items-center gap-2">
                                    <div
                                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                            isCurrent
                                                ? "border border-primary bg-primary text-primary-foreground"
                                                : "border bg-background text-muted-foreground"
                                        }`}
                                    >
                                        {isCurrent && <CheckCircle2 className="h-3.5 w-3.5" />}
                                        <span>{step.label}</span>
                                    </div>
                                    {idx < WORKFLOW_STEPS.length - 1 && (
                                        <span className="text-muted-foreground text-xs" aria-hidden="true">
                                            ➔
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="status-select" className="text-xs font-semibold">
                            Nuevo estado
                        </Label>
                        <select
                            id="status-select"
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value)}
                            disabled={!canEdit || transitionMutation.isPending}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Selecciona un estado...</option>
                            <option value="draft">Borrador</option>
                            <option value="in_review">En revisión</option>
                            <option value="observed">Observado</option>
                            <option
                                value="finalized"
                                disabled={isInspector}
                            >
                                {isInspector ? "Finalizado (Requiere administrador)" : "Finalizado"}
                            </option>
                        </select>
                        {isInspector && (
                            <p className="text-xs text-muted-foreground">
                                La finalización formal requiere aprobación de administrador
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="status-notes" className="text-xs font-semibold">
                            Observaciones / Justificación
                        </Label>
                        <Textarea
                            id="status-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={!canEdit || transitionMutation.isPending}
                            placeholder="Describe el motivo o detalles del cambio de estado..."
                            className="min-h-[80px]"
                        />
                    </div>

                    {!canEdit && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                            <span>No tienes permisos para modificar el estado de esta inspección.</span>
                        </div>
                    )}

                    {transitionMutation.isError && (
                        <p className="text-xs font-medium text-destructive">
                            {transitionMutation.error instanceof Error
                                ? transitionMutation.error.message
                                : "Error al actualizar el estado de la inspección."}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={
                            !canEdit ||
                            !targetStatus ||
                            targetStatus === currentStatus ||
                            transitionMutation.isPending
                        }
                        className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
                    >
                        {transitionMutation.isPending ? "Actualizando estado..." : "Actualizar estado"}
                    </Button>
                </form>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">Bitácora histórica de transiciones</h4>
                    </div>

                    {historyQuery.isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : historyLogs.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                            No se registran transiciones previas en el historial.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2.5 md:hidden">
                                {historyLogs.map((log) => (
                                    <div key={log.id} className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {log.from_status ? formatInspectionStatus(log.from_status) : "Inicial"}
                                                </Badge>
                                                <span>➔</span>
                                                <Badge variant="default" className="text-[10px]">
                                                    {log.to_status ? formatInspectionStatus(log.to_status) : "Sin estado"}
                                                </Badge>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Autor: {log.actor_name ?? "Sistema"}</span>
                                        </div>
                                        {log.notes && (
                                            <p className="rounded bg-muted/40 p-2 text-foreground">
                                                {log.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto w-full md:block">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b bg-muted/30 text-muted-foreground">
                                        <tr>
                                            <th className="p-2.5 font-medium">Fecha</th>
                                            <th className="p-2.5 font-medium">Estado anterior</th>
                                            <th className="p-2.5 font-medium">Estado nuevo</th>
                                            <th className="p-2.5 font-medium">Autor</th>
                                            <th className="p-2.5 font-medium">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {historyLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/10">
                                                <td className="whitespace-nowrap p-2.5 text-muted-foreground">
                                                    {formatDateTime(log.created_at)}
                                                </td>
                                                <td className="whitespace-nowrap p-2.5">
                                                    <Badge variant="outline">
                                                        {log.from_status ? formatInspectionStatus(log.from_status) : "Inicial"}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap p-2.5">
                                                    <Badge variant="default">
                                                        {log.to_status ? formatInspectionStatus(log.to_status) : "Sin estado"}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap p-2.5 font-medium">
                                                    {log.actor_name ?? "Sistema"}
                                                </td>
                                                <td className="p-2.5 max-w-xs truncate text-muted-foreground">
                                                    {log.notes ?? "Sin observaciones"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
