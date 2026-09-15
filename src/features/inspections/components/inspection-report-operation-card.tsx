import { CheckCircle2, Clock3, PlayCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { REPORT_GOAL_MINUTES } from "@/features/inspections/hooks/useReportTimer"
import type { ReportDraft } from "@/features/inspections/types/inspections.types"
import {
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"

interface InspectionReportOperationCardProps {
    selectedDraft: ReportDraft | null
    visualReportStatus: string
    reportStartedAt: string | null
    reportDurationMinutes: number | null
    liveElapsedLabel: string | null
    isOverGoal: boolean
    canStartReport: boolean
    canFinishReport: boolean
    isStartingReport: boolean
    isFinishingReport: boolean
    onStartReport: () => void
    onFinishReport: () => void
}

export function InspectionReportOperationCard({
    selectedDraft,
    visualReportStatus,
    reportStartedAt,
    reportDurationMinutes,
    liveElapsedLabel,
    isOverGoal,
    canStartReport,
    canFinishReport,
    isStartingReport,
    isFinishingReport,
    onStartReport,
    onFinishReport,
}: InspectionReportOperationCardProps) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        Operación del informe
                    </CardTitle>
                    <CardDescription>
                        Controla el inicio y cierre del informe técnico desde la inspección.
                    </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={onStartReport}
                        disabled={!canStartReport}
                        className="min-h-[44px]"
                    >
                        <PlayCircle className="h-4 w-4" />
                        {isStartingReport ? "Iniciando..." : "Iniciar informe"}
                    </Button>

                    <Button
                        onClick={onFinishReport}
                        disabled={!canFinishReport}
                        className="min-h-[44px]"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {isFinishingReport ? "Finalizando..." : "Finalizar informe"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Borrador activo
                    </p>
                    <p className="mt-1 text-sm font-medium">
                        {selectedDraft ? `Draft #${selectedDraft.id}` : "No disponible"}
                    </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Estado actual
                    </p>
                    <div className="mt-2">
                        <Badge variant={getInspectionStatusVariant(visualReportStatus)}>
                            {formatInspectionStatus(visualReportStatus)}
                        </Badge>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Inicio del informe
                    </p>
                    <p className="mt-1 text-sm font-medium">
                        {reportStartedAt
                            ? new Date(reportStartedAt).toLocaleString("es-PE")
                            : "Pendiente"}
                    </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Duración acumulada
                    </p>

                    <p className={`mt-1 text-sm font-medium ${isOverGoal ? "text-destructive" : ""}`}>
                        {liveElapsedLabel
                            ? `${liveElapsedLabel} min`
                            : reportDurationMinutes !== null
                                ? `${reportDurationMinutes} min`
                                : "No iniciada"}
                    </p>

                    <p className={`mt-1 text-xs ${isOverGoal ? "text-destructive" : "text-muted-foreground"}`}>
                        {liveElapsedLabel
                            ? isOverGoal
                                ? "Superó la meta operativa de 20 min"
                                : "Contador en vivo del informe en proceso"
                            : reportDurationMinutes !== null
                                ? reportDurationMinutes <= REPORT_GOAL_MINUTES
                                    ? "Cumple meta de 20 min"
                                    : "Fuera de meta de 20 min"
                                : "La meta se calcula al finalizar"}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
