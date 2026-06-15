export type UserRole = "admin" | "inspector" | "viewer"

export interface CurrentUser {
    id: number
    full_name: string
    email: string
    role: UserRole
    is_active: boolean
}

export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface LoginInput {
    email: string
    password: string
}