import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    act,
    fireEvent,
    render,
    renderHook,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock_validate_inspection_ocr = vi.fn();
const mock_get_inspection_transcriptions = vi.fn();
const mock_create_transcription = vi.fn();
const mock_update_transcription = vi.fn();
const mock_get_inspection_drafts = vi.fn();
const mock_generate_report_draft = vi.fn();
const mock_generate_llm_report_draft = vi.fn();
const mock_get_draft_by_id = vi.fn();
const mock_get_report_status = vi.fn();
const mock_get_report_history = vi.fn();
const mock_update_report_draft = vi.fn();
const mock_update_report_status = vi.fn();
const mock_create_inspection_evidence = vi.fn();

const mock_use_current_user_query = vi.fn();
const mock_use_inspections_query = vi.fn();
const mock_use_inspection_drafts_query = vi.fn();

vi.mock("@/features/auth/api/auth.queries", () => ({
    useCurrentUserQuery: (...args: unknown[]) =>
        mock_use_current_user_query(...args),
}));

vi.mock("@/features/inspections/api/inspections.api", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/inspections/api/inspections.api")
        >("@/features/inspections/api/inspections.api");

    return {
        ...actual,
        validateInspectionOcr: (inspection_id: number) =>
            mock_validate_inspection_ocr(inspection_id),
        getInspectionTranscriptions: (inspection_id: number) =>
            mock_get_inspection_transcriptions(inspection_id),
        createTranscription: (payload: unknown) =>
            mock_create_transcription(payload),
        updateTranscription: (transcription_id: number, payload: unknown) =>
            mock_update_transcription(transcription_id, payload),
        getInspectionDrafts: (inspection_id: number) =>
            mock_get_inspection_drafts(inspection_id),
        generateReportDraft: (inspection_id: number, payload: unknown) =>
            mock_generate_report_draft(inspection_id, payload),
        generateLlmReportDraft: (inspection_id: number, payload: unknown) =>
            mock_generate_llm_report_draft(inspection_id, payload),
        getDraftById: (draft_id: number) => mock_get_draft_by_id(draft_id),
        getReportStatus: (draft_id: number) => mock_get_report_status(draft_id),
        getReportHistory: (draft_id: number, limit: number) =>
            mock_get_report_history(draft_id, limit),
        updateReportDraft: (...args: unknown[]) =>
            mock_update_report_draft(...args),
        updateReportStatus: (draft_id: number, payload: unknown) =>
            mock_update_report_status(draft_id, payload),
        createInspectionEvidence: (inspection_id: number, payload: unknown) =>
            mock_create_inspection_evidence(inspection_id, payload),
    };
});

vi.mock("@/features/inspections/api/inspections.queries", async () => {
    const actual =
        await vi.importActual<
            typeof import("@/features/inspections/api/inspections.queries")
        >("@/features/inspections/api/inspections.queries");

    return {
        ...actual,
        useInspectionsQuery: (...args: unknown[]) => {
            const implementation = mock_use_inspections_query.getMockImplementation();

            if (implementation) {
                return mock_use_inspections_query(...args);
            }

            return actual.useInspectionsQuery();
        },
        useInspectionDraftsQuery: (...args: unknown[]) => {
            const implementation =
                mock_use_inspection_drafts_query.getMockImplementation();

            if (implementation) {
                return mock_use_inspection_drafts_query(...args);
            }

            return actual.useInspectionDraftsQuery(args[0] as number);
        },
    };
});

import { buildReportExportUrl } from "@/lib/api";
import { inspectionsKeys } from "@/features/inspections/api/inspections.keys";
import {
    useCreateTranscriptionMutation,
    useDraftQuery,
    useGenerateLlmReportDraftMutation,
    useGenerateReportDraftMutation,
    useInspectionDraftsQuery,
    useInspectionOcrValidationQuery,
    useInspectionTranscriptionsQuery,
    useReportHistoryQuery,
    useReportStatusQuery,
    useUpdateReportDraftMutation,
    useUpdateReportStatusMutation,
    useUpdateTranscriptionMutation,
    useValidateInspectionOcrMutation,
} from "@/features/inspections/api/inspections.queries";
import { AudioRecorderButton } from "@/features/inspections/components/inspection-audio-recorder";
import { InspectionOcrTab } from "@/features/inspections/components/inspection-ocr-tab";
import { InspectionTranscriptionsTab } from "@/features/inspections/components/inspection-transcriptions-tab";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import { render_with_providers } from "./render";

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

const ocr_validation_response = {
    inspectionid: 10,
    inspection_id: 10,
    processedevidences: 2,
    processed_evidences: 2,
    aggregatedtext: "PLACA ABC-123 VIN 999",
    aggregated_text: "PLACA ABC-123 VIN 999",
    summary: {
        matched: 1,
        mismatched: 1,
        notfound: 0,
        not_found: 0,
        averageconfidence: 0.93,
        average_confidence: 0.93,
    },
    results: [
        {
            fieldid: 201,
            field_id: 201,
            fieldkey: "placa",
            field_key: "placa",
            fieldlabel: "Placa",
            field_label: "Placa",
            manualvalue: "ABC-123",
            manual_value: "ABC-123",
            ocrvalue: "ABC-123",
            ocr_value: "ABC-123",
            finalvalue: "ABC-123",
            final_value: "ABC-123",
            validationstatus: "matched",
            validation_status: "matched",
            validationmessage: null,
            validation_message: null,
            confidence: 0.95,
        },
        {
            fieldid: 202,
            field_id: 202,
            fieldkey: "vin",
            field_key: "vin",
            fieldlabel: "VIN",
            field_label: "VIN",
            manualvalue: "111",
            manual_value: "111",
            ocrvalue: "999",
            ocr_value: "999",
            finalvalue: "999",
            final_value: "999",
            validationstatus: "mismatch",
            validation_status: "mismatch",
            validationmessage: "Valor distinto",
            validation_message: "Valor distinto",
            confidence: 0.91,
        },
    ],
};

const transcription_fixture = {
    id: 301,
    inspectionid: 10,
    evidenceid: 101,
    sourcefilepath: "/files/audio/audio-101.webm",
    language: "es",
    modelname: "base",
    rawtext: "texto bruto de prueba",
    finaltext: "texto final de prueba",
    confidence: 0.9,
    processed: true,
    editedmanually: false,
    createdat: "2026-07-06T10:00:00",
    updatedat: "2026-07-06T10:05:00",
};

const draft_fixture = {
    id: 501,
    inspectionid: 10,
    title: "Borrador técnico 1",
    templateversion: "v1",
    status: "edited",
    generatedtext: "texto generado",
    editedtext: "texto editado",
    sourcesnapshot: {},
    generationtimems: 1200,
    createdat: "2026-07-06T10:00:00",
    updatedat: "2026-07-06T10:05:00",
};

const report_status_fixture = {
    reportdraftid: 501,
    status: "edited",
    statusupdatedat: "2026-07-06T10:10:00",
    statusupdatedby: 1,
    lastaction: "save",
};

const report_history_fixture = [
    {
        id: 1,
        reportdraftid: 501,
        inspectionid: 10,
        fromstatus: "generated",
        tostatus: "edited",
        action: "save",
        actoruserid: 1,
        actorname: "Inspector Demo",
        notes: "Actualización manual",
        metadatajson: {},
        createdat: "2026-07-06T10:10:00",
    },
];

const evidences_fixture = [
    {
        id: 101,
        inspectionid: 10,
        inspection_id: 10,
        filepath: "/files/audio/audio-101.webm",
        file_path: "/files/audio/audio-101.webm",
        fileurl: "/files/audio/audio-101.webm",
        file_url: "/files/audio/audio-101.webm",
        filetype: "audio/webm",
        file_type: "audio/webm",
        evidencecategory: "audio",
        evidence_category: "audio",
        caption: "Audio 1",
        rawlabel: "audio",
        raw_label: "audio",
        normalizedlabel: "audio",
        normalized_label: "audio",
        evidenceslot: null,
        evidence_slot: null,
        componentcode: "audio",
        component_code: "audio",
        axlenumber: null,
        axle_number: null,
        side: null,
        isreference: false,
        is_reference: false,
        labelconfidence: 1,
        label_confidence: 1,
        metadatajson: {},
        metadata_json: {},
        ocrextractedtext: null,
        ocr_extracted_text: null,
        ocrconfidence: null,
        ocr_confidence: null,
        ocrprocessed: false,
        ocr_processed: false,
        ocrlastprocessedat: null,
        ocr_last_processed_at: null,
        uploadedat: "2026-07-06T10:00:00",
        uploaded_at: "2026-07-06T10:00:00",
    },
];

const inspections_fixture = [
    {
        id: 10,
        code: "INSP-2026-010",
        clientname: "Cliente Uno SAC",
        equipmenttype: "Semirremolque",
        inspectiontype: "Preoperacional",
        inspectiondate: "2026-07-06",
        location: "Trujillo",
        requestedby: "Operaciones",
        responsibleinspector: "Inspector Demo",
        status: "draft",
        createdat: "2026-07-06T10:00:00",
        updatedat: "2026-07-06T10:05:00",
    },
    {
        id: 11,
        code: "INSP-2026-011",
        clientname: "Cliente Dos SAC",
        equipmenttype: "Volquete",
        inspectiontype: "Técnica",
        inspectiondate: "2026-07-07",
        location: "Chiclayo",
        requestedby: "Mantenimiento",
        responsibleinspector: "Otro Inspector",
        status: "finalized",
        createdat: "2026-07-06T10:00:00",
        updatedat: "2026-07-06T10:05:00",
    },
];

class MockMediaRecorder {
    static isTypeSupported = vi.fn(() => true);

    state = "inactive";
    mimeType: string;
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void | Promise<void>) | null = null;
    onerror: (() => void) | null = null;

    constructor(
        _stream: MediaStream,
        options?: {
            mimeType?: string;
        },
    ) {
        this.mimeType = options?.mimeType ?? "audio/webm";
    }

    start() {
        this.state = "recording";
    }

    requestData() {
        this.ondataavailable?.({
            data: new Blob(["audio-content"], { type: this.mimeType }),
        });
    }

    stop() {
        this.state = "inactive";
        void this.onstop?.();
    }
}

describe("inspections_reporting_and_transcriptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mock_validate_inspection_ocr.mockResolvedValue(ocr_validation_response);
        mock_get_inspection_transcriptions.mockResolvedValue([transcription_fixture]);
        mock_create_transcription.mockResolvedValue(transcription_fixture);
        mock_update_transcription.mockResolvedValue({
            ...transcription_fixture,
            finaltext: "texto final actualizado",
            editedmanually: true,
        });
        mock_get_inspection_drafts.mockResolvedValue([draft_fixture]);
        mock_generate_report_draft.mockResolvedValue(draft_fixture);
        mock_generate_llm_report_draft.mockResolvedValue({
            ...draft_fixture,
            id: 502,
            status: "generatedllm",
            templateversion: "llama3-v1",
        });
        mock_get_draft_by_id.mockResolvedValue(draft_fixture);
        mock_get_report_status.mockResolvedValue(report_status_fixture);
        mock_get_report_history.mockResolvedValue(report_history_fixture);
        mock_update_report_draft.mockResolvedValue({
            ...draft_fixture,
            editedtext: "texto editado actualizado",
        });
        mock_update_report_status.mockResolvedValue({
            ...report_status_fixture,
            status: "finalized",
        });
        mock_create_inspection_evidence.mockResolvedValue({
            id: 901,
            inspectionid: 10,
            filepath: "/files/audio/inspection-10-recorded.webm",
            fileurl: "/files/audio/inspection-10-recorded.webm",
            filetype: "audio/webm",
            evidencecategory: "audio",
            caption: "Audio grabado desde micrófono",
            rawlabel: "audio",
            normalizedlabel: "audio",
            evidenceslot: null,
            componentcode: "audio",
            axlenumber: null,
            side: null,
            isreference: false,
            labelconfidence: 1,
            metadatajson: {},
            ocrextractedtext: null,
            ocrconfidence: null,
            ocrprocessed: false,
            ocrlastprocessedat: null,
            uploadedat: "2026-07-06T10:00:00",
        });

        mock_use_current_user_query.mockReturnValue({
            data: {
                id: 1,
                full_name: "Inspector Demo",
                fullname: "Inspector Demo",
                role: "admin",
            },
        });

        mock_use_inspections_query.mockImplementation(() => ({
            data: inspections_fixture,
            isLoading: false,
            isError: false,
            error: null,
        }));

        mock_use_inspection_drafts_query.mockImplementation((inspection_id: number) => {
            if (inspection_id === 10) {
                return {
                    data: [draft_fixture],
                    isLoading: false,
                    isError: false,
                    error: null,
                };
            }

            return {
                data: [
                    {
                        ...draft_fixture,
                        id: 777,
                        inspectionid: 11,
                        title: "Borrador final",
                        status: "finalized",
                    },
                ],
                isLoading: false,
                isError: false,
                error: null,
            };
        });

        Object.defineProperty(globalThis, "MediaRecorder", {
            configurable: true,
            writable: true,
            value: MockMediaRecorder,
        });

        Object.defineProperty(navigator, "mediaDevices", {
            configurable: true,
            value: {
                getUserMedia: vi.fn().mockResolvedValue({
                    getTracks: () => [
                        {
                            stop: vi.fn(),
                        },
                    ],
                }),
            },
        });
    });

    it("cp_fnt_ocr_001_validar_ocr_de_inspeccion", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => ({
                query: useInspectionOcrValidationQuery(inspection_id, true),
                mutation: useValidateInspectionOcrMutation(inspection_id),
            }),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        await waitFor(() => {
            expect(result.current.query.data).toEqual(ocr_validation_response);
        });

        expect(mock_validate_inspection_ocr).toHaveBeenCalledWith(inspection_id);

        await act(async () => {
            await result.current.mutation.mutateAsync();
        });

        expect(mock_validate_inspection_ocr).toHaveBeenCalledTimes(2);

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.fields(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.evidences(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.ocrValidation(inspection_id),
            });
        });
    });

    it("cp_fnt_ocr_002_visualizar_resumen_de_validacion_ocr", () => {
        const mutate_spy = vi.fn();

        render(
            <InspectionOcrTab
                mutation={{
                    mutate: mutate_spy,
                    isPending: false,
                }}
                result={{
                    processed_evidences: ocr_validation_response.processedevidences,
                    aggregated_text: ocr_validation_response.aggregatedtext,
                    summary: ocr_validation_response.summary,
                    results: ocr_validation_response.results,
                }}
            />,
        );

        expect(
            screen.getByText("Validación OCR por inspección"),
        ).toBeInTheDocument();
        expect(screen.getByText("Validar OCR")).toBeInTheDocument();
        expect(screen.getByText(/PLACA ABC-123 VIN 999/i)).toBeInTheDocument();
        expect(screen.getByText(/^Placa$/i)).toBeInTheDocument();
        expect(screen.getByText(/^VIN$/i)).toBeInTheDocument();
    });

    it("cp_fnt_trn_001_listar_transcripciones", async () => {
        const { result } = renderHook(
            () => useInspectionTranscriptionsQuery(10),
            {
                wrapper: create_wrapper(build_query_client()),
            },
        );

        await waitFor(() => {
            expect(result.current.data).toEqual([transcription_fixture]);
        });

        render(
            <InspectionTranscriptionsTab
                evidences={evidences_fixture}
                transcriptions={result.current.data ?? []}
                isCreating={false}
                savingTranscriptionId={null}
                onCreate={vi.fn()}
                onSave={vi.fn()}
                onCreateVoiceTranscription={vi.fn()}
            />,
        );

        expect(screen.getByText("Nueva transcripción")).toBeInTheDocument();
        expect(screen.getByDisplayValue("texto bruto de prueba")).toBeInTheDocument();
        expect(screen.getByDisplayValue("texto final de prueba")).toBeInTheDocument();
        expect(
            screen.getByDisplayValue("/files/audio/audio-101.webm"),
        ).toBeInTheDocument();
    });

    it("cp_fnt_trn_002_crear_transcripcion_desde_evidencia", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useCreateTranscriptionMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const create_transcription_payload = {
            inspectionid: inspection_id,
            inspection_id: inspection_id,
            evidenceid: 101,
            evidence_id: 101,
            sourcefilepath: "/files/audio/audio-101.webm",
            source_file_path: "/files/audio/audio-101.webm",
            language: "es",
            modelname: "base",
            model_name: "base",
        };

        await act(async () => {
            await result.current.mutateAsync(create_transcription_payload);
        });

        expect(mock_create_transcription).toHaveBeenCalledWith(
            create_transcription_payload,
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.transcriptions(inspection_id),
            });
        });
    });

    it("cp_fnt_trn_003_iniciar_grabacion_de_audio", async () => {
        const on_recorded = vi.fn();

        render(<AudioRecorderButton onRecorded={on_recorded} />);

        fireEvent.click(screen.getByRole("button", { name: /grabar desde micrófono/i }));

        await waitFor(() => {
            expect(
                navigator.mediaDevices.getUserMedia,
            ).toHaveBeenCalledWith({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
        });

        expect(
            screen.getByRole("button", { name: /detener grabación/i }),
        ).toBeInTheDocument();
    });

    it("cp_fnt_trn_004_detener_grabacion_de_audio", async () => {
        const on_recorded = vi.fn().mockResolvedValue(undefined);

        render(<AudioRecorderButton onRecorded={on_recorded} />);

        fireEvent.click(screen.getByRole("button", { name: /grabar desde micrófono/i }));

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /detener grabación/i }),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /detener grabación/i }));

        await waitFor(() => {
            expect(on_recorded).toHaveBeenCalledTimes(1);
        });

        expect(on_recorded.mock.calls[0][0]).toBeInstanceOf(Blob);
    });

    it("cp_fnt_trn_005_crear_transcripcion_desde_audio_grabado", async () => {
        const inspection_id = 10;

        const on_create_voice_transcription = vi.fn(async (audio_blob: Blob) => {
            const audio_file = new File(
                [audio_blob],
                `inspection-${inspection_id}-${Date.now()}.webm`,
                {
                    type: audio_blob.type || "audio/webm",
                },
            );

            const created_evidence = await mock_create_inspection_evidence(
                inspection_id,
                {
                    file: audio_file,
                    evidencecategory: "audio",
                    caption: "Audio grabado desde micrófono",
                },
            );

            const voice_transcription_payload = {
                inspectionid: inspection_id,
                inspection_id: inspection_id,
                evidenceid: created_evidence.id,
                evidence_id: created_evidence.id,
                sourcefilepath: created_evidence.filepath ?? created_evidence.file_path,
                source_file_path:
                    created_evidence.filepath ?? created_evidence.file_path,
                language: "es",
                modelname: "base",
                model_name: "base",
            };

            await mock_create_transcription(voice_transcription_payload);
        });

        render(<AudioRecorderButton onRecorded={on_create_voice_transcription} />);

        fireEvent.click(screen.getByRole("button", { name: /grabar desde micrófono/i }));

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /detener grabación/i }),
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /detener grabación/i }));

        await waitFor(() => {
            expect(mock_create_inspection_evidence).toHaveBeenCalledTimes(1);
            expect(mock_create_transcription).toHaveBeenCalledTimes(1);
        });

        const evidence_payload = mock_create_inspection_evidence.mock.calls[0][1];

        expect(mock_create_inspection_evidence).toHaveBeenCalledWith(
            inspection_id,
            expect.objectContaining({
                evidencecategory: "audio",
                caption: "Audio grabado desde micrófono",
            }),
        );

        expect(evidence_payload.file).toBeInstanceOf(File);

        expect(mock_create_transcription).toHaveBeenCalledWith(
            expect.objectContaining({
                inspectionid: inspection_id,
                inspection_id: inspection_id,
                evidenceid: 901,
                evidence_id: 901,
                language: "es",
            }),
        );

        expect(
            mock_create_inspection_evidence.mock.invocationCallOrder[0],
        ).toBeLessThan(mock_create_transcription.mock.invocationCallOrder[0]);
    });

    it("cp_fnt_trn_006_editar_texto_final_de_transcripcion", async () => {
        const inspection_id = 10;
        const transcription_id = 301;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useUpdateTranscriptionMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const update_transcription_payload = {
            finaltext: "texto final actualizado",
            final_text: "texto final actualizado",
        };

        await act(async () => {
            await result.current.mutateAsync({
                transcriptionId: transcription_id,
                payload: update_transcription_payload,
            });
        });

        expect(mock_update_transcription).toHaveBeenCalledWith(
            transcription_id,
            update_transcription_payload,
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.transcriptions(inspection_id),
            });
        });
    });

    it("cp_fnt_drf_001_listar_borradores_por_inspeccion", async () => {
        const { result } = renderHook(() => useInspectionDraftsQuery(10), {
            wrapper: create_wrapper(build_query_client()),
        });

        await waitFor(() => {
            expect(result.current.data).toEqual([draft_fixture]);
        });
    });

    it("cp_fnt_drf_002_generar_borrador_base", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useGenerateReportDraftMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        await act(async () => {
            await result.current.mutateAsync("v1");
        });

        expect(mock_generate_report_draft).toHaveBeenCalledWith(inspection_id, {
            template_version: "v1",
        });

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.drafts(inspection_id),
            });
        });
    });

    it("cp_fnt_llm_001_generar_borrador_con_llm", async () => {
        const inspection_id = 10;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useGenerateLlmReportDraftMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        await act(async () => {
            await result.current.mutateAsync("llama3-v1");
        });

        expect(mock_generate_llm_report_draft).toHaveBeenCalledWith(
            inspection_id,
            {
                template_version: "llama3-v1",
            },
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.drafts(inspection_id),
            });
        });
    });

    it("cp_fnt_drf_003_seleccionar_borrador_y_consultar_detalle", async () => {
        const { result } = renderHook(() => useDraftQuery(501), {
            wrapper: create_wrapper(build_query_client()),
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(draft_fixture);
        });

        expect(mock_get_draft_by_id).toHaveBeenCalledWith(501);
    });

    it("cp_fnt_sts_001_consultar_estado_actual_del_borrador", async () => {
        const { result } = renderHook(() => useReportStatusQuery(501), {
            wrapper: create_wrapper(build_query_client()),
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(report_status_fixture);
        });

        expect(mock_get_report_status).toHaveBeenCalledWith(501);
    });

    it("cp_fnt_sts_002_consultar_historial_del_borrador", async () => {
        const { result } = renderHook(() => useReportHistoryQuery(501, 20), {
            wrapper: create_wrapper(build_query_client()),
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(report_history_fixture);
        });

        expect(mock_get_report_history).toHaveBeenCalledWith(501, 20);
    });

    it("cp_fnt_drf_004_actualizar_texto_editado_del_borrador", async () => {
        const inspection_id = 10;
        const draft_id = 501;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useUpdateReportDraftMutation(inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const update_report_draft_payload = {
            draftId: draft_id,
            editedtext: "texto editado actualizado",
            edited_text: "texto editado actualizado",
            status: "edited",
        };

        await act(async () => {
            await result.current.mutateAsync(update_report_draft_payload);
        });

        expect(mock_update_report_draft).toHaveBeenCalledWith(
            draft_id,
            expect.objectContaining({
                edited_text: "texto editado actualizado",
                status: "edited",
            }),
        );

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.drafts(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.draft(draft_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.reportStatus(draft_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.reportHistory(draft_id, 50),
            });
        });
    });

    it("cp_fnt_sts_003_cambiar_estado_del_informe", async () => {
        const inspection_id = 10;
        const draft_id = 501;
        const query_client = build_query_client();
        const invalidate_queries_spy = vi
            .spyOn(query_client, "invalidateQueries")
            .mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useUpdateReportStatusMutation(draft_id, inspection_id),
            {
                wrapper: create_wrapper(query_client),
            },
        );

        const payload = {
            status: "finalized",
            notes: "Informe finalizado",
        };

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mock_update_report_status).toHaveBeenCalledWith(draft_id, payload);

        await waitFor(() => {
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.drafts(inspection_id),
            });
            expect(invalidate_queries_spy).toHaveBeenCalledWith({
                queryKey: inspectionsKeys.detail(inspection_id),
            });
        });
    });

    it("cp_fnt_exp_001_exportar_borrador_a_docx", () => {
        expect(buildReportExportUrl("docx", 501)).toBe(
            "http://127.0.0.1:8000/api/v1/report-export/docx/501",
        );
    });

    it("cp_fnt_exp_002_exportar_borrador_a_pdf", () => {
        expect(buildReportExportUrl("pdf", 501)).toBe(
            "http://127.0.0.1:8000/api/v1/report-export/pdf/501",
        );
    });

    it("cp_fnt_rpt_001_listar_vista_general_de_reportes", async () => {
        render_with_providers(<ReportsPage />);

        expect(await screen.findByText("INSP-2026-010")).toBeInTheDocument();
        expect(screen.getByText("INSP-2026-011")).toBeInTheDocument();
        expect(screen.getByText("Cliente Uno SAC")).toBeInTheDocument();
        expect(screen.getByText("Cliente Dos SAC")).toBeInTheDocument();
    });

    it("cp_fnt_rpt_002_buscar_reportes_por_codigo_cliente_o_inspector", async () => {
        render_with_providers(<ReportsPage />);

        const search_input = await screen.findByPlaceholderText(
            /buscar por código, cliente o inspector/i,
        );

        fireEvent.change(search_input, {
            target: {
                value: "cliente uno",
            },
        });

        await waitFor(() => {
            expect(screen.getByText("INSP-2026-010")).toBeInTheDocument();
            expect(screen.queryByText("INSP-2026-011")).not.toBeInTheDocument();
        });

        fireEvent.change(search_input, {
            target: {
                value: "otro inspector",
            },
        });

        await waitFor(() => {
            expect(screen.getByText("INSP-2026-011")).toBeInTheDocument();
            expect(screen.queryByText("INSP-2026-010")).not.toBeInTheDocument();
        });
    });

    it("cp_fnt_rpt_003_filtrar_reportes_por_estado", async () => {
        render_with_providers(<ReportsPage />);

        const status_filter = await screen.findByRole("combobox");

        fireEvent.change(status_filter, {
            target: {
                value: "finalized",
            },
        });

        await waitFor(() => {
            expect(screen.getByText("INSP-2026-011")).toBeInTheDocument();
            expect(screen.queryByText("INSP-2026-010")).not.toBeInTheDocument();
        });
    });

    it("cp_fnt_rpt_004_restringir_vista_para_rol_inspector", async () => {
        mock_use_current_user_query.mockReturnValue({
            data: {
                id: 1,
                full_name: "Inspector Demo",
                fullname: "Inspector Demo",
                role: "inspector",
            },
        });

        render_with_providers(<ReportsPage />);

        await waitFor(() => {
            expect(screen.getByText("INSP-2026-010")).toBeInTheDocument();
            expect(screen.queryByText("INSP-2026-011")).not.toBeInTheDocument();
        });
    });
});