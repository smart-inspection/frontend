import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
    ClipboardList,
    ClipboardPlus,
    FileText,
    FolderOpen,
    LayoutDashboard,
    LogOut,
    Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useCurrentUserQuery } from "@/features/auth/api/auth.queries"
import { useLogoutMutation } from "@/features/auth/api/auth.queries"
import type { UserRole } from "@/features/auth/types/auth.types"

type NavItem = {
    to: string
    label: string
    icon: React.ElementType
    roles?: UserRole[]
}

const ALL_ROLES: UserRole[] = ["admin", "inspector", "viewer"]

const NAV_ITEMS: NavItem[] = [
    {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
    },
    {
        to: "/inspection-requests",
        label: "Solicitudes",
        icon: ClipboardPlus,
        roles: ["admin", "viewer"],
    },
    {
        to: "/inspections",
        label: "Inspecciones",
        icon: ClipboardList,
        roles: ALL_ROLES,
    },
    {
        to: "/evidences",
        label: "Evidencias",
        icon: FolderOpen,
        roles: ["admin", "viewer"],
    },
    {
        to: "/reports",
        label: "Informes",
        icon: FileText,
        roles: ["admin", "viewer"],
    },
]

function filter_items_by_role(role: UserRole | undefined): NavItem[] {
    if (!role) return []
    return NAV_ITEMS.filter(
        (item) => !item.roles || item.roles.includes(role),
    )
}

type NavItemsProps = {
    items: NavItem[]
    onNavigate?: () => void
}

function NavItems({ items, onNavigate }: NavItemsProps) {
    return (
        <nav className="flex flex-col gap-1">
            {items.map((item) => {
                const Icon = item.icon
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                                isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                            )
                        }
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                    </NavLink>
                )
            })}
        </nav>
    )
}

function RoleBadge({ role }: { role: string }) {
    const label_map: Record<string, string> = {
        admin: "Administrador",
        inspector: "Inspector",
        viewer: "Visualizador",
    }

    return (
        <span className="text-xs capitalize text-slate-500">
      {label_map[role] ?? role}
    </span>
    )
}

export function AppShell() {
    const navigate = useNavigate()
    const { data: current_user } = useCurrentUserQuery()
    const logout_mutation = useLogoutMutation()

    const visible_items = filter_items_by_role(current_user?.role)

    function handle_logout() {
        logout_mutation.mutate(undefined, {
            onSuccess: () => navigate("/login", { replace: true }),
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        {/* Menú móvil */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon-sm" aria-label="Abrir menú">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[88vw] max-w-xs">
                                    <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Navegación principal del sistema Smart Inspect
                                    </SheetDescription>

                                    <div className="flex h-full flex-col gap-6 pt-6">
                                        <Link
                                            to="/"
                                            className="text-lg font-semibold tracking-tight text-slate-900"
                                        >
                                            Smart Inspect
                                        </Link>
                                        <NavItems items={visible_items} />

                                        {current_user ? (
                                            <div className="mt-auto border-t pt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium leading-tight">
                                                            {current_user.full_name}
                                                        </p>
                                                        <RoleBadge role={current_user.role} />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Cerrar sesión"
                                                        onClick={handle_logout}
                                                        disabled={logout_mutation.isPending}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link
                            to="/"
                            className="text-base font-semibold tracking-tight sm:text-lg"
                        >
                            Smart Inspect
                        </Link>
                    </div>

                    {/* Nombre + rol + logout en desktop */}
                    <div className="flex items-center gap-2">
                        {current_user ? (
                            <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium leading-tight">
                  {current_user.full_name}
                </span>
                                <RoleBadge role={current_user.role} />
                            </div>
                        ) : null}

                        <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label="Cerrar sesión"
                            onClick={handle_logout}
                            disabled={logout_mutation.isPending}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl md:grid-cols-[260px_minmax(0,1fr)]">
                {/* Sidebar desktop */}
                <aside className="hidden border-r bg-white md:block">
                    <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
                        <NavItems items={visible_items} />

                        {/* Info usuario en sidebar desktop */}
                        {current_user ? (
                            <div className="mt-auto border-t pt-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="truncate text-sm font-medium leading-tight">
                                            {current_user.full_name}
                                        </p>
                                        <RoleBadge role={current_user.role} />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Cerrar sesión"
                                        onClick={handle_logout}
                                        disabled={logout_mutation.isPending}
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </aside>

                <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6">
                    <div className="mx-auto w-full max-w-6xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}