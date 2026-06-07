import { Link, NavLink, Outlet } from "react-router-dom"
import {
    ClipboardList,
    ClipboardPlus,
    FileText,
    FolderOpen,
    LayoutDashboard,
} from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/inspection-requests", label: "Solicitudes", icon: ClipboardPlus },
    { to: "/inspections", label: "Inspecciones", icon: ClipboardList },
    { to: "/evidences", label: "Evidencias", icon: FolderOpen },
    { to: "/reports", label: "Informes", icon: FileText },
]

export function AppShell() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
                <aside className="border-r bg-white">
                    <div className="flex h-16 items-center border-b px-6">
                        <Link to="/" className="text-lg font-semibold tracking-tight">
                            Smart Inspect
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-1 p-4">
                        {items.map((item) => {
                            const Icon = item.icon

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === "/"}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                            isActive
                                                ? "bg-slate-900 text-white"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                        )
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>
                </aside>

                <div className="flex min-h-screen flex-col">
                    <header className="flex h-16 items-center border-b bg-white px-6">
                        <div>
                            <p className="text-sm text-slate-500">
                                Sistema web inteligente para inspecciones
                            </p>
                        </div>
                    </header>

                    <main className="flex-1 p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}