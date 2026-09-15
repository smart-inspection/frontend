import { CalendarDays, CheckCircle2, MapPin, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { InspectionRequest } from "../types/inspection-request.types"
import {
    formatRequestDate,
    getRequestStatusLabel,
    getRequestStatusVariant,
} from "../types/inspection-request.types"

interface InspectionRequestsTableProps {
    requests: InspectionRequest[]
    isLoading: boolean
    onOpenConvert: (request: InspectionRequest) => void
}

export function InspectionRequestsTable({
    requests,
    isLoading,
    onOpenConvert,
}: InspectionRequestsTableProps) {
    return (
        <div className="w-full space-y-3">
            {/* Vista móvil: tarjetas verticales apiladas (< md) */}
            <div className="flex flex-col gap-3 md:hidden">
                {isLoading ? (
                    <Card className="border-border/60">
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            Cargando solicitudes...
                        </CardContent>
                    </Card>
                ) : null}

                {!isLoading && requests.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No hay solicitudes registradas.
                        </CardContent>
                    </Card>
                ) : null}

                {!isLoading
                    ? requests.map((request) => {
                        const isConverted = request.status === "converted"

                        return (
                            <Card key={request.id} className="border-border/60 shadow-sm">
                                <CardHeader className="space-y-2 pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-foreground">
                                                {request.companyName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Solicitud #{request.id}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                            <Badge variant={getRequestStatusVariant(request.status)}>
                                                {getRequestStatusLabel(request.status)}
                                            </Badge>
                                            {request.inspectionId ? (
                                                <Badge variant="secondary" className="text-xs">
                                                    #{request.inspectionId}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-0 text-sm">
                                    <div className="grid gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <UserRound className="h-3.5 w-3.5 shrink-0 text-foreground" />
                                            <span className="truncate font-medium text-foreground">
                                                {request.contactName}
                                            </span>
                                            <span className="truncate">
                                                ({request.contactEmail ?? request.contactPhone ?? "Sin contacto"})
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{request.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                            <span>{formatRequestDate(request.requestedDate)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => onOpenConvert(request)}
                                        disabled={isConverted}
                                        variant={isConverted ? "outline" : "default"}
                                        className="min-h-[44px] w-full"
                                    >
                                        {isConverted ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Convertida
                                            </>
                                        ) : (
                                            "Convertir a inspección"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })
                    : null}
            </div>

            {/* Vista escritorio / tablet: tabla con scroll horizontal (>= md) */}
            <div className="hidden md:block w-full overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Fecha solicitada</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                    Cargando solicitudes...
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!isLoading && requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                    No hay solicitudes registradas.
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!isLoading
                            ? requests.map((request) => {
                                const isConverted = request.status === "converted"

                                return (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">
                                            <div className="space-y-1">
                                                <p>{request.companyName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Solicitud #{request.id}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <UserRound className="h-4 w-4 text-muted-foreground" />
                                                    <span>{request.contactName}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {request.contactEmail ??
                                                        request.contactPhone ??
                                                        "Sin contacto adicional"}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell>{request.location}</TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <span>{formatRequestDate(request.requestedDate)}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant={getRequestStatusVariant(request.status)}>
                                                    {getRequestStatusLabel(request.status)}
                                                </Badge>

                                                {request.inspectionId ? (
                                                    <Badge variant="secondary">
                                                        Inspección #{request.inspectionId}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => onOpenConvert(request)}
                                                disabled={isConverted}
                                                variant={isConverted ? "outline" : "default"}
                                                className="min-h-[44px] min-w-[44px]"
                                            >
                                                {isConverted ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Convertida
                                                    </>
                                                ) : (
                                                    "Convertir"
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                            : null}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
