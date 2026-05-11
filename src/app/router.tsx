import { createBrowserRouter } from "react-router-dom"
import { EvidencesPage } from "@/features/evidences/pages/evidences-page"
import { InspectionsPage } from "@/features/inspections/pages/inspections-page"
import {AppShell} from "@/components/layout/app-shell";
import {DashboardPage} from "@/features/dashboard/pages/dashboard-page";
import {ReportsPage} from "@/features/reports/pages/reports-page";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: "inspections",
                element: <InspectionsPage />,
            },
            {
                path: "evidences",
                element: <EvidencesPage />,
            },
            {
                path: "reports",
                element: <ReportsPage />,
            },
        ]
    }
])