import { auth_storage } from "@/features/auth/lib/auth.storage"

const RAW_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1"

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "")

function get_auth_header(): Record<string, string> {
    const token = auth_storage.get_token()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

function get_ngrok_header(): Record<string, string> {
    const is_ngrok_url =
        API_BASE_URL.includes(".ngrok-free.dev") ||
        API_BASE_URL.includes(".ngrok.io") ||
        API_BASE_URL.includes(".ngrok.app")

    return is_ngrok_url ? { "ngrok-skip-browser-warning": "true" } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const is_form_data = init?.body instanceof FormData

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            ...(is_form_data ? {} : { "Content-Type": "application/json" }),
            ...get_ngrok_header(),
            ...get_auth_header(),
            ...init?.headers,
        },
    })

    if (response.status === 401) {
        auth_storage.clear_token()
        window.location.href = "/login"
        throw new Error("Sesión expirada. Redirigiendo al login.")
    }

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${text}`)
    }

    const content_type = response.headers.get("content-type") ?? ""
    if (content_type.includes("application/json")) {
        return response.json() as Promise<T>
    }

    return undefined as T
}

export function apiGet<T>(path: string) {
    return request<T>(path, { method: "GET" })
}

export function apiPost<T>(path: string, body?: unknown) {
    return request<T>(path, {
        method: "POST",
        body: body == null ? undefined : JSON.stringify(body),
    })
}

export function apiPut<T>(path: string, body?: unknown) {
    return request<T>(path, {
        method: "PUT",
        body: body == null ? undefined : JSON.stringify(body),
    })
}

export function apiPatch<T>(path: string, body?: unknown) {
    return request<T>(path, {
        method: "PATCH",
        body: body == null ? undefined : JSON.stringify(body),
    })
}

export function apiPostForm<T>(path: string, form_data: FormData) {
    return request<T>(path, { method: "POST", body: form_data })
}

export function resolveBackendFileUrl(path?: string | null): string {
    if (!path) return ""
    if (/https?:\/\//i.test(path)) return path
    const normalized_path = path.startsWith("/") ? path : `/${path}`
    return `${API_BASE_URL}${normalized_path}`
}

export function buildReportExportUrl(type: "pdf" | "docx", draft_id: number): string {
    return `${API_BASE_URL}/report-export/${type}/${draft_id}`
}