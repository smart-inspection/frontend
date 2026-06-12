import {createBrowserRouter, Navigate, Outlet} from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { EvidencesPage } from "@/features/evidences/pages/evidences-page"

import InspectionsPage from "../features/inspections/pages/InspectionsPage"
import InspectionDetailPage from "../features/inspections/pages/InspectionDetailPage"
import { CreateInspectionPage as CreateInspectionPage } from "../features/inspections/pages/CreateInspectionPage"

import { PublicInspectionRequestPage } from "@/features/requests/pages/PublicInspectionRequestPage"
import { InspectionRequestsPage } from "@/features/requests/pages/InspectionRequestsPage"
import LoginPage from "@/features/auth/pages/LoginPage";
import {auth_storage} from "@/features/auth/lib/auth.storage";

function RequireAuth() {
    if (!auth_storage.is_authenticated()) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />
}

export const router = createBrowserRouter([
    {
        path: "/solicitar",
        element: <PublicInspectionRequestPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/",
                element: <AppShell />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "inspection-requests", element: <InspectionRequestsPage /> },
                    { path: "inspections", element: <InspectionsPage /> },
                    { path: "inspections/new", element: <CreateInspectionPage /> },
                    { path: "inspections/:inspectionId", element: <InspectionDetailPage /> },
                    { path: "evidences", element: <EvidencesPage /> },
                    { path: "reports", element: <ReportsPage /> },
                ],
            },
        ],
    },
])

export default router