import { useState } from "react"
import {
    AlertCircle,
    Clock,
    History,
    Loader2,
    ShieldAlert,
    X,
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

import {
    useReportHistoryQuery,
    useTransitionInspectionStatusMutation,
} from "@/features/inspections/api/inspections.queries"
import type {
    Inspection,
    ReportDraft,
} from "@/features/inspections/types/inspections.types"
import {
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"
import { formatDateTime } from "@/features/inspections/utils/inspection-detail.utils"

export interface TransitionOption {
    to_status: string
    label: string
    variant?: "default" | "outline" | "destructive" | "secondary"
    requireComment?: boolean
}

export const TRANSITIONS_BY_STATUS: Record<string, TransitionOption[]> = {
    draft: [
        { to_status: "in_review", label: "Enviar a revisión", variant: "default" },
    ],
    in_review: [
        { to_status: "approved", label: "Aprobar informe", variant: "default" },
        { to_status: "observed", label: "Observar informe", variant: "destructive", requireComment: true },
        { to_status: "rejected", label: "Rechazar informe", variant: "destructive", requireComment: true },
    ],
    observed: [
        { to_status: "in_review", label: "Reenviar a revisión", variant: "default" },
        { to_status: "draft", label: "Volver a borrador", variant: "outline" },
    ],
    rejected: [
        { to_status: "draft", label: "Reabrir borrador", variant: "outline" },
    ],
    approved: [
        { to_status: "finalized", label: "Finalizar informe", variant: "default" },
    ],
    finalized: [],
}

interface InspectionSummaryTabProps {
    inspection: Inspection
    selectedDraft?: ReportDraft | null
    canEdit?: boolean
    currentRole?: string
}

export function InspectionSummaryTab({
    inspection,
    selectedDraft,
    canEdit = true,
    currentRole,
}: InspectionSummaryTabProps) {
    const [selectedTransition, setSelectedTransition] = useState<TransitionOption | null>(null)
    const [comment, setComment] = useState("")
    const [validationError, setValidationError] = useState<string | null>(null)

    const currentStatus = inspection?.status?.toLowerCase() ?? "draft"
    const isInspector = currentRole === "inspector"

    const transitionMutation = useTransitionInspectionStatusMutation(inspection.id)
    const historyQuery = useReportHistoryQuery(selectedDraft?.id ?? 0, 50)
    const historyLogs = historyQuery.data ?? []

    const availableTransitions = (TRANSITIONS_BY_STATUS[currentStatus] ?? []).filter((opt) => {
        if (isInspector && (opt.to_status === "finalized" || opt.to_status === "approved")) {
            return false
        }
        return true
    })

    const handleOpenModal = (opt: TransitionOption) => {
        setSelectedTransition(opt)
        setComment("")
        setValidationError(null)
    }

    const handleCloseModal = () => {
        if (transitionMutation.isPending) return
        setSelectedTransition(null)
        setComment("")
        setValidationError(null)
    }

    const handleConfirmTransition = () => {
        if (!selectedTransition) return

        if (selectedTransition.requireComment && !comment.trim()) {
            setValidationError("El comentario o motivo es obligatorio para esta acción.")
            return
        }

        transitionMutation.mutate(
            {
                to_status: selectedTransition.to_status,
                notes: comment.trim() || undefined,
            },
            {
                onSuccess: () => {
                    handleCloseModal()
                },
            },
        )
    }

    return (
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Clock className="h-4 w-4 text-primary" />
                                Estado actual y ciclo de vida
                            </CardTitle>
                            <CardDescription>
                                Supervisión y control operativo de la inspección técnica.
                            </CardDescription>
                        </div>
                        <Badge
                            variant={getInspectionStatusVariant(currentStatus)}
                            className="self-start px-3 py-1.5 text-xs font-semibold sm:self-auto"
                        >
                            {formatInspectionStatus(currentStatus)}
                        </Badge>
                    </div>

                    <div className="pt-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Transiciones disponibles
                        </p>

                        {!canEdit ? (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                                <span>No cuentas con permisos para ejecutar transiciones en esta inspección.</span>
                            </div>
                        ) : availableTransitions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                No hay transiciones disponibles para el estado actual ({formatInspectionStatus(currentStatus)}).
                            </p>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                {availableTransitions.map((option) => (
                                    <Button
                                        key={option.to_status}
                                        type="button"
                                        variant={option.variant ?? "default"}
                                        onClick={() => handleOpenModal(option)}
                                        className="min-h-[44px] px-4 font-medium"
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base font-semibold">
                            Historial de auditoría y trazabilidad
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Registro cronológico de cambios de estado y observaciones registradas.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {historyQuery.isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : historyLogs.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                            No se registran cambios de estado previos en la auditoría.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 md:hidden">
                                {historyLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-lg border bg-card p-3 text-xs space-y-2 shadow-xs"
                                    >
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
                                        <div className="text-muted-foreground">
                                            <span className="font-medium text-foreground">Responsable:</span>{" "}
                                            {log.actor_name ?? "Sistema"}
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
                                            <th className="p-3 font-medium">Fecha y hora</th>
                                            <th className="p-3 font-medium">Estado anterior</th>
                                            <th className="p-3 font-medium">Nuevo estado</th>
                                            <th className="p-3 font-medium">Usuario responsable</th>
                                            <th className="p-3 font-medium">Comentarios / Justificación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {historyLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/10">
                                                <td className="whitespace-nowrap p-3 text-muted-foreground">
                                                    {formatDateTime(log.created_at)}
                                                </td>
                                                <td className="whitespace-nowrap p-3">
                                                    <Badge variant="outline">
                                                        {log.from_status ? formatInspectionStatus(log.from_status) : "Inicial"}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap p-3">
                                                    <Badge variant="default">
                                                        {log.to_status ? formatInspectionStatus(log.to_status) : "Sin estado"}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap p-3 font-medium text-foreground">
                                                    {log.actor_name ?? "Sistema"}
                                                </td>
                                                <td className="p-3 max-w-sm truncate text-muted-foreground">
                                                    {log.notes ?? "Sin observaciones registradas"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedTransition && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-foreground">
                                Confirmar cambio de estado
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={transitionMutation.isPending}
                                className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            ¿Estás seguro de cambiar el estado de{" "}
                            <span className="font-semibold text-foreground">
                                {formatInspectionStatus(currentStatus)}
                            </span>{" "}
                            a{" "}
                            <span className="font-semibold text-foreground">
                                {formatInspectionStatus(selectedTransition.to_status)}
                            </span>
                            ?
                        </p>

                        <div className="space-y-1.5">
                            <Label htmlFor="transition-comment" className="text-xs font-semibold">
                                Comentario / Motivo{" "}
                                {selectedTransition.requireComment ? (
                                    <span className="text-destructive">*</span>
                                ) : (
                                    <span className="text-muted-foreground font-normal">(opcional)</span>
                                )}
                            </Label>
                            <Textarea
                                id="transition-comment"
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value)
                                    if (validationError) setValidationError(null)
                                }}
                                placeholder="Ingresa una justificación técnica o comentario del cambio..."
                                className="min-h-[90px]"
                                disabled={transitionMutation.isPending}
                            />
                            {validationError && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    {validationError}
                                </p>
                            )}
                        </div>

                        {transitionMutation.isError && (
                            <p className="text-xs text-destructive">
                                {transitionMutation.error instanceof Error
                                    ? transitionMutation.error.message
                                    : "Error al registrar la transición de estado."}
                            </p>
                        )}

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={transitionMutation.isPending}
                                className="min-h-[44px]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant={selectedTransition.variant ?? "default"}
                                onClick={handleConfirmTransition}
                                disabled={transitionMutation.isPending}
                                className="min-h-[44px]"
                            >
                                {transitionMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Confirmar cambio"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}