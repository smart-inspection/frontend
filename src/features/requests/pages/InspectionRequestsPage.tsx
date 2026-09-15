import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { useInspectionRequestsQuery } from "../api/inspection-requests.queries"
import { ConvertRequestSheet } from "../components/ConvertRequestSheet"
import { InspectionRequestsPagination } from "../components/InspectionRequestsPagination"
import { InspectionRequestsTable } from "../components/InspectionRequestsTable"
import type { InspectionRequest } from "../types/inspection-request.types"

const PAGE_SIZE = 10

export function InspectionRequestsPage() {
    const { data = [], isLoading, isError, error } = useInspectionRequestsQuery()

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "converted">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase()

        return data.filter((request) => {
            if (statusFilter !== "all" && request.status !== statusFilter) return false
            if (!term) return true

            return [
                request.companyName,
                request.contactName,
                request.contactEmail,
                request.contactPhone,
                request.location,
                request.serviceType,
                request.equipmentType,
                request.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term)
        })
    }, [data, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE))
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return filteredRequests.slice(start, start + PAGE_SIZE)
    }, [filteredRequests, currentPage])

    function handleOpenConvert(request: InspectionRequest) {
        if (request.status === "converted") return
        setSelectedRequest(request)
        setIsSheetOpen(true)
    }

    function handleCloseSheet(open: boolean) {
        setIsSheetOpen(open)
        if (!open) setSelectedRequest(null)
    }

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
            <header className="space-y-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Operaciones</p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Solicitudes</h1>
                            <p className="text-sm text-muted-foreground">
                                Revisa solicitudes públicas y conviértelas en inspecciones programadas.
                            </p>
                        </div>

                        <Button asChild variant="outline" className="min-h-[44px]">
                            <Link to="/solicitar" target="_blank" rel="noreferrer">
                                Abrir landing pública
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Bandeja de solicitudes</CardTitle>
                    <CardDescription>
                        Usa el buscador para filtrar por empresa, contacto, ubicación o tipo de servicio.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setCurrentPage(1)
                                }}
                                placeholder="Buscar solicitud..."
                                className="pl-9"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            {(["all", "pending", "converted"] as const).map((filter) => (
                                <Button
                                    key={filter}
                                    variant={statusFilter === filter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setStatusFilter(filter)
                                        setCurrentPage(1)
                                    }}
                                    className="min-h-[36px] text-xs capitalize"
                                >
                                    {filter === "all" ? "Todas" : filter === "pending" ? "Pendientes" : "Convertidas"}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {isError && (
                        <div className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive">
                            {error instanceof Error ? error.message : "No se pudieron cargar las solicitudes."}
                        </div>
                    )}

                    <InspectionRequestsTable
                        requests={paginatedRequests}
                        isLoading={isLoading}
                        onOpenConvert={handleOpenConvert}
                    />

                    <InspectionRequestsPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRequests.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>

            <ConvertRequestSheet
                isOpen={isSheetOpen}
                onOpenChange={handleCloseSheet}
                request={selectedRequest}
            />
        </section>
    )
}

export default InspectionRequestsPage