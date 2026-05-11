import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { EvidencesPage } from "@/features/evidences/pages/evidences-page"

import InspectionsPage from "../features/inspections/pages/InspectionsPage"
import InspectionDetailPage from "../features/inspections/pages/InspectionDetailPage"
import { InspectionsPage as CreateInspectionPage } from "@/features/inspections/pages/inspections-page"

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
                path: "inspections/new",
                element: <CreateInspectionPage />,
            },
            {
                path: "inspections/:inspectionId",
                element: <InspectionDetailPage />,
            },
            {
                path: "evidences",
                element: <EvidencesPage />,
            },
            {
                path: "reports",
                element: <ReportsPage />,
            },
        ],
    },
])