const RAW_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "")

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(init?.headers ?? {}),
        },
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${text}`)
    }

    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
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

export function apiPostForm<T>(path: string, formData: FormData) {
    return request<T>(path, {
        method: "POST",
        body: formData,
    })
}