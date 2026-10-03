import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ConfidenceLevel } from "../types/inspections.types"

interface AiConfidenceBadgeProps {
    level?: ConfidenceLevel | null
    score?: number | null
    className?: string
}

export function resolveConfidenceInfo(
    level?: ConfidenceLevel | null,
    score?: number | null,
): {
    level: ConfidenceLevel
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    badgeClass: string
} {
    if (level) {
        const normalized = level.toLowerCase() as ConfidenceLevel
        if (normalized === "high") {
            return {
                level: "high",
                label: "Alta",
                variant: "outline",
                badgeClass: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
            }
        }
        if (normalized === "medium") {
            return {
                level: "medium",
                label: "Media",
                variant: "outline",
                badgeClass: "border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-300",
            }
        }
        return {
            level: "low",
            label: "Baja",
            variant: "outline",
            badgeClass: "border-destructive/40 text-destructive bg-destructive/10",
        }
    }

    if (typeof score === "number") {
        const normalizedScore = score > 1 ? score / 100 : score
        if (normalizedScore >= 0.8) {
            return {
                level: "high",
                label: "Alta",
                variant: "outline",
                badgeClass: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
            }
        }
        if (normalizedScore >= 0.5) {
            return {
                level: "medium",
                label: "Media",
                variant: "outline",
                badgeClass: "border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-300",
            }
        }
        return {
            level: "low",
            label: "Baja",
            variant: "outline",
            badgeClass: "border-destructive/40 text-destructive bg-destructive/10",
        }
    }

    return {
        level: "low",
        label: "Sin dato",
        variant: "outline",
        badgeClass: "border-muted-foreground/30 text-muted-foreground",
    }
}

export function AiConfidenceBadge({ level, score, className }: AiConfidenceBadgeProps) {
    const info = resolveConfidenceInfo(level, score)

    return (
        <Badge
            variant={info.variant}
            aria-label={`Nivel de confianza de IA: ${info.label}`}
            className={`inline-flex items-center gap-1.5 font-medium ${info.badgeClass} ${className ?? ""}`}
        >
            {info.level === "high" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
            {info.level === "medium" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
            {info.level === "low" && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true" />}
            <span>{info.label}</span>
            {typeof score === "number" ? (
                <span className="text-xs opacity-75 font-normal">
                    ({Math.round((score > 1 ? score / 100 : score) * 100)}%)
                </span>
            ) : null}
        </Badge>
    )
}
