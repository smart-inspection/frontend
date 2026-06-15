import type { ProductivityFilters } from "../types/productivity.types"

export const productivityKeys = {
    all: ["productivity"] as const,
    summary: (filters?: ProductivityFilters) =>
        [...productivityKeys.all, "summary", filters ?? {}] as const,
    byInspector: (filters?: ProductivityFilters) =>
        [...productivityKeys.all, "by-inspector", filters ?? {}] as const,
    dashboard: (filters?: ProductivityFilters) =>
        [...productivityKeys.all, "dashboard", filters ?? {}] as const,
}