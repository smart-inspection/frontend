import { createBrowserRouter } from "react-router-dom"
import { EvidencesPage } from "@/features/evidences/pages/evidences-page"
import { InspectionsPage } from "@/features/inspections/pages/inspections-page"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <InspectionsPage />,
    },
    {
        path: "/evidences",
        element: <EvidencesPage />,
    },
])