import { useMemo, useState } from "react"
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    Filter,
    ListChecks,
    UserRound,
} from "lucide-react"

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
import { useCurrentUserQuery } from "@/features/auth/api/auth.queries"
import { useProductivityDashboardQuery } from "@/features/productivity/api/productivity.queries"

function format_minutes(value: number) {
    return `${value.toFixed(1)} min`
}

const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendiente" },
    { value: "in_progress", label: "En proceso" },
    { value: "blocked", label: "Bloqueado" },
    { value: "completed", label: "Completado" },
]

function format_status_label(status: string) {
    switch (status) {
        case "pending": return "Pendiente"
        case "in_progress": return "En proceso"
        case "blocked": return "Bloqueado"
        case "completed": return "Completado"
        default: return status || "Sin estado"
    }
}

function get_status_variant(status: string) {
    switch (status) {
        case "completed": return "default" as const
        case "blocked": return "destructive" as const
        case "in_progress": return "secondary" as const
        default: return "outline" as const
    }
}

const MIN_START_OFFSET_DAYS = 30
const MAX_END_OFFSET_DAYS = 180

function format_date_input(date: Date) {
    return date.toISOString().slice(0, 10)
}

function get_date_bounds() {
    const today = new Date()
    const min_date = new Date(today)
    min_date.setDate(min_date.getDate() - MIN_START_OFFSET_DAYS)
    const max_date = new Date(today)
    max_date.setDate(max_date.getDate() + MAX_END_OFFSET_DAYS)
    return {
        min: format_date_input(min_date),
        max: format_date_input(max_date),
    }
}

function validate_date_range(
    start: string,
    end: string,
    bounds: { min: string; max: string },
) {
    if (start && (start < bounds.min || start > bounds.max)) {
        return `La fecha de inicio debe estar entre ${bounds.min} y ${bounds.max}.`
    }
    if (end && (end < bounds.min || end > bounds.max)) {
        return `La fecha de fin debe estar entre ${bounds.min} y ${bounds.max}.`
    }
    if (start && end && end < start) {
        return "La fecha de fin no puede ser anterior a la fecha de inicio."
    }
    return null
}

export function DashboardPage() {
    const { data: current_user } = useCurrentUserQuery()

    const is_inspector = current_user?.role === "inspector"
    const is_admin_or_viewer =
        current_user?.role === "admin" || current_user?.role === "viewer"

    const [draft_start_date, set_draft_start_date] = useState("")
    const [draft_end_date, set_draft_end_date] = useState("")
    const [draft_inspector, set_draft_inspector] = useState("")
    const [draft_status, set_draft_status] = useState("")
    const [date_error, set_date_error] = useState<string | null>(null)

    const date_bounds = useMemo(() => get_date_bounds(), [])

    function handle_start_date_change(value: string) {
        set_draft_start_date(value)
        set_date_error(validate_date_range(value, draft_end_date, date_bounds))
    }

    function handle_end_date_change(value: string) {
        set_draft_end_date(value)
        set_date_error(validate_date_range(draft_start_date, value, date_bounds))
    }

    const resolved_inspector = is_inspector
        ? (current_user?.full_name ?? "")
        : draft_inspector

    const filters = useMemo(
        () => ({
            startDate: !date_error && draft_start_date ? draft_start_date : undefined,
            endDate: !date_error && draft_end_date ? draft_end_date : undefined,
            inspector: resolved_inspector || undefined,
            operationalStatus: draft_status || undefined,
        }),
        [draft_start_date, draft_end_date, resolved_inspector, draft_status, date_error],
    )

    const { data, isLoading, isError, error } = useProductivityDashboardQuery(filters)

    const summary = data?.summary
    const by_inspector = data?.byInspector ?? []
    const by_status = data?.byStatus ?? []

    const inspector_options = useMemo(() => {
        const unique_names = Array.from(
            new Set(
                by_inspector
                    .map((item) => item.inspectorName?.trim())
                    .filter((value): value is string => Boolean(value)),
            ),
        )
        return unique_names.sort((a, b) => a.localeCompare(b, "es"))
    }, [by_inspector])

    const reports_outside_goal = summary
        ? Math.max(summary.completedReports - summary.onTimeCount, 0)
        : 0

    function handle_clear_filters() {
        set_draft_start_date("")
        set_draft_end_date("")
        if (!is_inspector) set_draft_inspector("")
        set_draft_status("")
        set_date_error(null)
    }

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {is_inspector
                        ? `Mi productividad`
                        : "Productividad operativa"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {is_inspector
                        ? `Tus métricas e inspecciones asignadas, ${current_user?.full_name}.`
                        : "Monitorea tiempos de informe, cumplimiento de meta y carga operativa por inspector."}
                </p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" />
                        Filtros operativos
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha inicio</label>
                        <Input
                            type="date"
                            value={draft_start_date}
                            min={date_bounds.min}
                            max={date_bounds.max}
                            onChange={(e) => handle_start_date_change(e.target.value)}
                            className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha fin</label>
                        <Input
                            type="date"
                            value={draft_end_date}
                            min={draft_start_date || date_bounds.min}
                            max={date_bounds.max}
                            onChange={(e) => handle_end_date_change(e.target.value)}
                            className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>

                    {is_admin_or_viewer ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Inspector</label>
                            <select
                                value={draft_inspector}
                                onChange={(e) => set_draft_inspector(e.target.value)}
                                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                                <option value="">Todos</option>
                                {inspector_options.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Inspector</label>
                            <div className="flex h-9 w-full items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                                {current_user?.full_name}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estado operativo</label>
                        <select
                            value={draft_status}
                            onChange={(e) => set_draft_status(e.target.value)}
                            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {date_error ? (
                        <div className="sm:col-span-2 xl:col-span-4">
                            <p className="text-xs text-destructive">{date_error}</p>
                        </div>
                    ) : null}

                    <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handle_clear_filters}
                            className="inline-flex h-9 items-center rounded-lg border border-input px-3 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </CardContent>
            </Card>

            {isError ? (
                <Card className="border-destructive/30 shadow-sm">
                    <CardContent className="py-6">
                        <div className="flex items-start gap-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="font-medium">No se pudo cargar el dashboard.</p>
                                <p className="text-muted-foreground">
                                    {error instanceof Error
                                        ? error.message
                                        : "Ocurrió un error al consultar productividad."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* KPIs */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Tiempo promedio</CardTitle>
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary
                                ? "--"
                                : format_minutes(summary.averageReportMinutes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Promedio de elaboración de informes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Inspecciones evaluadas
                        </CardTitle>
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary ? "--" : summary.totalInspections}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Registros incluidos en el rango consultado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Cumplimiento de meta</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary
                                ? "--"
                                : `${summary.onTimePercentage.toFixed(1)}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes dentro de la meta de {summary?.goalMinutes ?? 20} minutos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Fuera de meta</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary ? "--" : reports_outside_goal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes que superaron la meta operativa
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tablas */}
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserRound className="h-4 w-4" />
                            {is_inspector ? "Mis estadísticas" : "Productividad por inspector"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {!is_inspector && <TableHead>Inspector</TableHead>}
                                    <TableHead>Asignadas</TableHead>
                                    <TableHead>Completadas</TableHead>
                                    <TableHead>Promedio</TableHead>
                                    <TableHead>Cumplimiento</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={is_inspector ? 4 : 5}
                                            className="py-6 text-center text-sm text-muted-foreground"
                                        >
                                            Cargando productividad...
                                        </TableCell>
                                    </TableRow>
                                ) : by_inspector.length ? (
                                    by_inspector.map((item) => (
                                        <TableRow key={item.inspectorName}>
                                            {!is_inspector && (
                                                <TableCell className="font-medium">
                                                    {item.inspectorName}
                                                </TableCell>
                                            )}
                                            <TableCell>{item.assignedInspections}</TableCell>
                                            <TableCell>{item.completedReports}</TableCell>
                                            <TableCell>
                                                {format_minutes(item.averageReportMinutes)}
                                            </TableCell>
                                            <TableCell>
                                                {item.onTimePercentage.toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={is_inspector ? 4 : 5}
                                            className="py-6 text-center text-sm text-muted-foreground"
                                        >
                                            No hay registros para los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Estado de inspecciones</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">Cargando estados...</p>
                        ) : by_status.length ? (
                            by_status.map((item) => (
                                <div
                                    key={item.operationalStatus}
                                    className="flex items-center justify-between rounded-xl border px-3 py-3"
                                >
                                    <Badge variant={get_status_variant(item.operationalStatus)}>
                                        {format_status_label(item.operationalStatus)}
                                    </Badge>
                                    <span className="text-sm font-semibold">{item.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No hay estados operativos para mostrar.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default DashboardPage