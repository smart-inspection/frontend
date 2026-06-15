export type ProductivitySummary = {
    totalInspections: number
    completedReports: number
    averageReportMinutes: number
    onTimeCount: number
    onTimePercentage: number
    goalMinutes: number
}

export type ProductivityByInspectorItem = {
    inspectorName: string
    assignedInspections: number
    completedReports: number
    averageReportMinutes: number
    onTimeCount: number
    onTimePercentage: number
}

export type ProductivityStatusItem = {
    operationalStatus: string
    count: number
}

export type ProductivityDashboard = {
    summary: ProductivitySummary
    byInspector: ProductivityByInspectorItem[]
    byStatus: ProductivityStatusItem[]
}

export type ProductivityFilters = {
    startDate?: string
    endDate?: string
    inspector?: string
    operationalStatus?: string
}