import { useQuery } from "@tanstack/react-query"

import {
    getProductivityByInspector,
    getProductivityDashboard,
    getProductivitySummary,
} from "./productivity.api"
import { productivityKeys } from "./productivity.keys"
import type { ProductivityFilters } from "../types/productivity.types"

export function useProductivitySummaryQuery(filters?: ProductivityFilters) {
    return useQuery({
        queryKey: productivityKeys.summary(filters),
        queryFn: () => getProductivitySummary(filters),
    })
}

export function useProductivityByInspectorQuery(filters?: ProductivityFilters) {
    return useQuery({
        queryKey: productivityKeys.byInspector(filters),
        queryFn: () => getProductivityByInspector(filters),
    })
}

export function useProductivityDashboardQuery(filters?: ProductivityFilters) {
    return useQuery({
        queryKey: productivityKeys.dashboard(filters),
        queryFn: () => getProductivityDashboard(filters),
    })
}