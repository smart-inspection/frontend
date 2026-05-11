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
                inspection.location,
                inspection.responsible_inspector,
                inspection.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term),
        )
    }, [data, search])

    return (
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-4 md:px-6">
            <header className="space-y-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Smart Inspect</p>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Inspecciones</h1>
                            <p className="text-sm text-muted-foreground">
                                Consulta el historial de inspecciones registradas y entra al detalle técnico.
                            </p>
                        </div>
                        <Button asChild>
                            <Link to="/inspections/new">Nueva inspección</Link>
                        </Button>
                    </div>
                </div>

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
              <span className="rounded-full bg-muted px-2.5 py-1">
                Total: {data.length}
              </span>
                            <span className="rounded-full bg-muted px-2.5 py-1">
                Mostrando: {filteredInspections.length}
              </span>
                        </div>
                    </CardContent>
                </Card>
            </header>

            {isLoading ? <InspectionsPageSkeleton /> : null}

            {isError ? (
                <Card className="border-destructive/30">
                    <CardContent className="py-8">
                        <div className="space-y-2 text-center">
                            <h3 className="font-semibold text-destructive">Error al cargar inspecciones</h3>
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
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid gap-2 text-sm text-muted-foreground">
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

                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <span className="text-foreground">Ver detalle de inspección</span>
                                        </div>

                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
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