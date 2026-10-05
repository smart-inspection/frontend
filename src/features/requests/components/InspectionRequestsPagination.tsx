import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InspectionRequestsPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
}

export function InspectionRequestsPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: InspectionRequestsPaginationProps) {
    if (totalItems <= pageSize) return null

    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Mostrando {start} - {end} de {totalItems} solicitudes
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="min-h-[44px]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Button>
                <span className="text-xs text-muted-foreground">
                    {currentPage} / {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className="min-h-[44px]"
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
