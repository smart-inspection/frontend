import { CalendarDays, CheckCircle2, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
        <div className="w-full overflow-x-auto">
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
                                            className="min-h-[44px]"
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
    )
}
