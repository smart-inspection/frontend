import { apiGet } from "@/lib/api"
import type {
    ProductivityByInspectorItem,
    ProductivityDashboard,
    ProductivityFilters,
    ProductivityStatusItem,
    ProductivitySummary,
} from "../types/productivity.types"

function buildQueryParams(filters?: ProductivityFilters) {
    const params = new URLSearchParams()

    if (filters?.startDate) params.set("start_date", filters.startDate)
    if (filters?.endDate) params.set("end_date", filters.endDate)
    if (filters?.inspector) params.set("inspector", filters.inspector)
    if (filters?.operationalStatus) {
        params.set("operational_status", filters.operationalStatus)
    }

    const query = params.toString()
    return query ? `?${query}` : ""
}

function asNumber(value: unknown, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = "") {
    return typeof value === "string" ? value : fallback
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null
}

function mapSummary(raw: unknown): ProductivitySummary {
    const data = asRecord(raw)

    return {
        totalInspections: asNumber(data?.total_inspections),
        completedReports: asNumber(data?.completed_reports),
        averageReportMinutes: asNumber(data?.average_report_minutes),
        onTimeCount: asNumber(data?.on_time_count),
        onTimePercentage: asNumber(data?.on_time_percentage),
        goalMinutes: asNumber(data?.goal_minutes, 20),
    }
}

function mapByInspectorItem(raw: unknown): ProductivityByInspectorItem {
    const data = asRecord(raw)

    return {
        inspectorName: asString(data?.inspector_name, "Sin inspector"),
        assignedInspections: asNumber(data?.assigned_inspections),
        completedReports: asNumber(data?.completed_reports),
        averageReportMinutes: asNumber(data?.average_report_minutes),
        onTimeCount: asNumber(data?.on_time_count),
        onTimePercentage: asNumber(data?.on_time_percentage),
    }
}

function mapStatusItem(raw: unknown): ProductivityStatusItem {
    const data = asRecord(raw)

    return {
        operationalStatus: asString(data?.operational_status, "unknown"),
        count: asNumber(data?.count),
    }
}

export async function getProductivitySummary(filters?: ProductivityFilters) {
    const response = await apiGet<unknown>(
        `/productivity/summary${buildQueryParams(filters)}`,
    )

    return mapSummary(response)
}

export async function getProductivityByInspector(filters?: ProductivityFilters) {
    const response = await apiGet<unknown>(
        `/productivity/by-inspector${buildQueryParams(filters)}`,
    )

    if (!Array.isArray(response)) return []

    return response.map(mapByInspectorItem)
}

export async function getProductivityDashboard(filters?: ProductivityFilters) {
    const response = await apiGet<unknown>(
        `/productivity/dashboard${buildQueryParams(filters)}`,
    )

    const data = asRecord(response)

    return {
        summary: mapSummary(data?.summary),
        byInspector: Array.isArray(data?.by_inspector)
            ? data.by_inspector.map(mapByInspectorItem)
            : [],
        byStatus: Array.isArray(data?.by_status)
            ? data.by_status.map(mapStatusItem)
            : [],
    } satisfies ProductivityDashboard
}