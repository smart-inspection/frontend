import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Clock3, Filter, UserRound } from "lucide-react"

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
    { value: "draft", label: "Borrador" },
    { value: "in_review", label: "Informe en proceso" },
    { value: "observed", label: "Observado" },
    { value: "finalized", label: "Finalizado" },
]

function formatOperationalStatusLabel(status: string) {
    switch (status) {
        case "pending":
            return "Borrador"
        case "in_progress":
            return "Informe en proceso"
        case "observed":
            return "Observado"
        case "completed":
            return "Finalizado"
        default:
            return status
    }
}

function getOperationalStatusVariant(status: string) {
    switch (status) {
        case "completed":
            return "default" as const
        case "observed":
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
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [inspector, setInspector] = useState("")
    const [status, setStatus] = useState("")

    const filters = useMemo(
        () => ({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            inspector: inspector || undefined,
            operationalStatus: status || undefined,
        }),
        [startDate, endDate, inspector, status],
    )

    const { data, isLoading, isError, error } = useProductivityDashboardQuery(filters)

    const summary = data?.summary
    const byInspector = data?.byInspector ?? []
    const byStatus = data?.byStatus ?? []

    const reportsOutsideGoal = summary
        ? Math.max(summary.completedReports - summary.onTimeCount, 0)
        : null

    return (
        <section className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Productividad
                </h1>
                <p className="text-sm text-muted-foreground">
                    Monitorea tiempos de informe, cumplimiento de meta y rendimiento por inspector.
                </p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" />
                        Filtros operativos
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha inicio</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha fin</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Inspector</label>
                        <Input
                            placeholder="Nombre del inspector"
                            value={inspector}
                            onChange={(event) => setInspector(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {isError ? (
                <Card className="border-destructive/30 shadow-sm">
                    <CardContent className="py-6">
                        <div className="flex items-start gap-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Tiempo promedio
                        </CardTitle>
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary
                                ? "--"
                                : formatMinutes(summary.averageReportMinutes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Promedio de elaboración de informes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Informes completados
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary ? "--" : summary.completedReports}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes cerrados en el rango consultado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Cumplimiento de meta
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || !summary
                                ? "--"
                                : `${summary.onTimePercentage.toFixed(1)}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes dentro de la meta de 20 minutos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Fuera de meta
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight">
                            {isLoading || reportsOutsideGoal == null ? "--" : reportsOutsideGoal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Informes que superaron los 20 minutos
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">
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
                                    <TableHead>Tiempo promedio</TableHead>
                                    <TableHead>Cumplimiento</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Cargando productividad...
                                        </TableCell>
                                    </TableRow>
                                ) : byInspector.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            No hay datos de productividad para los filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    byInspector.map((item) => (
                                        <TableRow key={item.inspectorName}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <UserRound className="h-4 w-4 text-muted-foreground" />
                                                    <span>{item.inspectorName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.assignedInspections}</TableCell>
                                            <TableCell>{item.completedReports}</TableCell>
                                            <TableCell>
                                                {formatMinutes(item.averageReportMinutes)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.onTimePercentage >= 70
                                                            ? "default"
                                                            : item.onTimePercentage >= 40
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                >
                                                    {item.onTimePercentage.toFixed(1)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Estado de inspecciones
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Cargando estados...
                            </p>
                        ) : byStatus.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay estados para los filtros aplicados.
                            </p>
                        ) : (
                            byStatus.map((item) => (
                                <div
                                    key={item.operationalStatus}
                                    className="flex items-center justify-between rounded-xl border p-3"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {formatOperationalStatusLabel(item.operationalStatus)}
                                        </p>
                                        <Badge variant={getOperationalStatusVariant(item.operationalStatus)}>
                                            {item.operationalStatus}
                                        </Badge>
                                    </div>

                                    <p className="text-xl font-semibold tracking-tight">
                                        {item.count}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}