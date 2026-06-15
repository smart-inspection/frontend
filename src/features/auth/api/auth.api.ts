import { auth_storage } from "../lib/auth.storage"
import type { CurrentUser, LoginInput, TokenResponse } from "../types/auth.types"

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "")

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

function get_ngrok_header(): Record<string, string> {
    const is_ngrok_url =
        API_BASE_URL.includes(".ngrok-free.dev") ||
        API_BASE_URL.includes(".ngrok.io") ||
        API_BASE_URL.includes(".ngrok.app")

    return is_ngrok_url ? { "ngrok-skip-browser-warning": "true" } : {}
}

function map_current_user(raw: unknown): CurrentUser {
    const data = as_record(raw)

    return {
        id: as_number(data?.id),
        full_name: as_string(data?.full_name),
        email: as_string(data?.email),
        role: as_string(data?.role, "viewer") as CurrentUser["role"],
        is_active: as_boolean(data?.is_active, true),
    }
}

async function auth_request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...get_ngrok_header(),
            ...init?.headers,
        },
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${text}`)
    }

    return response.json() as Promise<T>
}

export async function login(payload: LoginInput): Promise<TokenResponse> {
    const data = await auth_request<unknown>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: payload.email, password: payload.password }),
    })

    const record = as_record(data)

    return {
        access_token: as_string(record?.access_token),
        token_type: as_string(record?.token_type, "bearer"),
    }
}

export async function get_current_user(): Promise<CurrentUser> {
    const token = auth_storage.get_token()

    const data = await auth_request<unknown>("/auth/me", {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    return map_current_user(data)
}