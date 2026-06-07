import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Loader2,
    Search,
    UserRound,
} from "lucide-react"

import { useCreateInspectionMutation } from "@/features/inspections/api/inspections.queries"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    useConvertInspectionRequestMutation,
    useInspectionRequestsQuery,
} from "../api/inspection-requests.queries"
import type { InspectionRequest } from "../types/inspection-request.types"

type ConversionFormValues = {
    code: string
    clientname: string
    inspectiontype: string
    equipmenttype: string
    inspectiondate: string
    location: string
    requestedby: string
    responsibleinspector: string
}

type ConversionFormErrors = Partial<Record<keyof ConversionFormValues, string>>

function formatDate(value?: string | null) {
    if (!value) return "Sin fecha"

    try {
        return new Intl.DateTimeFormat("es-PE", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(new Date(value))
    } catch {
        return value
    }
}

function emptyToNull(value?: string) {
    const normalized = value?.trim() ?? ""
    return normalized ? normalized : null
}

function buildInitialValues(request: InspectionRequest): ConversionFormValues {
    return {
        code: "",
        clientname: request.companyName,
        inspectiontype: request.serviceType ?? "Inspección técnica",
        equipmenttype: request.equipmentType ?? "",
        inspectiondate: request.requestedDate ?? "",
        location: request.location,
        requestedby: request.contactName,
        responsibleinspector: "",
    }
}

function validateForm(values: ConversionFormValues): ConversionFormErrors {
    const errors: ConversionFormErrors = {}

    if (!values.code.trim()) errors.code = "El código es obligatorio."
    if (!values.clientname.trim()) errors.clientname = "El cliente es obligatorio."
    if (!values.inspectiontype.trim()) {
        errors.inspectiontype = "El tipo de inspección es obligatorio."
    }
    if (!values.equipmenttype.trim()) {
        errors.equipmenttype = "El tipo de equipo es obligatorio."
    }
    if (!values.inspectiondate.trim()) {
        errors.inspectiondate = "La fecha programada es obligatoria."
    }
    if (!values.responsibleinspector.trim()) {
        errors.responsibleinspector = "El inspector responsable es obligatorio."
    }

    return errors
}

function getStatusLabel(status: string) {
    switch (status) {
        case "pending":
            return "Pendiente"
        case "converted":
            return "Convertida"
        default:
            return status
    }
}

function getStatusVariant(status: string) {
    switch (status) {
        case "pending":
            return "outline" as const
        case "converted":
            return "secondary" as const
        default:
            return "outline" as const
    }
}

export function InspectionRequestsPage() {
    const navigate = useNavigate()

    const { data = [], isLoading, isError, error } = useInspectionRequestsQuery()
    const createInspectionMutation = useCreateInspectionMutation()
    const convertInspectionRequestMutation = useConvertInspectionRequestMutation()

    const [search, setSearch] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [formValues, setFormValues] = useState<ConversionFormValues | null>(null)
    const [formErrors, setFormErrors] = useState<ConversionFormErrors>({})

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase()

        if (!term) return data

        return data.filter((request) =>
            [
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
                .includes(term),
        )
    }, [data, search])

    const createError =
        createInspectionMutation.error instanceof Error
            ? createInspectionMutation.error.message
            : null

    const convertError =
        convertInspectionRequestMutation.error instanceof Error
            ? convertInspectionRequestMutation.error.message
            : null

    const serverError = createError ?? convertError

    function handleOpenConvert(request: InspectionRequest) {
        if (request.status === "converted") return

        setSelectedRequest(request)
        setFormValues(buildInitialValues(request))
        setFormErrors({})
        setIsSheetOpen(true)
    }

    function handleCloseSheet(nextOpen: boolean) {
        setIsSheetOpen(nextOpen)

        if (!nextOpen) {
            setSelectedRequest(null)
            setFormValues(null)
            setFormErrors({})
        }
    }

    function updateField<K extends keyof ConversionFormValues>(
        field: K,
        value: ConversionFormValues[K],
    ) {
        setFormValues((prev) => (prev ? { ...prev, [field]: value } : prev))
        setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    async function handleConvert(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectedRequest || !formValues) return

        const errors = validateForm(formValues)
        setFormErrors(errors)

        if (Object.keys(errors).length > 0) return

        const createdInspection = await createInspectionMutation.mutateAsync({
            code: formValues.code.trim(),
            client_name: formValues.clientname.trim(),
            equipment_type: formValues.equipmenttype.trim(),
            inspection_type: formValues.inspectiontype.trim(),
            inspection_date: formValues.inspectiondate,
            location: emptyToNull(formValues.location),
            requested_by: emptyToNull(formValues.requestedby),
            responsible_inspector: emptyToNull(formValues.responsibleinspector),
        })

        await convertInspectionRequestMutation.mutateAsync({
            inspectionRequestId: selectedRequest.id,
            payload: {
                inspection_id: createdInspection.id,
                status: "converted",
            },
        })

        handleCloseSheet(false)
        navigate(`/inspections/${createdInspection.id}`)
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

                        <Button asChild variant="outline">
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
                    <div className="relative max-w-md">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar solicitud..."
                            className="pl-9"
                        />
                    </div>

                    {isError ? (
                        <div className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive">
                            {error instanceof Error
                                ? error.message
                                : "No se pudieron cargar las solicitudes."}
                        </div>
                    ) : null}

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
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        Cargando solicitudes...
                                    </TableCell>
                                </TableRow>
                            ) : null}

                            {!isLoading && filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        No hay solicitudes registradas.
                                    </TableCell>
                                </TableRow>
                            ) : null}

                            {!isLoading
                                ? filteredRequests.map((request) => {
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
                                                    <span>{formatDate(request.requestedDate)}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={getStatusVariant(request.status)}>
                                                        {getStatusLabel(request.status)}
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
                                                    onClick={() => handleOpenConvert(request)}
                                                    disabled={isConverted}
                                                    variant={isConverted ? "outline" : "default"}
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
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
                <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Convertir solicitud en inspección</SheetTitle>
                        <SheetDescription>
                            Completa los datos operativos mínimos para programar la inspección.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedRequest && formValues ? (
                        <form onSubmit={handleConvert} className="flex h-full flex-col gap-4 p-4">
                            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                <p className="font-medium">{selectedRequest.companyName}</p>
                                <p className="text-muted-foreground">
                                    Solicitud #{selectedRequest.id} · {selectedRequest.location}
                                </p>
                            </div>

                            {serverError ? (
                                <div className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                                    {serverError}
                                </div>
                            ) : null}

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={formValues.code}
                                        onChange={(event) => updateField("code", event.target.value)}
                                        placeholder="INSP-2026-001"
                                        aria-invalid={Boolean(formErrors.code)}
                                    />
                                    {formErrors.code ? (
                                        <p className="text-xs text-destructive">{formErrors.code}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientname">Cliente</Label>
                                    <Input
                                        id="clientname"
                                        value={formValues.clientname}
                                        onChange={(event) => updateField("clientname", event.target.value)}
                                        aria-invalid={Boolean(formErrors.clientname)}
                                    />
                                    {formErrors.clientname ? (
                                        <p className="text-xs text-destructive">{formErrors.clientname}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="inspectiontype">Tipo de inspección</Label>
                                    <Input
                                        id="inspectiontype"
                                        value={formValues.inspectiontype}
                                        onChange={(event) => updateField("inspectiontype", event.target.value)}
                                        aria-invalid={Boolean(formErrors.inspectiontype)}
                                    />
                                    {formErrors.inspectiontype ? (
                                        <p className="text-xs text-destructive">{formErrors.inspectiontype}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="equipmenttype">Tipo de equipo</Label>
                                    <Input
                                        id="equipmenttype"
                                        value={formValues.equipmenttype}
                                        onChange={(event) => updateField("equipmenttype", event.target.value)}
                                        aria-invalid={Boolean(formErrors.equipmenttype)}
                                    />
                                    {formErrors.equipmenttype ? (
                                        <p className="text-xs text-destructive">{formErrors.equipmenttype}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="inspectiondate">Fecha programada</Label>
                                    <Input
                                        id="inspectiondate"
                                        type="date"
                                        value={formValues.inspectiondate}
                                        onChange={(event) => updateField("inspectiondate", event.target.value)}
                                        aria-invalid={Boolean(formErrors.inspectiondate)}
                                    />
                                    {formErrors.inspectiondate ? (
                                        <p className="text-xs text-destructive">{formErrors.inspectiondate}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="responsibleinspector">Inspector responsable</Label>
                                    <Input
                                        id="responsibleinspector"
                                        value={formValues.responsibleinspector}
                                        onChange={(event) =>
                                            updateField("responsibleinspector", event.target.value)
                                        }
                                        placeholder="Inspector asignado"
                                        aria-invalid={Boolean(formErrors.responsibleinspector)}
                                    />
                                    {formErrors.responsibleinspector ? (
                                        <p className="text-xs text-destructive">
                                            {formErrors.responsibleinspector}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación</Label>
                                    <Input
                                        id="location"
                                        value={formValues.location}
                                        onChange={(event) => updateField("location", event.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requestedby">Solicitante</Label>
                                    <Input
                                        id="requestedby"
                                        value={formValues.requestedby}
                                        onChange={(event) => updateField("requestedby", event.target.value)}
                                    />
                                </div>
                            </div>

                            <SheetFooter className="mt-auto px-0">
                                <div className="flex w-full items-center justify-between gap-3">
                                    <p className="text-xs text-muted-foreground">
                                        Al convertir, la solicitud quedará en estado convertido.
                                    </p>

                                    <Button
                                        type="submit"
                                        disabled={
                                            createInspectionMutation.isPending ||
                                            convertInspectionRequestMutation.isPending
                                        }
                                    >
                                        {createInspectionMutation.isPending ||
                                        convertInspectionRequestMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Convirtiendo...
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardList className="h-4 w-4" />
                                                Crear inspección
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </SheetFooter>
                        </form>
                    ) : null}
                </SheetContent>
            </Sheet>
        </section>
    )
}

export default InspectionRequestsPage