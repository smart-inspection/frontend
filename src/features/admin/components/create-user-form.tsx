import { useState } from "react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateUserMutation } from "../api/admin.queries"
import {
    admin_user_initial_values,
    validate_admin_user_form,
    type AdminUserFormErrors,
    type AdminUserFormValues,
} from "../types/admin.types"

const ROLE_OPTIONS = [
    { value: "inspector", label: "Inspector" },
    { value: "viewer", label: "Visualizador" },
    { value: "admin", label: "Administrador" },
]

export function CreateUserForm() {
    const [values, set_values] = useState<AdminUserFormValues>(
        admin_user_initial_values,
    )
    const [errors, set_errors] = useState<AdminUserFormErrors>({})
    const [server_error, set_server_error] = useState<string | null>(null)
    const [success, set_success] = useState(false)

    const create_mutation = useCreateUserMutation()

    function handle_change(field: keyof AdminUserFormValues, value: string) {
        set_values((prev) => ({ ...prev, [field]: value }))
        set_errors((prev) => ({ ...prev, [field]: undefined }))
        set_server_error(null)
        set_success(false)
    }

    function handle_submit(event: React.FormEvent) {
        event.preventDefault()
        const validation_errors = validate_admin_user_form(values)

        if (Object.keys(validation_errors).length > 0) {
            set_errors(validation_errors)
            return
        }

        create_mutation.mutate(
            {
                full_name: values.full_name,
                email: values.email,
                password: values.password,
                role: values.role,
            },
            {
                onSuccess: () => {
                    set_values(admin_user_initial_values)
                    set_errors({})
                    set_success(true)
                },
                onError: (err) => {
                    set_server_error(
                        err instanceof Error
                            ? err.message
                            : "Error al crear el usuario. Verifica los datos.",
                    )
                },
            },
        )
    }

    return (
        <form onSubmit={handle_submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre completo</Label>
                    <Input
                        id="full_name"
                        placeholder="Juan Pérez"
                        value={values.full_name}
                        onChange={(e) => handle_change("full_name", e.target.value)}
                        disabled={create_mutation.isPending}
                    />
                    {errors.full_name ? (
                        <p className="text-xs text-destructive">{errors.full_name}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="correo@empresa.com"
                        value={values.email}
                        onChange={(e) => handle_change("email", e.target.value)}
                        disabled={create_mutation.isPending}
                    />
                    {errors.email ? (
                        <p className="text-xs text-destructive">{errors.email}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={values.password}
                        onChange={(e) => handle_change("password", e.target.value)}
                        disabled={create_mutation.isPending}
                    />
                    {errors.password ? (
                        <p className="text-xs text-destructive">{errors.password}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <select
                        id="role"
                        value={values.role}
                        onChange={(e) => handle_change("role", e.target.value)}
                        disabled={create_mutation.isPending}
                        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.role ? (
                        <p className="text-xs text-destructive">{errors.role}</p>
                    ) : null}
                </div>
            </div>

            {server_error ? (
                <p className="text-sm text-destructive">{server_error}</p>
            ) : null}

            {success ? (
                <p className="text-sm text-green-600">Usuario creado correctamente.</p>
            ) : null}

            <div className="flex justify-end">
                <Button type="submit" disabled={create_mutation.isPending}>
                    {create_mutation.isPending ? (
                        "Creando..."
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Crear usuario
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}