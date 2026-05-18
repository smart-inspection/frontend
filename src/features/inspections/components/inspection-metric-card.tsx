import type { ComponentType } from "react"

type InspectionMetricCardProps = {
    label: string
    value: string | number
    hint?: string
    icon: ComponentType<{ className?: string }>
}

export function InspectionMetricCard({
                                         label,
                                         value,
                                         hint,
                                         icon: Icon,
                                     }: InspectionMetricCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
                </div>

                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}