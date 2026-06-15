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

export function validate_admin_user_form(
    values: AdminUserFormValues,
): AdminUserFormErrors {
    const errors: AdminUserFormErrors = {}

    if (!values.full_name.trim()) {
        errors.full_name = "El nombre completo es obligatorio."
    }

    if (!values.email.trim()) {
        errors.email = "El correo electrónico es obligatorio."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = "Ingresa un correo válido."
    }

    if (!values.password.trim()) {
        errors.password = "La contraseña es obligatoria."
    } else if (values.password.trim().length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres."
    }

    if (!["admin", "inspector", "viewer"].includes(values.role)) {
        errors.role = "Selecciona un rol válido."
    }

    return errors
}