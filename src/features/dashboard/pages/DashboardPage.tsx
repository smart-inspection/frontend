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
import { useProductivityDashboardQuery } from "@/features/productivity/api/productivity.queries"

function formatMinutes(value: number) {
    return `${value.toFixed(1)} min`
}

const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendiente" },
    { value: "in_progress", label: "En proceso" },
    { value: "blocked", label: "Bloqueado" },
    { value: "completed", label: "Completado" },
]

function formatOperationalStatusLabel(status: string) {
    switch (status) {
        case "pending":
            return "Pendiente"
        case "in_progress":
            return "En proceso"
        case "blocked":
            return "Bloqueado"
        case "completed":
            return "Completado"
        default:
            return status || "Sin estado"
    }
}

function getOperationalStatusVariant(status: string) {
    switch (status) {
        case "completed":
            return "default" as const
        case "blocked":
            return "destructive" as const
        case "in_progress":
            return "secondary" as const
        case "pending":
            return "outline" as const
        default:
            return "outline" as const
    }
}

export function DashboardPage() {
    const [draftStartDate, setDraftStartDate] = useState("")
    const [draftEndDate, setDraftEndDate] = useState("")
    const [draftInspector, setDraftInspector] = useState("")
    const [draftStatus, setDraftStatus] = useState("")

    const filters = useMemo(
        () => ({
            startDate: draftStartDate || undefined,
            endDate: draftEndDate || undefined,
            inspector: draftInspector || undefined,
            operationalStatus: draftStatus || undefined,
        }),
        [draftStartDate, draftEndDate, draftInspector, draftStatus],
    )

    const { data, isLoading, isError, error } = useProductivityDashboardQuery(filters)

    const summary = data?.summary
    const byInspector = data?.byInspector ?? []
    const byStatus = data?.byStatus ?? []

    const inspectorOptions = useMemo(() => {
        const uniqueNames = Array.from(
            new Set(
                byInspector
                    .map((item) => item.inspectorName?.trim())
                    .filter((value): value is string => Boolean(value)),
            ),
        )

        return uniqueNames.sort((a, b) => a.localeCompare(b, "es"))
    }, [byInspector])

    const reportsOutsideGoal = summary
        ? Math.max(summary.completedReports - summary.onTimeCount, 0)
        : 0

    const handleClearFilters = () => {
        setDraftStartDate("")
        setDraftEndDate("")
        setDraftInspector("")
        setDraftStatus("")
    }

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Productividad operativa
                </h1>
                <p className="text-sm text-muted-foreground">
                    Monitorea tiempos de informe, cumplimiento de meta y carga operativa por inspector.
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
                            value={draftStartDate}
                            onChange={(event) => setDraftStartDate(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha fin</label>
                        <Input
                            type="date"
                            value={draftEndDate}
                            onChange={(event) => setDraftEndDate(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Inspector</label>
                        <select
                            value={draftInspector}
                            onChange={(event) => setDraftInspector(event.target.value)}
                            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <option value="">Todos</option>
                            {inspectorOptions.map((inspectorName) => (
                                <option key={inspectorName} value={inspectorName}>
                                    {inspectorName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estado operativo</label>
                        <select
                            value={draftStatus}
                            onChange={(event) => setDraftStatus(event.target.value)}
                            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleClearFilters}
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Tiempo promedio</CardTitle>
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary ? "--" : formatMinutes(summary.averageReportMinutes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Promedio de elaboración de informes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Inspecciones evaluadas</CardTitle>
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
                            {isLoading || !summary ? "--" : `${summary.onTimePercentage.toFixed(1)}%`}
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
                            {isLoading || !summary ? "--" : reportsOutsideGoal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes que superaron la meta operativa
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserRound className="h-4 w-4" />
                            Productividad por inspector
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>Asignadas</TableHead>
                                    <TableHead>Completadas</TableHead>
                                    <TableHead>Promedio</TableHead>
                                    <TableHead>Cumplimiento</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                            Cargando productividad...
                                        </TableCell>
                                    </TableRow>
                                ) : byInspector.length ? (
                                    byInspector.map((item) => (
                                        <TableRow key={item.inspectorName}>
                                            <TableCell className="font-medium">{item.inspectorName}</TableCell>
                                            <TableCell>{item.assignedInspections}</TableCell>
                                            <TableCell>{item.completedReports}</TableCell>
                                            <TableCell>{formatMinutes(item.averageReportMinutes)}</TableCell>
                                            <TableCell>{item.onTimePercentage.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
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
                        ) : byStatus.length ? (
                            byStatus.map((item) => (
                                <div
                                    key={item.operationalStatus}
                                    className="flex items-center justify-between rounded-xl border px-3 py-3"
                                >
                                    <Badge variant={getOperationalStatusVariant(item.operationalStatus)}>
                                        {formatOperationalStatusLabel(item.operationalStatus)}
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