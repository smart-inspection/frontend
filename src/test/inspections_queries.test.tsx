import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock_create_inspection = vi.fn();
const mock_create_inspection_field = vi.fn();
const mock_update_inspection_field = vi.fn();
const mock_create_inspection_evidence = vi.fn();
const mock_run_evidence_ocr = vi.fn();
const mock_extract_evidence_ocr = vi.fn();

vi.mock("@/features/inspections/api/inspections.api", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/inspections/api/inspections.api")
        >("@/features/inspections/api/inspections.api");

    return {
        ...actual,
        createInspection: (payload: unknown) => mock_create_inspection(payload),
        createInspectionField: (inspection_id: number, payload: unknown) =>
            mock_create_inspection_field(inspection_id, payload),
        updateInspectionField: (
            inspection_id: number,
            field_id: number,
            payload: unknown,
        ) => mock_update_inspection_field(inspection_id, field_id, payload),
        createInspectionEvidence: (inspection_id: number, payload: unknown) =>
            mock_create_inspection_evidence(inspection_id, payload),
        runEvidenceOcr: (evidence_id: number) => mock_run_evidence_ocr(evidence_id),
        extractEvidenceOcr: (evidence_id: number) =>
            mock_extract_evidence_ocr(evidence_id),
    };
});

import { inspectionsKeys } from "@/features/inspections/api/inspections.keys";
import {
    useCreateInspectionEvidenceMutation,
    useCreateInspectionFieldMutation,
    useCreateInspectionMutation,
    useExtractEvidenceOcrMutation,
    useRunEvidenceOcrMutation,
    useUpdateInspectionFieldMutation,
} from "@/features/inspections/api/inspections.queries";

function build_query_client() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

function create_wrapper(query_client: QueryClient) {
    return function Wrapper({ children }: PropsWithChildren) {
        return (
            <QueryClientProvider client={query_client}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe("inspections_queries", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mock_create_inspection.mockResolvedValue({
            id: 99,
            code: "INSP-2026-099",
        });

        mock_create_inspection_field.mockResolvedValue({
            id: 201,
            inspectionid: 10,
            fieldkey: "placa",
            fieldlabel: "Placa",
            fieldgroup: "identificacion",
            expectedtype: "string",
            manualvalue: "ABC-123",
            ocrvalue: null,
            finalvalue: null,
            validationstatus: "pending",
            validationmessage: null,
            confidence: null,
            updatedat: "2026-07-06T10:00:00",
        });

        mock_update_inspection_field.mockResolvedValue({
            id: 201,
            inspectionid: 10,
            fieldkey: "placa",
            fieldlabel: "Placa",
            fieldgroup: "identificacion",
            expectedtype: "string",
            manualvalue: "ABC-123",
            ocrvalue: "ABC-123",
            finalvalue: "ABC-123-FINAL",
            validationstatus: "matched",
            validationmessage: null,
            confidence: 0.98,
            updatedat: "2026-07-06T10:10:00",
        });

        mock_create_inspection_evidence.mockResolvedValue({
            id: 101,
            inspectionid: 10,
            filepath: "/files/evidencias/evidencia-101.jpg",
            fileurl: "/files/evidencias/evidencia-101.jpg",
            filetype: "image/jpeg",
            evidencecategory: "general",
            caption: "Foto lateral",
            rawlabel: "general",
            normalizedlabel: "general",
            evidenceslot: "lateral",
            componentcode: "general",
            axlenumber: 1,
            side: "left",
            isreference: false,
            labelconfidence: 0.92,
            metadatajson: {},
            ocrextractedtext: null,
            ocrconfidence: null,
            ocrprocessed: false,
            ocrlastprocessedat: null,
            uploadedat: "2026-07-06T10:00:00",
        });

        mock_run_evidence_ocr.mockResolvedValue({
            evidenceid: 101,
            ocrextractedtext: "PLACA ABC-123",
            ocrconfidence: 0.94,
            ocrprocessed: true,
            ocrlastprocessedat: "2026-07-06T10:05:00",
        });

        mock_extract_evidence_ocr.mockResolvedValue({
            evidenceid: 101,
            evidencecategory: "general",
            filepath: "/files/evidencias/evidencia-101.jpg",
            extractedtext: "PLACA ABC-123",
            confidence: 0.94,
        });
    });

    it("cp_fnt_ins_006_crear_inspeccion_valida", async () => {
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(() => useCreateInspectionMutation(), {
            wrapper: create_wrapper(query_client),
        });

        const payload = {
            code: "INSP-2026-099",
            client_name: "Cliente Nuevo SAC",
            equipment_type: "Semirremolque",
            inspection_type: "Preoperacional",
            inspection_date: "2026-07-06T11:00:00",
            location: "Trujillo",
            requested_by: "Usuario Demo",
            responsible_inspector: "Inspector Demo",
        };

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mock_create_inspection).toHaveBeenCalledWith(payload);

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.list(),
            });
        });
    });

    it("cp_fnt_fld_002_crear_campo_manual", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useCreateInspectionFieldMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const payload = {
            field_key: "placa",
            field_label: "Placa",
            field_group: "identificacion",
            expected_type: "string",
            manual_value: "ABC-123",
        };

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mock_create_inspection_field).toHaveBeenCalledWith(
            inspection_id,
            payload,
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.fields(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.detail(inspection_id),
            });
        });
    });

    it("cp_fnt_fld_003_actualizar_valor_final_de_campo", async () => {
        const inspection_id = 10;
        const field_id = 201;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useUpdateInspectionFieldMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const payload = {
            final_value: "ABC-123-FINAL",
        };

        await act(async () => {
            await result.current.mutateAsync({
                fieldId: field_id,
                payload,
            });
        });

        expect(mock_update_inspection_field).toHaveBeenCalledWith(
            inspection_id,
            field_id,
            payload,
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.fields(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.detail(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.ocrValidation(inspection_id),
            });
        });
    });

    it("cp_fnt_evd_002_subir_evidencia", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useCreateInspectionEvidenceMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const payload = {
            file: new File(["binary-image"], "evidencia.jpg", {
                type: "image/jpeg",
            }),
            evidence_category: "general",
            caption: "Foto lateral",
            raw_label: "general",
            component_code: "general",
            axle_number: 1,
            side: "left",
            is_reference: false,
        };

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mock_create_inspection_evidence).toHaveBeenCalledWith(
            inspection_id,
            payload,
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.evidences(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.detail(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.ocrValidation(inspection_id),
            });
        });
    });

    it("cp_fnt_evd_003_ejecutar_ocr_sobre_evidencia", async () => {
        const inspection_id = 10;
        const evidence_id = 101;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useRunEvidenceOcrMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        await act(async () => {
            await result.current.mutateAsync(evidence_id);
        });

        expect(mock_run_evidence_ocr).toHaveBeenCalledWith(evidence_id);

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.evidences(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.fields(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.ocrValidation(inspection_id),
            });
        });
    });

    it("cp_fnt_evd_004_extraer_texto_desde_evidencia", async () => {
        const inspection_id = 10;
        const evidence_id = 101;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useExtractEvidenceOcrMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        await act(async () => {
            await result.current.mutateAsync(evidence_id);
        });

        expect(mock_extract_evidence_ocr).toHaveBeenCalledWith(evidence_id);

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.evidences(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.fields(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.ocrValidation(inspection_id),
            });
        });
    });
});