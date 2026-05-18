import { Link } from "react-router-dom"
import {
    ArrowLeft,
    CalendarDays,
    ClipboardCheck,
    FileAudio,
    FileText,
    Image as ImageIcon,
    MapPin,
    UserRound,
    Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import type { Inspection } from "../types/inspections.types"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "../types/inspections.utils"
import { InspectionMetricCard } from "./inspection-metric-card"

type InspectionDetailHeaderProps = {
    inspection: Inspection
    fieldsCount: number
    evidencesCount: number
    transcriptionsCount: number
    draftsCount: number
}

export function InspectionDetailHeader({
                                           inspection,
                                           fieldsCount,
                                           evidencesCount,
                                           transcriptionsCount,
                                           draftsCount,
                                       }: InspectionDetailHeaderProps) {
    return (
        <header className="space-y-4">
            <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
                <Link to="/inspections">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
            </Button>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">Inspección #{inspection.id}</Badge>
                                <Badge variant={getInspectionStatusVariant(inspection.status)}>
                                    {formatInspectionStatus(inspection.status)}
                                </Badge>
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {inspection.code}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {inspection.client_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            <span>
                {inspection.equipment_type} · {inspection.inspection_type}
              </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatInspectionDate(inspection.inspection_date)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{inspection.location || "Ubicación no registrada"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4" />
                            <span>
                {inspection.responsible_inspector || "Inspector no asignado"}
              </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InspectionMetricCard
                        label="Campos"
                        value={fieldsCount}
                        hint="Estructurados y validados"
                        icon={ClipboardCheck}
                    />
                    <InspectionMetricCard
                        label="Evidencias"
                        value={evidencesCount}
                        hint="Imágenes o archivos"
                        icon={ImageIcon}
                    />
                    <InspectionMetricCard
                        label="Transcripciones"
                        value={transcriptionsCount}
                        hint="Audio procesado"
                        icon={FileAudio}
                    />
                    <InspectionMetricCard
                        label="Informes"
                        value={draftsCount}
                        hint="Borradores disponibles"
                        icon={FileText}
                    />
                </CardContent>
            </Card>
        </header>
    )
}