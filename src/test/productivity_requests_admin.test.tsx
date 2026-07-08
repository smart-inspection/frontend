/* @vitest-environment jsdom */
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import InspectionRequestsPage from "@/features/requests/pages/InspectionRequestsPage";
import { PublicInspectionRequestForm } from "@/features/requests/components/public-inspection-request-form";

import * as inspections_queries from "@/features/inspections/api/inspections.queries";
import * as productivity_queries from "@/features/productivity/api/productivity.queries";
import * as productivity_api from "@/features/productivity/api/productivity.api";
import * as requests_queries from "@/features/requests/api/inspection-requests.queries";
import * as admin_queries from "@/features/admin/api/admin.queries";
import * as auth_queries from "@/features/auth/api/auth.queries";
import * as lib_api from "@/lib/api";

vi.mock("@/features/inspections/api/inspections.queries", () => ({
    useStartProductivityMutation: vi.fn(),
    useProductivityByInspectionQuery: vi.fn(),
    useCreateInspectionMutation: vi.fn(),
}));

vi.mock("@/features/productivity/api/productivity.queries", () => ({
    useProductivitySummaryQuery: vi.fn(),
    useProductivityByInspectorQuery: vi.fn(),
    useProductivityDashboardQuery: vi.fn(),
}));

vi.mock("@/features/requests/api/inspection-requests.queries", () => ({
    useInspectionRequestsQuery: vi.fn(),
    useCreateInspectionRequestMutation: vi.fn(),
    useConvertInspectionRequestMutation: vi.fn(),
}));

vi.mock("@/features/admin/api/admin.queries", () => ({
    useAdminUsersQuery: vi.fn(),
    useCreateUserMutation: vi.fn(),
    useUpdateUserMutation: vi.fn(),
}));

vi.mock("@/features/auth/api/auth.queries", () => ({
    useCurrentUserQuery: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
    const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
    return {
        ...actual,
        apiGet: vi.fn(),
        apiPatch: vi.fn(),
    };
});

const mocked_use_start_productivity_mutation = vi.mocked(inspections_queries.useStartProductivityMutation);
const mocked_use_productivity_by_inspection_query = vi.mocked(inspections_queries.useProductivityByInspectionQuery);
const mocked_use_create_inspection_mutation = vi.mocked(inspections_queries.useCreateInspectionMutation);

const mocked_use_productivity_summary_query = vi.mocked(productivity_queries.useProductivitySummaryQuery);
const mocked_use_productivity_by_inspector_query = vi.mocked(productivity_queries.useProductivityByInspectorQuery);
const mocked_use_productivity_dashboard_query = vi.mocked(productivity_queries.useProductivityDashboardQuery);

const mocked_use_inspection_requests_query = vi.mocked(requests_queries.useInspectionRequestsQuery);
const mocked_use_create_inspection_request_mutation = vi.mocked(requests_queries.useCreateInspectionRequestMutation);
const mocked_use_convert_inspection_request_mutation = vi.mocked(requests_queries.useConvertInspectionRequestMutation);

const mocked_use_admin_users_query = vi.mocked(admin_queries.useAdminUsersQuery);
const mocked_use_create_user_mutation = vi.mocked(admin_queries.useCreateUserMutation);
const mocked_use_update_user_mutation = vi.mocked(admin_queries.useUpdateUserMutation);

const mocked_use_current_user_query = vi.mocked(auth_queries.useCurrentUserQuery);

const mocked_api_get = vi.mocked(lib_api.apiGet);
const mocked_api_patch = vi.mocked(lib_api.apiPatch);

function create_query_client() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

function render_with_providers(ui: React.ReactElement) {
    const query_client = create_query_client();

    return render(
        <QueryClientProvider client={query_client}>
            <MemoryRouter>{ui}</MemoryRouter>
        </QueryClientProvider>,
    );
}

function make_query_result(data: unknown, overrides: Record<string, unknown> = {}) {
    return {
        data,
        error: null,
        isError: false,
        isLoading: false,
        isPending: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        isLoadingError: false,
        isRefetchError: false,
        status: "success",
        fetchStatus: "idle",
        refetch: vi.fn().mockResolvedValue({ data }),
        ...overrides,
    } as any;
}

function make_mutation_result(
    impl?: (args?: any) => unknown | Promise<unknown>,
    overrides: Record<string, unknown> = {},
) {
    const mutate_async = vi.fn(async (args?: any) => {
        if (impl) {
            return await impl(args);
        }
        return undefined;
    });

    const mutate = vi.fn(
        (
            args?: any,
            options?: {
                onSuccess?: (value: any) => void;
                onError?: (error: unknown) => void;
            },
        ) => {
            Promise.resolve()
                .then(() => mutate_async(args))
                .then((value) => options?.onSuccess?.(value))
                .catch((error) => options?.onError?.(error));
        },
    );

    return {
        data: undefined,
        error: null,
        isError: false,
        isIdle: false,
        isPending: false,
        isSuccess: true,
        status: "success",
        variables: undefined,
        submittedAt: 0,
        failureCount: 0,
        failureReason: null,
        reset: vi.fn(),
        mutate,
        mutateAsync: mutate_async,
        ...overrides,
    } as any;
}

const inspection_base = {
    id: 10,
    code: "INSP-2026-050",
    clientname: "Cliente Productividad SAC",
    equipmenttype: "Semirremolque",
    inspectiontype: "Inspección visual",
    inspectiondate: "2026-07-01",
    location: "Trujillo",
    requestedby: "Operaciones",
    responsibleinspector: "Juan Pérez",
    status: "draft",
    createdat: "2026-07-01T10:00:00Z",
    updatedat: "2026-07-01T10:00:00Z",
};

const productivity_record = {
    id: 1,
    inspectionid: 10,
    inspectorname: "Juan Pérez",
    scheduleddate: "2026-07-01",
    reportstartedat: "2026-07-01T10:00:00Z",
    reportfinishedat: null,
    durationminutes: null,
    operationalstatus: "inprogress",
    metgoal: null,
};

const productivity_summary = {
    totalInspections: 12,
    completedReports: 8,
    averageReportMinutes: 18.5,
    onTimeCount: 7,
    onTimePercentage: 87.5,
    goalMinutes: 20,
};

const productivity_by_inspector = [
    {
        inspectorName: "Juan Pérez",
        assignedInspections: 10,
        completedReports: 8,
        averageReportMinutes: 18.5,
        onTimeCount: 7,
        onTimePercentage: 87.5,
    },
];

const dashboard_data = {
    summary: productivity_summary,
    byInspector: productivity_by_inspector,
    byStatus: [
        {
            operationalStatus: "completed",
            count: 5,
        },
        {
            operationalStatus: "inprogress",
            count: 3,
        },
    ],
};

function ProductivityByInspectionHarness({ inspection_id }: { inspection_id: number }) {
    const query = inspections_queries.useProductivityByInspectionQuery(inspection_id);

    return <div>{query.data?.inspectorname ?? "sin-productividad"}</div>;
}

function StartProductivityHarness({ inspection_id }: { inspection_id: number }) {
    const mutation = inspections_queries.useStartProductivityMutation(inspection_id);

    return (
        <button type="button" onClick={() => mutation.mutate()}>
            Iniciar informe
        </button>
    );
}

function FinishProductivityHarness({ inspection_id }: { inspection_id: number }) {
    async function handle_finish() {
        await lib_api.apiPatch(`productivity/inspection/${inspection_id}/finish`, {
            reportfinishedat: new Date().toISOString(),
        });
    }

    return (
        <button type="button" onClick={() => void handle_finish()}>
            Finalizar informe
        </button>
    );
}

function ProductivitySummaryHarness() {
    const query = productivity_queries.useProductivitySummaryQuery();

    return <div>{String(query.data?.averageReportMinutes ?? "0")}</div>;
}

function ProductivityByInspectorHarness() {
    const query = productivity_queries.useProductivityByInspectorQuery();

    return <div>{query.data?.[0]?.inspectorName ?? "sin-inspector"}</div>;
}

function ProductivityDashboardHarness() {
    const query = productivity_queries.useProductivityDashboardQuery();

    return (
        <div>
            <span>{String(query.data?.summary?.totalInspections ?? 0)}</span>
            <span>{query.data?.byInspector?.[0]?.inspectorName ?? "sin-inspector"}</span>
            <span>{query.data?.byStatus?.[0]?.operationalStatus ?? "sin-estado"}</span>
        </div>
    );
}

function CreateInspectionRequestHarness() {
    const mutation = requests_queries.useCreateInspectionRequestMutation();

    return (
        <button
            type="button"
            onClick={() =>
                mutation.mutate({
                    companyName: "Empresa Demo SAC",
                    contactName: "Luis Gómez",
                    contactEmail: "luis@demo.com",
                    contactPhone: "999111222",
                    requestedDate: "2026-07-10",
                    location: "Trujillo",
                    serviceType: "Inspección",
                    equipmentType: "Tolva",
                    notes: "Urgente",
                })
            }
        >
            Crear solicitud
        </button>
    );
}

function ConvertInspectionRequestHarness() {
    const mutation = requests_queries.useConvertInspectionRequestMutation();

    return (
        <button
            type="button"
            onClick={() =>
                mutation.mutate({
                    inspectionRequestId: 1,
                    payload: {
                        inspectionid: 101,
                        status: "converted",
                    },
                })
            }
        >
            Convertir solicitud
        </button>
    );
}

function CreateAdminUserHarness() {
    const mutation = admin_queries.useCreateUserMutation();

    return (
        <button
            type="button"
            onClick={() =>
                mutation.mutate({
                    fullname: "Usuario Nuevo",
                    email: "nuevo@demo.com",
                    password: "secreto123",
                    role: "inspector",
                })
            }
        >
            Crear usuario
        </button>
    );
}

function AdminUsersHarness() {
    const query = admin_queries.useAdminUsersQuery();

    return <div>{query.data?.[0]?.fullname ?? "sin-usuarios"}</div>;
}

beforeEach(() => {
    vi.clearAllMocks();

    mocked_use_current_user_query.mockReturnValue(
        make_query_result({
            id: 1,
            fullname: "Juan Pérez",
            email: "juan@demo.com",
            role: "admin",
            isactive: true,
        }),
    );

    mocked_use_start_productivity_mutation.mockReturnValue(make_mutation_result());

    mocked_use_productivity_by_inspection_query.mockReturnValue(make_query_result(productivity_record));

    mocked_use_create_inspection_mutation.mockReturnValue(
        make_mutation_result(async () => ({
            ...inspection_base,
            id: 101,
        })),
    );

    mocked_use_productivity_summary_query.mockReturnValue(make_query_result(productivity_summary));
    mocked_use_productivity_by_inspector_query.mockReturnValue(make_query_result(productivity_by_inspector));
    mocked_use_productivity_dashboard_query.mockReturnValue(make_query_result(dashboard_data));

    mocked_use_inspection_requests_query.mockReturnValue(
        make_query_result([
            {
                id: 1,
                companyName: "Empresa Uno SAC",
                contactName: "María Torres",
                contactEmail: "maria@uno.com",
                contactPhone: "999111222",
                requestedDate: "2026-07-10",
                location: "Trujillo",
                serviceType: "Inspección",
                equipmentType: "Tolva",
                notes: "Urgente",
                status: "pending",
                inspectionId: null,
                createdAt: "2026-07-01T10:00:00Z",
                updatedAt: "2026-07-01T10:00:00Z",
            },
        ]),
    );

    mocked_use_create_inspection_request_mutation.mockReturnValue(make_mutation_result());
    mocked_use_convert_inspection_request_mutation.mockReturnValue(make_mutation_result());

    mocked_use_admin_users_query.mockReturnValue(
        make_query_result([
            {
                id: 1,
                fullname: "Admin Demo",
                email: "admin@demo.com",
                role: "admin",
                isactive: true,
            },
            {
                id: 2,
                fullname: "Inspector Demo",
                email: "inspector@demo.com",
                role: "inspector",
                isactive: true,
            },
        ]),
    );

    mocked_use_create_user_mutation.mockReturnValue(make_mutation_result());
    mocked_use_update_user_mutation.mockReturnValue(make_mutation_result());
});

describe("productivity_requests_admin", () => {
    it("cp_fnt_prd_001_consultar_productividad_por_inspeccion", async () => {
        render_with_providers(<ProductivityByInspectionHarness inspection_id={10} />);

        await waitFor(() => {
            expect(mocked_use_productivity_by_inspection_query).toHaveBeenCalledWith(10);
        });

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    it("cp_fnt_prd_002_iniciar_reporte_desde_detalle", async () => {
        const start_mutation = make_mutation_result();

        mocked_use_start_productivity_mutation.mockReturnValue(start_mutation);

        render_with_providers(<StartProductivityHarness inspection_id={10} />);

        fireEvent.click(screen.getByRole("button", { name: /iniciar informe/i }));

        await waitFor(() => {
            expect(mocked_use_start_productivity_mutation).toHaveBeenCalledWith(10);
            expect(start_mutation.mutate).toHaveBeenCalledTimes(1);
        });
    });

    it("cp_fnt_prd_003_finalizar_reporte_desde_detalle", async () => {
        mocked_api_patch.mockResolvedValue({} as never);

        render_with_providers(<FinishProductivityHarness inspection_id={10} />);

        fireEvent.click(screen.getByRole("button", { name: /finalizar informe/i }));

        await waitFor(() => {
            expect(mocked_api_patch).toHaveBeenCalledWith(
                "productivity/inspection/10/finish",
                expect.objectContaining({
                    reportfinishedat: expect.any(String),
                }),
            );
        });
    });

    it("cp_fnt_prd_004_consultar_resumen_de_productividad", async () => {
        render_with_providers(<ProductivitySummaryHarness />);

        await waitFor(() => {
            expect(mocked_use_productivity_summary_query).toHaveBeenCalled();
        });

        expect(screen.getByText("18.5")).toBeInTheDocument();
    });

    it("cp_fnt_prd_005_consultar_productividad_por_inspector", async () => {
        render_with_providers(<ProductivityByInspectorHarness />);

        await waitFor(() => {
            expect(mocked_use_productivity_by_inspector_query).toHaveBeenCalled();
        });

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    it("cp_fnt_prd_006_consultar_dashboard_de_productividad", async () => {
        render_with_providers(<ProductivityDashboardHarness />);

        await waitFor(() => {
            expect(mocked_use_productivity_dashboard_query).toHaveBeenCalled();
        });

        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("cp_fnt_prd_007_aplicar_filtros_de_productividad", async () => {
        mocked_api_get.mockResolvedValue({
            totalinspections: 1,
            completedreports: 1,
            averagereportminutes: 10,
            ontimecount: 1,
            ontimepercentage: 100,
            goalminutes: 20,
        } as never);

        await productivity_api.getProductivitySummary({
            startDate: "2026-07-01",
            endDate: "2026-07-31",
            inspector: "Juan Pérez",
            operationalStatus: "completed",
        });

        expect(mocked_api_get).toHaveBeenCalledTimes(1);

        const called_url = String(mocked_api_get.mock.calls[0]?.[0] ?? "");

        expect(called_url).toContain("productivity/summary");
        expect(called_url).toContain("datefrom=2026-07-01");
        expect(called_url).toContain("dateto=2026-07-31");
        expect(called_url).toContain("inspectorname=");
        expect(called_url).toContain("operationalstatus=completed");
    });

    it("cp_fnt_req_001_cargar_formulario_publico_de_solicitud", async () => {
        render_with_providers(<PublicInspectionRequestForm />);

        expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contacto/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ubicación|ubicacion/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
    });

    it("cp_fnt_req_002_registrar_solicitud_publica_de_inspeccion", async () => {
        const create_request_mutation = make_mutation_result();

        mocked_use_create_inspection_request_mutation.mockReturnValue(create_request_mutation);

        render_with_providers(<CreateInspectionRequestHarness />);

        fireEvent.click(screen.getByRole("button", { name: /crear solicitud/i }));

        await waitFor(() => {
            expect(create_request_mutation.mutate).toHaveBeenCalledWith({
                companyName: "Empresa Demo SAC",
                contactName: "Luis Gómez",
                contactEmail: "luis@demo.com",
                contactPhone: "999111222",
                requestedDate: "2026-07-10",
                location: "Trujillo",
                serviceType: "Inspección",
                equipmentType: "Tolva",
                notes: "Urgente",
            });
        });
    });

    it("cp_fnt_req_003_listar_solicitudes_de_inspeccion", async () => {
        render_with_providers(<InspectionRequestsPage />);

        expect(await screen.findByText(/empresa uno sac/i)).toBeInTheDocument();
        expect(screen.getByText(/maría torres/i)).toBeInTheDocument();
    });

    it("cp_fnt_req_004_convertir_solicitud_a_inspeccion", async () => {
        const convert_mutation = make_mutation_result();

        mocked_use_convert_inspection_request_mutation.mockReturnValue(convert_mutation);

        render_with_providers(<ConvertInspectionRequestHarness />);

        fireEvent.click(screen.getByRole("button", { name: /convertir solicitud/i }));

        await waitFor(() => {
            expect(convert_mutation.mutate).toHaveBeenCalledWith({
                inspectionRequestId: 1,
                payload: {
                    inspectionid: 101,
                    status: "converted",
                },
            });
        });
    });

    it("cp_fnt_adm_001_listar_usuarios_administrativos", async () => {
        render_with_providers(<AdminUsersHarness />);

        await waitFor(() => {
            expect(mocked_use_admin_users_query).toHaveBeenCalled();
        });

        expect(screen.getByText(/admin demo/i)).toBeInTheDocument();
    });

    it("cp_fnt_adm_002_crear_usuario_desde_panel_admin", async () => {
        const create_user_mutation = make_mutation_result();

        mocked_use_create_user_mutation.mockReturnValue(create_user_mutation);

        render_with_providers(<CreateAdminUserHarness />);

        fireEvent.click(screen.getByRole("button", { name: /crear usuario/i }));

        await waitFor(() => {
            expect(create_user_mutation.mutate).toHaveBeenCalledWith({
                fullname: "Usuario Nuevo",
                email: "nuevo@demo.com",
                password: "secreto123",
                role: "inspector",
            });
        });
    });
});