export type UserRole = "admin" | "inspector" | "viewer"

export interface AdminUser {
    id: number
    full_name: string
    email: string
    role: UserRole
    is_active: boolean
}

export interface AdminUserCreateInput {
    full_name: string
    email: string
    password: string
    role: UserRole
}

export interface AdminUserUpdateInput {
    full_name?: string
    role?: UserRole
    is_active?: boolean
}

export type AdminUserFormValues = {
    full_name: string
    email: string
    password: string
    role: UserRole
}

export type AdminUserFormErrors = Partial<Record<keyof AdminUserFormValues, string>>

export const admin_user_initial_values: AdminUserFormValues = {
    full_name: "",
    email: "",
    password: "",
    role: "inspector",
}

const FULL_NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export function validate_admin_user_form(
    values: AdminUserFormValues,
): AdminUserFormErrors {
    const errors: AdminUserFormErrors = {}

    const full_name = values.full_name.trim()
    if (!full_name) {
        errors.full_name = "El nombre completo es obligatorio."
    } else if (!FULL_NAME_REGEX.test(full_name)) {
        errors.full_name = "El nombre solo puede contener letras y espacios."
    } else if (full_name.length < 3) {
        errors.full_name = "El nombre debe tener al menos 3 caracteres."
    } else if (full_name.length > 80) {
        errors.full_name = "El nombre no puede superar los 80 caracteres."
    }

    const email = values.email.trim()
    if (!email) {
        errors.email = "El correo electrónico es obligatorio."
    } else if (email.length > 100) {
        errors.email = "El correo no puede superar los 100 caracteres."
    } else if (!EMAIL_REGEX.test(email)) {
        errors.email = "Ingresa un correo electrónico válido."
    }

    const password = values.password
    if (!password.trim()) {
        errors.password = "La contraseña es obligatoria."
    } else if (/\s/.test(password)) {
        errors.password = "La contraseña no puede contener espacios."
    } else if (password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres."
    } else if (password.length > 64) {
        errors.password = "La contraseña no puede superar los 64 caracteres."
    }

    if (!["admin", "inspector", "viewer"].includes(values.role)) {
        errors.role = "Selecciona un rol válido."
    }

    return errors
}