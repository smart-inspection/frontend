import { apiGet, apiPatch, apiPost } from "@/lib/api"
import type {
    AdminUser,
    AdminUserCreateInput,
    AdminUserUpdateInput,
} from "../types/admin.types"

function as_string(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback
}

function as_number(value: unknown, fallback = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function as_boolean(value: unknown, fallback = false): boolean {
    return typeof value === "boolean" ? value : fallback
}

function as_record(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null
}

function map_admin_user(raw: unknown): AdminUser {
    const data = as_record(raw)
    return {
        id: as_number(data?.id),
        full_name: as_string(data?.full_name),
        email: as_string(data?.email),
        role: as_string(data?.role, "inspector") as AdminUser["role"],
        is_active: as_boolean(data?.is_active, true),
    }
}

export async function get_users(): Promise<AdminUser[]> {
    const response = await apiGet<unknown[]>("/users")
    return Array.isArray(response) ? response.map(map_admin_user) : []
}

export async function create_user(
    payload: AdminUserCreateInput,
): Promise<AdminUser> {
    const response = await apiPost<unknown>("/users", {
        full_name: payload.full_name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: payload.role,
    })
    return map_admin_user(response)
}

export async function update_user(
    user_id: number,
    payload: AdminUserUpdateInput,
): Promise<AdminUser> {
    const response = await apiPatch<unknown>(`/users/${user_id}`, payload)
    return map_admin_user(response)
}