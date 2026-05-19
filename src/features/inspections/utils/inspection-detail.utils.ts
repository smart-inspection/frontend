import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"

export function formatDateTime(value?: string | null) {
    if (!value) return "No registrado"

    try {
        return new Intl.DateTimeFormat("es-PE", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value))
    } catch {
        return value
    }
}

export function getConfidenceLabel(value?: number | null) {
    if (value == null) return "Sin confianza"
    if (value >= 90) return "Alta"
    if (value >= 70) return "Media"
    return "Baja"
}

export function getValidationBadgeVariant(
    status?: string | null,
): VariantProps<typeof badgeVariants>["variant"] {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "matched":
            return "default"
        case "mismatch":
            return "destructive"
        case "notfound":
            return "secondary"
        default:
            return "outline"
    }
}

export function getValidationLabel(status?: string | null) {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "matched":
            return "Coincide"
        case "mismatch":
            return "No coincide"
        case "notfound":
            return "No encontrado"
        case "pending":
            return "Pendiente"
        case "not_evaluated":
        case "notevaluated":
            return "No evaluado"
        default:
            return status || "Sin validar"
    }
}

export function isImageFile(fileType?: string | null) {
    return !!fileType?.toLowerCase().startsWith("image/")
}

export function buildApiFileUrl(path?: string | null) {
    if (!path) return "#"
    if (path.startsWith("http://") || path.startsWith("https://")) return path

    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
    if (!base) return path

    return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function buildReportExportUrl(type: "pdf" | "docx", draftId: number) {
    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
    return `${base}/report-export/${type}/${draftId}`
}