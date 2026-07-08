import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    CalendarDays,
    ChevronRight,
    ClipboardList,
    MapPin,
    Search,
    ShieldCheck,
    UserRound,
    Wrench,
} from "lucide-react"

import { useInspectionsQuery } from "../api/inspections.queries"
import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "../types/inspections.utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { useAdminUsersQuery } from "@/features/admin/api/admin.queries"
import { get_inspector_display_name } from "../types/inspections.utils"

function InspectionsPageSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-border/60 shadow-sm">
                    <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-10/12" />
                        <Skeleton className="h-9 w-full rounded-md" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="rounded-full bg-muted p-3">
                    <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-base font-semibold">No hay inspecciones registradas</h3>
                    <p className="text-sm text-muted-foreground">
                        Cuando el backend tenga inspecciones creadas, aparecerán aquí.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function InspectionsPage() {
    const { data = [], isLoading, isError, error } = useInspectionsQuery()
    const { data: inspectors = [] } = useAdminUsersQuery()
    const [search, setSearch] = useState("")

    const filteredInspections = useMemo(() => {
        const term = search.trim().toLowerCase()

        if (!term) return data

        return data.filter((inspection) =>
            [
                inspection.code,
                inspection.client_name,
                inspection.equipment_type,
                inspection.inspection_type,
                get_inspector_display_name(inspectors, inspection.responsible_inspector_id),
                inspection.status,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        )
    }, [data, search])

    return (
        <section className="space-y-5">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Flujo operativo
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Inspecciones
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Revisa el avance operativo y accede al detalle técnico de cada inspección.
                    </p>
                </div>

                <Button asChild className="w-full sm:w-auto">
                    <Link to="/inspections/new">Nueva inspección</Link>
                </Button>
            </header>

            <Card className="border-border/60 bg-card/80 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por código, cliente, equipo, inspector o estado"
                            className="pl-9"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2.5 py-1">Total: {data.length}</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">
              Mostrando: {filteredInspections.length}
            </span>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? <InspectionsPageSkeleton /> : null}

            {isError ? (
                <Card className="border-destructive/30">
                    <CardContent className="py-8">
                        <div className="space-y-2 text-center">
                            <h3 className="font-semibold text-destructive">
                                Error al cargar inspecciones
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {String((error as Error)?.message ?? "No se pudo obtener la lista")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {!isLoading && !isError && filteredInspections.length === 0 ? <EmptyState /> : null}

            {!isLoading && !isError ? (
                <div className="space-y-4">
                    {filteredInspections.map((inspection) => (
                        <Link
                            key={inspection.id}
                            to={`/inspections/${inspection.id}`}
                            className="block transition-transform duration-150 active:scale-[0.99]"
                        >
                            <Card className="border-border/60 shadow-sm transition-colors hover:bg-accent/30">
                                <CardHeader className="space-y-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ClipboardList className="h-4 w-4" />
                        </span>

                                                <div className="min-w-0">
                                                    <h2 className="truncate text-base font-semibold">
                                                        {inspection.code}
                                                    </h2>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {inspection.client_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Badge variant={getInspectionStatusVariant(inspection.status)}>
                                            {formatInspectionStatus(inspection.status)}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="h-4 w-4 shrink-0" />
                                            <span className="truncate">
                        {inspection.equipment_type} · {inspection.inspection_type}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                            <span>{formatInspectionDate(inspection.inspection_date)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="truncate">
                        {inspection.location || "Ubicación no registrada"}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <UserRound className="h-4 w-4 shrink-0" />
                                            <span className="truncate">
                                                {get_inspector_display_name(inspectors, inspection.responsible_inspector_id)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-end text-sm font-medium text-primary">
                                        <span>Ver detalle</span>
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : null}
        </section>
    )
}