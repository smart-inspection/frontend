import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, FileText, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useCurrentUserQuery } from "@/features/auth/api/auth.queries"
import { useInspectionsQuery } from "@/features/inspections/api/inspections.queries"
import { useInspectionDraftsQuery } from "@/features/inspections/api/inspections.queries"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"
import type { Inspection } from "@/features/inspections/types/inspections.types"

function InspectionReportRow({ inspection }: { inspection: Inspection }) {
    const drafts_query = useInspectionDraftsQuery(inspection.id)
    const drafts = drafts_query.data ?? []

    const latest_draft = drafts.at(-1)
    const report_status = latest_draft?.status ?? null
    const draft_count = drafts.length

    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link
                    to={`/inspections/${inspection.id}`}
                    className="hover:underline hover:text-primary"
                >
                    {inspection.code}
                </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {inspection.client_name}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
                {inspection.responsible_inspector ?? "Sin asignar"}
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatInspectionDate(inspection.inspection_date)}
            </TableCell>
            <TableCell>
                <Badge variant={getInspectionStatusVariant(inspection.status)}>
                    {formatInspectionStatus(inspection.status)}
                </Badge>
            </TableCell>
            <TableCell>
                {report_status ? (
                    <Badge variant={getInspectionStatusVariant(report_status)}>
                        {formatInspectionStatus(report_status)}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">Sin informe</span>
                )}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center text-sm">
                {draft_count > 0 ? draft_count : "—"}
            </TableCell>
            <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                    <Link to={`/inspections/${inspection.id}`}>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    )
}

export function ReportsPage() {
    const { data: current_user } = useCurrentUserQuery()
    const { data: inspections = [], isLoading, isError } = useInspectionsQuery()

    const [search, set_search] = useState("")
    const [status_filter, set_status_filter] = useState("")

    const is_inspector = current_user?.role === "inspector"

    const filtered = useMemo(() => {
        let result = inspections

        if (is_inspector && current_user?.full_name) {
            result = result.filter(
                (i) =>
                    i.responsible_inspector
                        ?.toLowerCase()
                        .includes(current_user.full_name.toLowerCase()),
            )
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter(
                (i) =>
                    i.code.toLowerCase().includes(q) ||
                    i.client_name.toLowerCase().includes(q) ||
                    i.responsible_inspector?.toLowerCase().includes(q),
            )
        }

        if (status_filter) {
            result = result.filter(
                (i) => i.status.toLowerCase() === status_filter.toLowerCase(),
            )
        }

        return result
    }, [inspections, is_inspector, current_user, search, status_filter])

    const STATUS_OPTIONS = [
        { value: "", label: "Todos los estados" },
        { value: "draft", label: "Borrador" },
        { value: "in_review", label: "En revisión" },
        { value: "observed", label: "Observado" },
        { value: "finalized", label: "Finalizado" },
    ]

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    <FileText className="h-5 w-5" />
                    {is_inspector ? "Mis informes" : "Informes y trazabilidad"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {is_inspector
                        ? "Informes de tus inspecciones asignadas con su estado actual."
                        : "Listado global de inspecciones con estado del informe y trazabilidad de cambios."}
                </p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Buscar por código, cliente o inspector…"
                            value={search}
                            onChange={(e) => set_search(e.target.value)}
                        />
                    </div>

                    <select
                        value={status_filter}
                        onChange={(e) => set_status_filter(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">
                        {filtered.length} inspección
                        {filtered.length !== 1 ? "es" : ""}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="hidden sm:table-cell">Inspector</TableHead>
                                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                                <TableHead>Estado inspección</TableHead>
                                <TableHead>Estado informe</TableHead>
                                <TableHead className="hidden lg:table-cell text-center">
                                    Borradores
                                </TableHead>
                                <TableHead className="text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Cargando informes…
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center text-sm text-destructive"
                                    >
                                        No se pudo cargar el listado de informes.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
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
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    )
}

export default ReportsPage