export function formatInspectionStatus(status: string) {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "draft":
            return "Borrador"
        case "generated":
            return "Generado"
        case "generated_llm":
            return "Generado con LLM"
        case "edited":
            return "Editado"
        case "in_review":
            return "En revisión"
        case "observed":
            return "Observado"
        case "finalized":
            return "Finalizado"
        default:
            return status || "Sin estado"
    }
}

export function getInspectionStatusVariant(status: string) {
    const value = status?.toLowerCase?.() ?? ""

    switch (value) {
        case "draft":
            return "secondary"
        case "generated":
        case "generated_llm":
            return "default"
        case "edited":
            return "outline"
        case "in_review":
            return "secondary"
        case "observed":
            return "destructive"
        case "finalized":
            return "default"
        default:
            return "outline"
    }
}

export function formatInspectionDate(value?: string | null) {
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