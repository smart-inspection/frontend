import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {AppShell} from "@/components/layout/app-shell";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import {EvidencesPage} from "@/features/evidences/pages/evidences-page";
import InspectionsPage from "@/features/inspections/pages/InspectionsPage";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import { render_with_providers, render_with_router } from "@/test/render";

const mock_use_current_user_query = vi.fn();
const mock_use_logout_mutation = vi.fn();
const mock_use_inspections_query = vi.fn();
const mock_use_inspection_drafts_query = vi.fn();
const mock_use_productivity_dashboard_query = vi.fn();

vi.mock("@/features/auth/api/auth.queries", async () => {
    const actual =
        await vi.importActual<typeof import("@/features/auth/api/auth.queries")>(
            "@/features/auth/api/auth.queries",
        );

    return {
        ...actual,
        useCurrentUserQuery: () => mock_use_current_user_query(),
        useLogoutMutation: () => mock_use_logout_mutation(),
    };
});

vi.mock("@/features/inspections/api/inspections.queries", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/inspections/api/inspections.queries")
        >("@/features/inspections/api/inspections.queries");

    return {
        ...actual,
        useInspectionsQuery: () => mock_use_inspections_query(),
        useInspectionDraftsQuery: (inspection_id: number) =>
            mock_use_inspection_drafts_query(inspection_id),
    };
});

vi.mock("@/features/productivity/api/productivity.queries", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/productivity/api/productivity.queries")
        >("@/features/productivity/api/productivity.queries");

    return {
        ...actual,
        useProductivityDashboardQuery: (filters?: unknown) =>
            mock_use_productivity_dashboard_query(filters),
    };
});

function build_current_user() {
    return {
        id: 1,
        fullname: "Inspector Demo",
        email: "inspector@empresa.com",
        role: "admin",
        isactive: true,
    };
}

function build_inspection() {
    return {
        id: 10,
        code: "INSP-2026-001",
        clientname: "Cliente Demo SAC",
        responsibleinspector: "Inspector Demo",
        inspectiondate: "2026-07-06T10:00:00",
        status: "completed",
    };
}

function build_productivity_dashboard() {
    return {
        summary: {
            totalInspections: 1,
            completedReports: 1,
            averageReportMinutes: 18,
            onTimeCount: 1,
            onTimePercentage: 100,
            goalMinutes: 20,
        },
        byInspector: [
            {
                inspectorName: "Inspector Demo",
                assignedInspections: 1,
                completedReports: 1,
                averageReportMinutes: 18,
                onTimeCount: 1,
                onTimePercentage: 100,
            },
        ],
        byStatus: [
            {
                operationalStatus: "completed",
                count: 1,
            },
        ],
    };
}

function has_active_session() {
    return Boolean(localStorage.getItem("smartinspecttoken"));
}

function TestRequireAuth() {
    if (!has_active_session()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

function build_test_routes(): RouteObject[] {
    return [
        {
            path: "/login",
            element: <div>login_page</div>,
        },
        {
            element: <TestRequireAuth />,
            children: [
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
                    ],
                },
            ],
        },
    ];
}

function render_protected_route(route: string) {
    return render_with_router(build_test_routes(), [route]);
}

describe("router_navigation", () => {
    beforeEach(() => {
        localStorage.setItem("smartinspecttoken", "token_prueba");

        mock_use_current_user_query.mockReturnValue({
            data: build_current_user(),
        });

        mock_use_logout_mutation.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        });

        mock_use_inspections_query.mockReturnValue({
            data: [build_inspection()],
            isLoading: false,
            isError: false,
            error: null,
        });

        mock_use_inspection_drafts_query.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });

        mock_use_productivity_dashboard_query.mockReturnValue({
            data: build_productivity_dashboard(),
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    it("cp_fnt_nav_001_navegar_a_dashboard", async () => {
        const { router } = render_protected_route("/");

        await waitFor(() => {
            expect(router.state.location.pathname).toBe("/");
        });

        expect(screen.queryByText("login_page")).not.toBeInTheDocument();
        expect(screen.getByText(/smart inspect/i)).toBeInTheDocument();
        expect(screen.getByText(/tiempo promedio/i)).toBeInTheDocument();
        expect(screen.getByText(/productividad por inspector/i)).toBeInTheDocument();
        expect(screen.getByText(/estado de inspecciones/i)).toBeInTheDocument();
        expect(mock_use_current_user_query).toHaveBeenCalled();
    });

    it("cp_fnt_nav_002_navegar_a_inspecciones", async () => {
        const { router } = render_protected_route("/inspections");

        await waitFor(() => {
            expect(router.state.location.pathname).toBe("/inspections");
        });

        expect(screen.queryByText("login_page")).not.toBeInTheDocument();
        expect(mock_use_inspections_query).toHaveBeenCalled();
        expect(await screen.findByText(/INSP-2026-001/i)).toBeInTheDocument();
    });

    it("cp_fnt_nav_003_navegar_a_evidencias", async () => {
        const { router } = render_protected_route("/evidences");

        await waitFor(() => {
            expect(router.state.location.pathname).toBe("/evidences");
        });

        expect(screen.queryByText("login_page")).not.toBeInTheDocument();
        expect(screen.getByText(/smart inspect/i)).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: /evidencias/i }),
        ).toBeInTheDocument();
        expect(screen.getByText(/módulo de evidencias/i)).toBeInTheDocument();
    });

    it("cp_fnt_nav_004_navegar_a_reportes", async () => {
        const { router } = render_protected_route("/reports");

        await waitFor(() => {
            expect(router.state.location.pathname).toBe("/reports");
        });

        expect(screen.queryByText("login_page")).not.toBeInTheDocument();
        expect(mock_use_inspections_query).toHaveBeenCalled();
        expect(await screen.findByText(/INSP-2026-001/i)).toBeInTheDocument();
    });

    it("cp_fnt_dash_001_cargar_dashboard_inicial", async () => {
        const { container } = render_with_providers(<DashboardPage />);

        await waitFor(() => {
            expect(mock_use_current_user_query).toHaveBeenCalled();
        });

        const total_dashboard_calls =
            mock_use_productivity_dashboard_query.mock.calls.length +
            mock_use_inspections_query.mock.calls.length;

        expect(container).not.toBeEmptyDOMElement();
        expect(total_dashboard_calls).toBeGreaterThan(0);
    });

    it("cp_fnt_evd_000_cargar_pagina_general_de_evidencias", async () => {
        const { container } = render_with_providers(<EvidencesPage />);

        expect(container).not.toBeEmptyDOMElement();
        expect(screen.getAllByText(/evidencias/i).length).toBeGreaterThan(0);
    });
});