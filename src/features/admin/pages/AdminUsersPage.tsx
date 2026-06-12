import { Shield, UserCheck, UserX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAdminUsersQuery, useUpdateUserMutation } from "../api/admin.queries"
import { CreateUserForm } from "../components/create-user-form"
import type { AdminUser } from "../types/admin.types"

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    inspector: "Inspector",
    viewer: "Visualizador",
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    inspector: "secondary",
    viewer: "outline",
}

function UserRow({ user }: { user: AdminUser }) {
    const update_mutation = useUpdateUserMutation()

    function toggle_active() {
        update_mutation.mutate({
            user_id: user.id,
            payload: { is_active: !user.is_active },
        })
    }

    return (
        <TableRow className={!user.is_active ? "opacity-50" : ""}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
                <Badge variant={ROLE_VARIANTS[user.role] ?? "outline"}>
                    {ROLE_LABELS[user.role] ?? user.role}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Activo" : "Inactivo"}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={update_mutation.isPending}
                    onClick={toggle_active}
                    aria-label={user.is_active ? "Desactivar usuario" : "Activar usuario"}
                >
                    {user.is_active ? (
                        <UserX className="h-4 w-4 text-destructive" />
                    ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                    )}
                </Button>
            </TableCell>
        </TableRow>
    )
}

export function AdminUsersPage() {
    const { data: users = [], isLoading, isError } = useAdminUsersQuery()

    const active_count = users.filter((u) => u.is_active).length
    const inspector_count = users.filter((u) => u.role === "inspector").length

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    <Shield className="h-5 w-5" />
                    Gestión de usuarios
                </h1>
                <p className="text-sm text-muted-foreground">
                    Crea y administra los usuarios del sistema. Solo visible para administradores.
                </p>
            </div>

            {/* Métricas rápidas */}
            <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="py-4">
                        <p className="text-2xl font-semibold">{users.length}</p>
                        <p className="text-xs text-muted-foreground">Usuarios totales</p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardContent className="py-4">
                        <p className="text-2xl font-semibold">{active_count}</p>
                        <p className="text-xs text-muted-foreground">Usuarios activos</p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardContent className="py-4">
                        <p className="text-2xl font-semibold">{inspector_count}</p>
                        <p className="text-xs text-muted-foreground">Inspectores registrados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Formulario de creación */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Crear nuevo usuario</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateUserForm />
                </CardContent>
            </Card>

            {/* Listado */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Usuarios registrados</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-sm text-destructive">
                                        No se pudo cargar la lista de usuarios.
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                        No hay usuarios registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => <UserRow key={user.id} user={user} />)
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    )
}

export default AdminUsersPage