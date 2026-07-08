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
import { useAdminUsersQuery } from "@/features/admin/api/admin.queries"
import { useInspectionsQuery } from "@/features/inspections/api/inspections.queries"
import { useInspectionDraftsQuery } from "@/features/inspections/api/inspections.queries"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"
import type { Inspection } from "@/features/inspections/types/inspections.types"
import type { AdminUser } from "@/features/admin/types/admin.types"

function InspectionReportRow({
                                 inspection,
                                 inspectorName,
                             }: {
    inspection: Inspection
    inspectorName: string | null
}) {
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
                {inspectorName ?? "Sin asignar"}
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

function resolve_inspector_name(
    inspection: Inspection,
    admin_users: AdminUser[],
): string | null {
    if (!inspection.responsible_inspector_id) return null
    return (
        admin_users.find((user) => user.id === inspection.responsible_inspector_id)
            ?.full_name ?? null
    )
}

export function ReportsPage() {
    const { data: current_user } = useCurrentUserQuery()
    const { data: inspections = [], isLoading, isError } = useInspectionsQuery()
    const { data: admin_users = [] } = useAdminUsersQuery()

    const [search, set_search] = useState("")
    const [status_filter, set_status_filter] = useState("")

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
            result = result.filter((i) => {
                const inspector_name = resolve_inspector_name(i, admin_users)
                return (
                    i.code.toLowerCase().includes(q) ||
                    i.client_name.toLowerCase().includes(q) ||
                    (inspector_name?.toLowerCase().includes(q) ?? false)
                )
            })
        }

        if (status_filter) {
            result = result.filter(
                (i) => i.status.toLowerCase() === status_filter.toLowerCase(),
            )
        }

        return result
    }, [inspections, is_inspector, current_user, search, status_filter, admin_users])

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
                    Informes de inspección
                </h1>
                <p className="text-sm text-muted-foreground">
                    Consulta el estado de los informes generados a partir de las inspecciones registradas.
                </p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => set_search(e.target.value)}
                            placeholder="Buscar por código, cliente o inspector"
                            className="pl-8"
                        />
                    </div>
                    <select
                        value={status_filter}
                        onChange={(e) => set_status_filter(e.target.value)}
                        className="flex h-9 w-full sm:w-56 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Inspecciones e informes</CardTitle>
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
                                <TableHead className="hidden lg:table-cell text-center">Borradores</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                                        Cargando informes...
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-6 text-center text-sm text-destructive">
                                        No se pudo cargar la lista de inspecciones.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                                        No hay inspecciones que coincidan con el filtro.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((inspection) => (
                                    <InspectionReportRow
                                        key={inspection.id}
                                        inspection={inspection}
                                        inspectorName={resolve_inspector_name(inspection, admin_users)}
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