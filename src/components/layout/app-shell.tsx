import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
    ClipboardList,
    ClipboardPlus,
    FileText,
    FolderOpen,
    LayoutDashboard, LogOut,
    Menu,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCurrentUserQuery, useLogoutMutation } from "@/features/auth/api/auth.queries";

const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/inspection-requests", label: "Solicitudes", icon: ClipboardPlus },
    { to: "/inspections", label: "Inspecciones", icon: ClipboardList },
    { to: "/evidences", label: "Evidencias", icon: FolderOpen },
    { to: "/reports", label: "Informes", icon: FileText },
]

type NavItemsProps = {
    onNavigate?: () => void
}

function NavItems({ onNavigate }: NavItemsProps) {
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

export function AppShell() {
    const navigate = useNavigate()
    const { data: current_user } = useCurrentUserQuery()
    const logout_mutation = useLogoutMutation()

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
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon-sm" aria-label="Abrir menú">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent side="left" className="w-[88vw] max-w-xs">
                                    <div className="flex h-full flex-col gap-6 pt-6">
                                        <Link
                                            to="/"
                                            className="text-lg font-semibold tracking-tight text-slate-900"
                                        >
                                            Smart Inspect
                                        </Link>

                                        <NavItems />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link to="/" className="text-base font-semibold tracking-tight sm:text-lg">
                            Smart Inspect
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {current_user ? (
                            <div className="hidden flex-col items-end sm:flex">
                                <span className="text-sm font-medium leading-tight">
                                    {current_user.full_name}
                                </span>
                                <span className="text-xs text-slate-500 capitalize">
                                    {current_user.role}
                                </span>
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
                <aside className="hidden border-r bg-white md:block">
                    <div className="sticky top-16 p-4">
                        <NavItems />
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