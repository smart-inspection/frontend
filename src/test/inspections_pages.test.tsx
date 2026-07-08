import type { RouteObject } from "react-router-dom";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { InspectionDetailError } from "@/features/inspections/components/inspection-detail-error";
import { CreateInspectionPage } from "@/features/inspections/pages/CreateInspectionPage";
import type { OcrValidationResponse } from "@/features/inspections/types/inspections.types";
import InspectionDetailPage from "@/features/inspections/pages/InspectionDetailPage";
import InspectionsPage from "@/features/inspections/pages/InspectionsPage";
import { render_with_providers, render_with_router } from "@/test/render";

const mock_use_inspections_query = vi.fn();
const mock_use_inspection_detail_query = vi.fn();
const mock_use_inspection_fields_query = vi.fn();
const mock_use_inspection_evidences_query = vi.fn();
const mock_use_inspection_transcriptions_query = vi.fn();
const mock_use_inspection_drafts_query = vi.fn();
const mock_use_inspection_ocr_validation_query = vi.fn();
const mock_use_create_inspection_mutation = vi.fn();
const mock_use_convert_inspection_request_mutation = vi.fn();
const mock_use_validate_inspection_ocr_mutation = vi.fn();
const mock_use_create_inspection_evidence_mutation = vi.fn();
const mock_use_run_evidence_ocr_mutation = vi.fn();
const mock_use_extract_evidence_ocr_mutation = vi.fn();
const mock_use_create_transcription_mutation = vi.fn();
const mock_use_update_transcription_mutation = vi.fn();
const mock_use_generate_report_draft_mutation = vi.fn();
const mock_use_generate_llm_report_draft_mutation = vi.fn();
const mock_use_update_report_draft_mutation = vi.fn();
const mock_use_create_inspection_field_mutation = vi.fn();
const mock_use_update_inspection_field_mutation = vi.fn();
const mock_use_start_productivity_mutation = vi.fn();
const mock_use_productivity_by_inspection_query = vi.fn();
const mock_use_report_status_query = vi.fn();
const mock_use_report_history_query = vi.fn();
const mock_use_update_report_status_mutation = vi.fn();

const mock_create_inspection_mutate_async = vi.fn();
const mock_convert_request_mutate_async = vi.fn();
const mock_update_field_mutate_async = vi.fn();

beforeAll(() => {
    vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
            new Response(JSON.stringify({}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        ),
    );
});

afterAll(() => {
    vi.unstubAllGlobals();
});

vi.mock("@/features/inspections/api/inspections.queries", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/inspections/api/inspections.queries")
        >("@/features/inspections/api/inspections.queries");

    return {
        ...actual,
        useInspectionsQuery: () => mock_use_inspections_query(),
        useInspectionDetailQuery: (inspection_id: number) =>
            mock_use_inspection_detail_query(inspection_id),
        useInspectionByIdQuery: (inspection_id: number) =>
            mock_use_inspection_detail_query(inspection_id),
        useInspectionFieldsQuery: (inspection_id: number) =>
            mock_use_inspection_fields_query(inspection_id),
        useInspectionEvidencesQuery: (inspection_id: number) =>
            mock_use_inspection_evidences_query(inspection_id),
        useInspectionTranscriptionsQuery: (inspection_id: number) =>
            mock_use_inspection_transcriptions_query(inspection_id),
        useInspectionDraftsQuery: (inspection_id: number) =>
            mock_use_inspection_drafts_query(inspection_id),
        useInspectionOcrValidationQuery: (inspection_id: number) =>
            mock_use_inspection_ocr_validation_query(inspection_id),
        useCreateInspectionMutation: () => mock_use_create_inspection_mutation(),
        useConvertInspectionRequestMutation: () =>
            mock_use_convert_inspection_request_mutation(),
        useValidateInspectionOcrMutation: (inspection_id: number) =>
            mock_use_validate_inspection_ocr_mutation(inspection_id),
        useCreateInspectionEvidenceMutation: (inspection_id: number) =>
            mock_use_create_inspection_evidence_mutation(inspection_id),
        useRunEvidenceOcrMutation: (inspection_id: number) =>
            mock_use_run_evidence_ocr_mutation(inspection_id),
        useExtractEvidenceOcrMutation: (inspection_id: number) =>
            mock_use_extract_evidence_ocr_mutation(inspection_id),
        useCreateTranscriptionMutation: (inspection_id: number) =>
            mock_use_create_transcription_mutation(inspection_id),
        useUpdateTranscriptionMutation: (inspection_id: number) =>
            mock_use_update_transcription_mutation(inspection_id),
        useGenerateReportDraftMutation: (inspection_id: number) =>
            mock_use_generate_report_draft_mutation(inspection_id),
        useGenerateLlmReportDraftMutation: (inspection_id: number) =>
            mock_use_generate_llm_report_draft_mutation(inspection_id),
        useUpdateReportDraftMutation: (inspection_id: number) =>
            mock_use_update_report_draft_mutation(inspection_id),
        useCreateInspectionFieldMutation: (inspection_id: number) =>
            mock_use_create_inspection_field_mutation(inspection_id),
        useUpdateInspectionFieldMutation: (inspection_id: number) =>
            mock_use_update_inspection_field_mutation(inspection_id),
        useStartProductivityMutation: (inspection_id: number) =>
            mock_use_start_productivity_mutation(inspection_id),
        useProductivityByInspectionQuery: (inspection_id: number) =>
            mock_use_productivity_by_inspection_query(inspection_id),
        useReportStatusQuery: (draft_id: number) =>
            mock_use_report_status_query(draft_id),
        useReportHistoryQuery: (draft_id: number, limit = 50) =>
            mock_use_report_history_query(draft_id, limit),
        useUpdateReportStatusMutation: (draft_id: number, inspection_id: number) =>
            mock_use_update_report_status_mutation(draft_id, inspection_id),
    };
});

function build_inspection(overrides: Record<string, unknown> = {}) {
    const base = {
        id: 10,
        code: "INSP-2026-001",
        clientname: "Cliente Demo SAC",
        equipmenttype: "Semirremolque",
        inspectiontype: "Preoperacional",
        inspectiondate: "2026-07-06T10:00:00",
        location: "Trujillo",
        requestedby: "Carlos Demo",
        responsibleinspector: "Inspector Demo",
        status: "completed",
        draft: false,
        createdat: "2026-07-06T10:00:00",
        updatedat: "2026-07-06T10:10:00",
        ...overrides,
    };

    return {
        ...base,

        client_name: base.clientname,
        clientName: base.clientname,
        equipment_type: base.equipmenttype,
        equipmentType: base.equipmenttype,
        inspection_type: base.inspectiontype,
        inspectionType: base.inspectiontype,
        inspection_date: base.inspectiondate,
        inspectionDate: base.inspectiondate,
        requested_by: base.requestedby,
        requestedBy: base.requestedby,
        responsible_inspector: base.responsibleinspector,
        responsibleInspector: base.responsibleinspector,
        created_at: base.createdat,
        createdAt: base.createdat,
        updated_at: base.updatedat,
        updatedAt: base.updatedat,
    };
}

function build_field(overrides: Record<string, unknown> = {}) {
    return {
        id: 201,

        inspection_id: 10,
        field_key: "placa",
        field_label: "Placa",
        field_group: "identificacion",
        expected_type: "string",
        manual_value: "ABC-123-MANUAL",
        ocr_value: "ABC-123-OCR",
        final_value: "ABC-123-FINAL",
        validation_status: "matched",
        validation_message: null,
        confidence: 0.98,
        updated_at: "2026-07-06T10:15:00",

        inspectionid: 10,
        fieldkey: "placa",
        fieldlabel: "Placa",
        fieldgroup: "identificacion",
        expectedtype: "string",
        manualvalue: "ABC-123-MANUAL",
        ocrvalue: "ABC-123-OCR",
        finalvalue: "ABC-123-FINAL",
        validationstatus: "matched",
        validationmessage: null,
        updatedat: "2026-07-06T10:15:00",

        ...overrides,
    };
}

function build_evidence(overrides: Record<string, unknown> = {}) {
    return {
        id: 101,

        inspection_id: 10,
        file_path: "/files/evidencias/evidencia-101.jpg",
        file_url: "/files/evidencias/evidencia-101.jpg",
        file_type: "image/jpeg",
        evidence_category: "general",
        caption: "Fotografía lateral de chasis",
        raw_label: "general",
        normalized_label: "general",
        evidence_slot: "lateral",
        component_code: "general",
        axle_number: 1,
        side: "left",
        is_reference: false,
        label_confidence: 0.92,
        metadata_json: {},
        ocr_extracted_text: "PLACA ABC-123",
        ocr_confidence: 0.94,
        ocr_processed: true,
        ocr_last_processed_at: "2026-07-06T10:20:00",
        uploaded_at: "2026-07-06T10:05:00",

        inspectionid: 10,
        filepath: "/files/evidencias/evidencia-101.jpg",
        fileurl: "/files/evidencias/evidencia-101.jpg",
        filetype: "image/jpeg",
        evidencecategory: "general",
        rawlabel: "general",
        normalizedlabel: "general",
        evidenceslot: "lateral",
        componentcode: "general",
        axlenumber: 1,
        isreference: false,
        labelconfidence: 0.92,
        metadatajson: {},
        ocrextractedtext: "PLACA ABC-123",
        ocrconfidence: 0.94,
        ocrprocessed: true,
        ocrlastprocessedat: "2026-07-06T10:20:00",
        uploadedat: "2026-07-06T10:05:00",

        ...overrides,
    };
}

function build_transcription(overrides: Record<string, unknown> = {}) {
    return {
        id: 301,
        inspectionid: 10,
        evidenceid: 101,
        sourcefilepath: "/files/audio/inspection-10.wav",
        language: "es",
        modelname: "base",
        rawtext: "Texto crudo de inspección",
        finaltext: "Texto final de inspección",
        confidence: 0.89,
        processed: true,
        editedmanually: false,
        createdat: "2026-07-06T10:12:00",
        updatedat: "2026-07-06T10:13:00",
        ...overrides,
    };
}

function build_draft(overrides: Record<string, unknown> = {}) {
    return {
        id: 401,
        inspectionid: 10,
        title: "Informe técnico preliminar",
        templateversion: "v1",
        status: "draft",
        generatedtext: "Borrador generado automáticamente",
        editedtext: "Borrador revisado manualmente",
        sourcesnapshot: {},
        generationtimems: 1200,
        createdat: "2026-07-06T10:25:00",
        updatedat: "2026-07-06T10:26:00",
        ...overrides,
    };
}

function build_ocr_validation(): OcrValidationResponse {
    return {
        inspection_id: 10,
        processed_evidences: 2,
        aggregated_text: "Texto OCR consolidado",
        summary: {
            matched: 1,
            mismatched: 1,
            not_found: 0,
            average_confidence: 92.5,
        },
        results: [
            {
                field_id: 1,
                field_key: "placa",
                field_label: "Placa",
                manual_value: "ABC-123-MANUAL",
                ocr_value: "ABC-123-OCR",
                final_value: "ABC-123-MANUAL",
                validation_status: "mismatch",
                validation_message: "El valor OCR no coincide con el manual",
                confidence: 88,
            },
        ],
    };
}

function build_productivity_record() {
    return {
        id: 1,
        inspectionid: 10,
        inspectorname: "Inspector Demo",
        scheduleddate: "2026-07-06T10:00:00",
        reportstartedat: "2026-07-06T10:05:00",
        reportfinishedat: "2026-07-06T10:20:00",
        durationminutes: 15,
        operationalstatus: "completed",
        metgoal: true,
    };
}

function build_query_result<T>(data: T) {
    return {
        data,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    };
}

function build_mutation_result(overrides: Record<string, unknown> = {}) {
    return {
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
        isError: false,
        error: null,
        data: null,
        ...overrides,
    };
}

function build_test_routes(): RouteObject[] {
    return [
        {
            path: "/inspections",
            element: <InspectionsPage />,
        },
        {
            path: "/inspections/new",
            element: <CreateInspectionPage />,
        },
        {
            path: "/inspections/:inspectionId",
            element: <InspectionDetailPage />,
        },
    ];
}

describe("inspections_pages", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mock_create_inspection_mutate_async.mockReset();
        mock_convert_request_mutate_async.mockReset();
        mock_update_field_mutate_async.mockReset();

        mock_create_inspection_mutate_async.mockResolvedValue(
            build_inspection({ id: 99, code: "INSP-2026-099" }),
        );
        mock_convert_request_mutate_async.mockResolvedValue(undefined);
        mock_update_field_mutate_async.mockResolvedValue(
            build_field({
                final_value: "ABC-123-ACTUALIZADO",
                finalvalue: "ABC-123-ACTUALIZADO",
            }),
        );

        mock_use_inspections_query.mockReturnValue(
            build_query_result([
                build_inspection({
                    id: 10,
                    code: "INSP-2026-001",
                    clientname: "Cliente Demo SAC",
                    responsibleinspector: "Inspector Demo",
                    status: "completed",
                }),
                build_inspection({
                    id: 20,
                    code: "INSP-2026-002",
                    clientname: "Acme Norte SAC",
                    responsibleinspector: "Inspector Acme",
                    status: "draft",
                }),
            ]),
        );

        mock_use_inspection_detail_query.mockImplementation((inspection_id: number) =>
            build_query_result(
                build_inspection({
                    id: inspection_id,
                    code: `INSP-2026-${String(inspection_id).padStart(3, "0")}`,
                    clientname:
                        inspection_id === 20 ? "Acme Norte SAC" : "Cliente Demo SAC",
                }),
            ),
        );

        mock_use_inspection_fields_query.mockReturnValue(
            build_query_result([build_field()]),
        );
        mock_use_inspection_evidences_query.mockReturnValue(
            build_query_result([build_evidence()]),
        );
        mock_use_inspection_transcriptions_query.mockReturnValue(
            build_query_result([build_transcription()]),
        );
        mock_use_inspection_drafts_query.mockReturnValue(
            build_query_result([build_draft()]),
        );
        mock_use_inspection_ocr_validation_query.mockReturnValue(
            build_query_result(build_ocr_validation()),
        );

        mock_use_create_inspection_mutation.mockReturnValue(
            build_mutation_result({
                mutateAsync: mock_create_inspection_mutate_async,
            }),
        );

        mock_use_convert_inspection_request_mutation.mockReturnValue(
            build_mutation_result({
                mutateAsync: mock_convert_request_mutate_async,
            }),
        );

        mock_use_validate_inspection_ocr_mutation.mockReturnValue(
            build_mutation_result({
                mutate: vi.fn(),
                mutateAsync: vi.fn().mockResolvedValue(build_ocr_validation()),
                data: build_ocr_validation(),
            }),
        );

        mock_use_create_inspection_evidence_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_run_evidence_ocr_mutation.mockReturnValue(build_mutation_result());
        mock_use_extract_evidence_ocr_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_create_transcription_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_update_transcription_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_generate_report_draft_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_generate_llm_report_draft_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_update_report_draft_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_create_inspection_field_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_update_inspection_field_mutation.mockReturnValue(
            build_mutation_result({
                mutateAsync: mock_update_field_mutate_async,
            }),
        );
        mock_use_start_productivity_mutation.mockReturnValue(
            build_mutation_result(),
        );
        mock_use_productivity_by_inspection_query.mockReturnValue(
            build_query_result(build_productivity_record()),
        );
        mock_use_report_status_query.mockReturnValue(
            build_query_result({
                reportdraftid: 401,
                status: "draft",
                statusupdatedat: "2026-07-06T10:26:00",
                statusupdatedby: 1,
                lastaction: "created",
            }),
        );
        mock_use_report_history_query.mockReturnValue(build_query_result([]));
        mock_use_update_report_status_mutation.mockReturnValue(
            build_mutation_result(),
        );
    });

    it("cp_fnt_ins_001_listar_inspecciones", async () => {
        render_with_router(build_test_routes(), ["/inspections"]);

        expect(await screen.findByText(/INSP-2026-001/i)).toBeInTheDocument();
        expect(screen.getByText(/INSP-2026-002/i)).toBeInTheDocument();
        expect(screen.getByText(/Total:\s*2/i)).toBeInTheDocument();
        expect(screen.getByText(/Mostrando:\s*2/i)).toBeInTheDocument();
    });

    it("cp_fnt_ins_002_buscar_inspecciones_por_codigo_o_cliente", async () => {
        render_with_router(build_test_routes(), ["/inspections"]);

        const search_input = screen.getByPlaceholderText(
            /buscar por código, cliente, equipo, inspector o estado/i,
        );

        await userEvent.type(search_input, "acme norte");

        await waitFor(() => {
            expect(screen.getByText(/Mostrando:\s*1/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/INSP-2026-002/i)).toBeInTheDocument();
        expect(screen.queryByText(/INSP-2026-001/i)).not.toBeInTheDocument();
    });

    it("cp_fnt_ins_003_abrir_detalle_de_inspeccion", async () => {
        const { router } = render_with_router(build_test_routes(), ["/inspections"]);

        const inspection_link = await screen.findByRole("link", {
            name: /INSP-2026-001/i,
        });

        expect(inspection_link).toHaveAttribute("href", "/inspections/10");

        await userEvent.click(inspection_link);

        await waitFor(() => {
            expect(router.state.location.pathname).toBe("/inspections/10");
        });
    });

    it("cp_fnt_ins_004_cargar_formulario_de_creacion", async () => {
        render_with_router(build_test_routes(), ["/inspections/new"]);

        expect(screen.getByLabelText(/código/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cliente/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tipo de equipo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tipo de inspección/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de inspección/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /guardar inspección/i }),
        ).toBeInTheDocument();
    });

    it("cp_fnt_ins_005_validar_campos_obligatorios_en_creacion", async () => {
        render_with_router(build_test_routes(), ["/inspections/new"]);

        fireEvent.click(
            screen.getByRole("button", { name: /guardar inspección/i }),
        );

        expect(screen.getByLabelText(/código/i)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        expect(screen.getByLabelText(/cliente/i)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        expect(screen.getByLabelText(/tipo de equipo/i)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        expect(screen.getByLabelText(/tipo de inspección/i)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        expect(screen.getByLabelText(/fecha de inspección/i)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    });

    it("cp_fnt_ins_007_cancelar_creacion_de_inspeccion", async () => {
        render_with_router(build_test_routes(), ["/inspections/new"]);

        const back_link = screen.getByRole("link", {
            name: /volver a inspecciones/i,
        });

        expect(back_link).toHaveAttribute("href", "/inspections");
    });

    it("cp_fnt_det_001_cargar_detalle_de_inspeccion", async () => {
        render_with_router(build_test_routes(), ["/inspections/10"]);

        expect(
            (await screen.findAllByText(/INSP-2026-010/i)).length,
        ).toBeGreaterThan(0);
        expect(screen.getByText(/Expediente técnico/i)).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Campos/i })).toBeInTheDocument();
    });

    it("cp_fnt_det_002_mostrar_estado_de_error_en_detalle", async () => {
        render_with_providers(<InspectionDetailError />);

        expect(
            screen.getByText(/No se pudo cargar el detalle de la inspección/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Verifica el identificador o la conexión con el backend/i),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /volver a inspecciones/i }),
        ).toBeInTheDocument();
    });

    it("cp_fnt_det_003_mostrar_tabs_operativas", async () => {
        render_with_router(build_test_routes(), ["/inspections/10"]);

        expect(
            await screen.findByRole("tab", { name: /Campos/i }),
        ).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Evidencias/i })).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: /Transcripciones/i }),
        ).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Informes/i })).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /Ejecutar validación OCR/i }),
        ).toBeInTheDocument();
    });

    it("cp_fnt_fld_001_listar_campos_de_inspeccion", async () => {
        render_with_router(build_test_routes(), ["/inspections/10"]);

        expect(await screen.findByText(/Campos estructurados/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Placa/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/ABC-123-MANUAL/i)).toBeInTheDocument();
        expect(screen.getByText(/ABC-123-OCR/i)).toBeInTheDocument();
    });

    it("cp_fnt_evd_001_listar_evidencias_por_inspeccion", async () => {
        render_with_router(build_test_routes(), ["/inspections/10"]);

        const evidences_tab = await screen.findByRole("tab", { name: /Evidencias/i });
        await userEvent.click(evidences_tab);

        expect(
            await screen.findByText(/Fotografía lateral de chasis/i),
        ).toBeInTheDocument();
    });
});