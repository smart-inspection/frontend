import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    ArrowRight,
    Download,
    FileText,
    History,
    Loader2,
    Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { useAdminUsersQuery } from "@/features/admin/api/admin.queries"
import { useCurrentUserQuery } from "@/features/auth/api/auth.queries"
import { downloadReportFile } from "@/features/inspections/api/inspections.api"
import {
    useInspectionDraftsQuery,
    useInspectionsQuery,
} from "@/features/inspections/api/inspections.queries"
import { InspectionSummaryTab } from "@/features/inspections/components/inspection-summary-tab"
import type { Inspection, ReportDraft } from "@/features/inspections/types/inspections.types"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
    get_inspector_display_name,
} from "@/features/inspections/types/inspections.utils"
import { formatDateTime } from "@/features/inspections/utils/inspection-detail.utils"

const STATUS_FILTERS = [
    { value: "", label: "Todos" },
    { value: "draft", label: "Borrador" },
    { value: "in_review", label: "En revisión" },
    { value: "observed", label: "Observado" },
    { value: "approved", label: "Aprobado" },
    { value: "finalized", label: "Finalizado" },
]

function InspectionReportCard({
    inspection,
    inspectors,
    onOpenTraceability,
    downloadingKey,
    onDownload,
}: {
    inspection: Inspection
    inspectors: { id: number; full_name: string }[]
    onOpenTraceability: (inspection: Inspection, draft: ReportDraft | null) => void
    downloadingKey: string | null
    onDownload: (inspectionId: number, draftId: number | null, format: "pdf" | "docx") => void
}) {
    const drafts_query = useInspectionDraftsQuery(inspection.id)
    const drafts = drafts_query.data ?? []
    const latest_draft = drafts.at(-1) ?? null

    const isPdfDownloading = downloadingKey === `${inspection.id}-pdf`
    const isDocxDownloading = downloadingKey === `${inspection.id}-docx`

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <Link
                            to={`/inspections/${inspection.id}`}
                            className="truncate text-base font-semibold text-foreground hover:underline hover:text-primary"
                        >
                            {inspection.code}
                        </Link>
                        <p className="truncate text-sm text-muted-foreground">
                            {inspection.client_name}
                        </p>
                    </div>

                    <Badge variant={getInspectionStatusVariant(inspection.status)}>
                        {formatInspectionStatus(inspection.status)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-sm">
                <div className="grid gap-1.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Inspector:</span>
                        <span className="truncate max-w-[60%] text-right">
                            {get_inspector_display_name(inspectors, inspection.responsible_inspector_id)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Fecha:</span>
                        <span>{formatInspectionDate(inspection.inspection_date)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Última modificación:</span>
                        <span>{formatDateTime(inspection.updated_at)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(inspection.id, latest_draft?.id ?? null, "pdf")}
                        disabled={isPdfDownloading || !latest_draft}
                        className="min-h-[44px] flex-1 text-xs"
                    >
                        {isPdfDownloading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        PDF
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(inspection.id, latest_draft?.id ?? null, "docx")}
                        disabled={isDocxDownloading || !latest_draft}
                        className="min-h-[44px] flex-1 text-xs"
                    >
                        {isDocxDownloading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        DOCX
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenTraceability(inspection, latest_draft)}
                        className="min-h-[44px] flex-1 text-xs"
                    >
                        <History className="h-3.5 w-3.5" />
                        Estado
                    </Button>

                    <Button asChild variant="ghost" size="sm" className="min-h-[44px]">
                        <Link to={`/inspections/${inspection.id}`}>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function InspectionReportRow({
    inspection,
    inspectors,
    onOpenTraceability,
    downloadingKey,
    onDownload,
}: {
    inspection: Inspection
    inspectors: { id: number; full_name: string }[]
    onOpenTraceability: (inspection: Inspection, draft: ReportDraft | null) => void
    downloadingKey: string | null
    onDownload: (inspectionId: number, draftId: number | null, format: "pdf" | "docx") => void
}) {
    const drafts_query = useInspectionDraftsQuery(inspection.id)
    const drafts = drafts_query.data ?? []
    const latest_draft = drafts.at(-1) ?? null

    const isPdfDownloading = downloadingKey === `${inspection.id}-pdf`
    const isDocxDownloading = downloadingKey === `${inspection.id}-docx`

    return (
        <TableRow>
            <TableCell className="font-medium whitespace-nowrap">
                <Link
                    to={`/inspections/${inspection.id}`}
                    className="hover:underline hover:text-primary"
                >
                    {inspection.code}
                </Link>
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">
                {inspection.client_name}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                {get_inspector_display_name(inspectors, inspection.responsible_inspector_id)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                {formatInspectionDate(inspection.inspection_date)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <Badge variant={getInspectionStatusVariant(inspection.status)}>
                    {formatInspectionStatus(inspection.status)}
                </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                {formatDateTime(inspection.updated_at)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(inspection.id, latest_draft?.id ?? null, "pdf")}
                        disabled={isPdfDownloading || !latest_draft}
                        className="min-h-[44px] min-w-[44px] px-2.5 text-xs"
                        title={latest_draft ? "Descargar informe PDF" : "Sin borrador generado"}
                    >
                        {isPdfDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        <span className="hidden xl:inline ml-1">PDF</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(inspection.id, latest_draft?.id ?? null, "docx")}
                        disabled={isDocxDownloading || !latest_draft}
                        className="min-h-[44px] min-w-[44px] px-2.5 text-xs"
                        title={latest_draft ? "Descargar informe DOCX" : "Sin borrador generado"}
                    >
                        {isDocxDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        <span className="hidden xl:inline ml-1">DOCX</span>
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenTraceability(inspection, latest_draft)}
                        className="min-h-[44px] min-w-[44px] px-2.5 text-xs"
                        title="Ver trazabilidad y cambiar estado"
                    >
                        <History className="h-4 w-4" />
                        <span className="hidden xl:inline ml-1">Trazabilidad</span>
                    </Button>

                    <Button asChild variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                        <Link to={`/inspections/${inspection.id}`} title="Ver detalle de inspección">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export function ReportsPage() {
    const { data: current_user } = useCurrentUserQuery()
    const { data: inspectors = [] } = useAdminUsersQuery()
    const { data: inspections = [], isLoading, isError } = useInspectionsQuery()

    const [search, set_search] = useState("")
    const [status_filter, set_status_filter] = useState("")
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
    const [selectedInspection, setSelectedInspection] = useState<{
        inspection: Inspection
        draft: ReportDraft | null
    } | null>(null)

    const is_inspector = current_user?.role === "inspector"

    const filtered = useMemo(() => {
        let result = inspections

        if (is_inspector && current_user?.id) {
            result = result.filter(
                (i) => i.responsible_inspector_id === current_user.id,
            )
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter(
                (i) =>
                    i.code.toLowerCase().includes(q) ||
                    i.client_name.toLowerCase().includes(q) ||
                    get_inspector_display_name(inspectors, i.responsible_inspector_id)
                        .toLowerCase()
                        .includes(q),
            )
        }

        if (status_filter) {
            result = result.filter(
                (i) => i.status.toLowerCase() === status_filter.toLowerCase(),
            )
        }

        return result
    }, [inspections, is_inspector, current_user, search, status_filter, inspectors])

    const handleDownload = async (
        inspectionId: number,
        draftId: number | null,
        format: "pdf" | "docx",
    ) => {
        const key = `${inspectionId}-${format}`
        try {
            setDownloadingKey(key)
            const targetId = draftId ?? inspectionId
            await downloadReportFile(targetId, format)
        } finally {
            setDownloadingKey(null)
        }
    }

    const handleOpenTraceability = (inspection: Inspection, draft: ReportDraft | null) => {
        setSelectedInspection({ inspection, draft })
    }

    const can_edit =
        current_user?.role === "admin" ||
        (current_user?.role === "inspector" &&
            selectedInspection?.inspection.responsible_inspector_id === current_user?.id)

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    <FileText className="h-5 w-5" />
                    {is_inspector ? "Mis informes" : "Informes y trazabilidad"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {is_inspector
                        ? "Centro de control operativo de tus informes asignados con trazabilidad y descarga directa."
                        : "Panel integral de gestión de estados, trazabilidad operativa y descarga autenticada de informes."}
                </p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="space-y-3 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 min-h-[44px]"
                                placeholder="Buscar por código, cliente o inspector…"
                                value={search}
                                onChange={(e) => set_search(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-medium text-muted-foreground mr-1">
                            Estado:
                        </span>
                        {STATUS_FILTERS.map((opt) => {
                            const is_active = status_filter === opt.value
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => set_status_filter(opt.value)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                                        is_active
                                            ? "border border-primary bg-primary text-primary-foreground"
                                            : "border border-border/80 bg-background text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">
                        {filtered.length} inspección{filtered.length !== 1 ? "es" : ""}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 md:hidden">
                        {isLoading ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Cargando informes…
                            </div>
                        ) : isError ? (
                            <div className="py-8 text-center text-sm text-destructive">
                                No se pudo cargar el listado de informes.
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No hay inspecciones que coincidan con los filtros.
                            </div>
                        ) : (
                            filtered.map((inspection) => (
                                <InspectionReportCard
                                    key={inspection.id}
                                    inspection={inspection}
                                    inspectors={inspectors}
                                    onOpenTraceability={handleOpenTraceability}
                                    downloadingKey={downloadingKey}
                                    onDownload={handleDownload}
                                />
                            ))
                        )}
                    </div>

                    <div className="hidden md:block w-full overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="hidden sm:table-cell">Inspector</TableHead>
                                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                                    <TableHead>Estado actual</TableHead>
                                    <TableHead className="hidden lg:table-cell">Última modificación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            Cargando informes…
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-sm text-destructive"
                                        >
                                            No se pudo cargar el listado de informes.
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No hay inspecciones que coincidan con los filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((inspection) => (
                                        <InspectionReportRow
                                            key={inspection.id}
                                            inspection={inspection}
                                            inspectors={inspectors}
                                            onOpenTraceability={handleOpenTraceability}
                                            downloadingKey={downloadingKey}
                                            onDownload={handleDownload}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Sheet
                open={!!selectedInspection}
                onOpenChange={(open) => !open && setSelectedInspection(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-xl overflow-y-auto p-4 sm:p-6"
                >
                    <SheetHeader className="space-y-1 mb-4">
                        <SheetTitle className="text-lg">
                            Trazabilidad y Estado: {selectedInspection?.inspection.code}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedInspection?.inspection.client_name} — {selectedInspection?.inspection.equipment_type}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedInspection && (
                        <div className="space-y-4">
                            <InspectionSummaryTab
                                inspection={selectedInspection.inspection}
                                selectedDraft={selectedInspection.draft}
                                canEdit={can_edit}
                                currentRole={current_user?.role}
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </section>
    )
}

export default ReportsPage