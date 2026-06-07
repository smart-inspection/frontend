import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { EvidencesPage } from "@/features/evidences/pages/evidences-page"

import InspectionsPage from "../features/inspections/pages/InspectionsPage"
import InspectionDetailPage from "../features/inspections/pages/InspectionDetailPage"
import { CreateInspectionPage as CreateInspectionPage } from "../features/inspections/pages/CreateInspectionPage"

import { PublicInspectionRequestPage } from "@/features/requests/pages/public-inspection-request-page"
import { InspectionRequestsPage } from "@/features/requests/pages/inspection-requests-page"

export const router = createBrowserRouter([
    {
        path: "/solicitar",
        element: <PublicInspectionRequestPage />,
    },
    {
        path: "/",
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: "inspection-requests",
                element: <InspectionRequestsPage />,
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

export default router