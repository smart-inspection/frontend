import {
    apiGet,
    apiPatch,
    apiPost,
    apiPostForm,
    apiPut,
    API_BASE_URL,
} from "@/lib/api"

import type {
    Evidence,
    EvidenceCreateInput,
    EvidenceOcrResponse,
    Inspection,
    InspectionCreateInput,
    InspectionField,
    InspectionFieldCreateInput, InspectionRequestConvertInput,
    LlmReportGenerateInput,
    OcrExtractResponse,
    OcrValidationItem,
    OcrValidationResponse,
    OcrValidationSummary,
    ReportDraft,
    ReportDraftGenerateInput,
    ReportDraftUpdateInput,
    ReportStatus,
    ReportStatusLog,
    ReportStatusUpdateInput,
    Transcription,
    TranscriptionCreateInput,
    TranscriptionUpdateInput,
} from "../types/inspections.types"

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback
}

function asNullableString(value: unknown): string | null {
    return typeof value === "string" ? value : null
}

function asNumber(value: unknown, fallback = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asNullableNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asBoolean(value: unknown, fallback = false): boolean {
    return typeof value === "boolean" ? value : fallback
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null
}

function pickFirst<T>(...values: T[]): T | undefined {
    return values.find((value) => value !== undefined && value !== null)
}

function mapInspection(raw: any): Inspection {
    return {
        id: asNumber(raw?.id),
        code: asString(raw?.code),
        client_name: asString(pickFirst(raw?.client_name, raw?.clientname)),
        equipment_type: asString(pickFirst(raw?.equipment_type, raw?.equipmenttype)),
        inspection_type: asString(pickFirst(raw?.inspection_type, raw?.inspectiontype)),
        inspection_date: asString(pickFirst(raw?.inspection_date, raw?.inspectiondate)),
        location: asNullableString(raw?.location),
        requested_by: asNullableString(pickFirst(raw?.requested_by, raw?.requestedby)),
        responsible_inspector: asNullableString(
            pickFirst(raw?.responsible_inspector, raw?.responsibleinspector),
        ),
        status: asString(raw?.status, "draft"),
        created_at: asString(pickFirst(raw?.created_at, raw?.createdat)),
        updated_at: asString(pickFirst(raw?.updated_at, raw?.updatedat)),
    }
}

function mapInspectionField(raw: any): InspectionField {
    return {
        id: asNumber(raw?.id),
        inspection_id: asNumber(pickFirst(raw?.inspection_id, raw?.inspectionid)),
        field_key: asString(pickFirst(raw?.field_key, raw?.fieldkey)),
        field_label: asString(pickFirst(raw?.field_label, raw?.fieldlabel)),
        field_group: asString(pickFirst(raw?.field_group, raw?.fieldgroup)),
        expected_type: asString(pickFirst(raw?.expected_type, raw?.expectedtype)),
        manual_value: asNullableString(pickFirst(raw?.manual_value, raw?.manualvalue)),
        ocr_value: asNullableString(pickFirst(raw?.ocr_value, raw?.ocrvalue)),
        final_value: asNullableString(pickFirst(raw?.final_value, raw?.finalvalue)),
        validation_status: asString(
            pickFirst(raw?.validation_status, raw?.validationstatus),
            "pending",
        ),
        validation_message: asNullableString(
            pickFirst(raw?.validation_message, raw?.validationmessage),
        ),
        confidence: asNullableNumber(raw?.confidence),
        updated_at: asString(pickFirst(raw?.updated_at, raw?.updatedat)),
    }
}

function mapEvidence(raw: any): Evidence {
    return {
        id: asNumber(raw?.id),
        inspection_id: asNumber(pickFirst(raw?.inspection_id, raw?.inspectionid)),
        file_path: asString(pickFirst(raw?.file_path, raw?.filepath)),
        file_url: asString(pickFirst(raw?.file_url, raw?.fileurl)),
        file_type: asString(pickFirst(raw?.file_type, raw?.filetype)),
        evidence_category: asString(pickFirst(raw?.evidence_category, raw?.evidencecategory)),
        caption: asNullableString(raw?.caption),
        raw_label: asNullableString(pickFirst(raw?.raw_label, raw?.rawlabel)),
        normalized_label: asNullableString(pickFirst(raw?.normalized_label, raw?.normalizedlabel)),
        evidence_slot: asNullableString(pickFirst(raw?.evidence_slot, raw?.evidenceslot)),
        component_code: asNullableString(pickFirst(raw?.component_code, raw?.componentcode)),
        axle_number: asNullableNumber(pickFirst(raw?.axle_number, raw?.axlenumber)),
        side: asNullableString(raw?.side),
        is_reference: asBoolean(pickFirst(raw?.is_reference, raw?.isreference), false),
        label_confidence: asNullableNumber(pickFirst(raw?.label_confidence, raw?.labelconfidence)),
        metadata_json: asRecord(pickFirst(raw?.metadata_json, raw?.metadatajson)),
        ocr_extracted_text: asNullableString(pickFirst(raw?.ocr_extracted_text, raw?.ocrextractedtext)),
        ocr_confidence: asNullableNumber(pickFirst(raw?.ocr_confidence, raw?.ocrconfidence)),
        ocr_processed: asBoolean(pickFirst(raw?.ocr_processed, raw?.ocrprocessed), false),
        ocr_last_processed_at: asNullableString(
            pickFirst(raw?.ocr_last_processed_at, raw?.ocrlastprocessedat),
        ),
        uploaded_at: asString(pickFirst(raw?.uploaded_at, raw?.uploadedat)),
    }
}

function mapEvidenceOcrResponse(raw: any): EvidenceOcrResponse {
    return {
        evidence_id: asNumber(pickFirst(raw?.evidence_id, raw?.evidenceid)),
        ocr_extracted_text: asNullableString(
            pickFirst(raw?.ocr_extracted_text, raw?.ocrextractedtext),
        ),
        ocr_confidence: asNullableNumber(
            pickFirst(raw?.ocr_confidence, raw?.ocrconfidence),
        ),
        ocr_processed: asBoolean(pickFirst(raw?.ocr_processed, raw?.ocrprocessed)),
        ocr_last_processed_at: asNullableString(
            pickFirst(raw?.ocr_last_processed_at, raw?.ocrlastprocessedat),
        ),
    }
}

function mapOcrExtractResponse(raw: any): OcrExtractResponse {
    return {
        evidence_id: asNumber(pickFirst(raw?.evidence_id, raw?.evidenceid)),
        evidence_category: asString(
            pickFirst(raw?.evidence_category, raw?.evidencecategory),
        ),
        file_path: asString(pickFirst(raw?.file_path, raw?.filepath)),
        extracted_text: asString(pickFirst(raw?.extracted_text, raw?.extractedtext)),
        confidence: asNullableNumber(raw?.confidence),
    }
}

function mapOcrValidationItem(raw: any): OcrValidationItem {
    return {
        field_id: asNumber(pickFirst(raw?.field_id, raw?.fieldid)),
        field_key: asString(pickFirst(raw?.field_key, raw?.fieldkey)),
        field_label: asString(pickFirst(raw?.field_label, raw?.fieldlabel)),
        manual_value: asNullableString(pickFirst(raw?.manual_value, raw?.manualvalue)),
        ocr_value: asNullableString(pickFirst(raw?.ocr_value, raw?.ocrvalue)),
        final_value: asNullableString(pickFirst(raw?.final_value, raw?.finalvalue)),
        validation_status: asString(
            pickFirst(raw?.validation_status, raw?.validationstatus),
            "pending",
        ),
        validation_message: asNullableString(
            pickFirst(raw?.validation_message, raw?.validationmessage),
        ),
        confidence: asNullableNumber(raw?.confidence),
    }
}

function mapOcrValidationSummary(raw: any): OcrValidationSummary {
    return {
        matched: asNumber(raw?.matched),
        mismatched: asNumber(raw?.mismatched),
        not_found: asNumber(pickFirst(raw?.not_found, raw?.notfound)),
        average_confidence: asNullableNumber(
            pickFirst(raw?.average_confidence, raw?.averageconfidence),
        ),
    }
}

function mapOcrValidationResponse(raw: any): OcrValidationResponse {
    return {
        inspection_id: asNumber(pickFirst(raw?.inspection_id, raw?.inspectionid)),
        processed_evidences: asNumber(
            pickFirst(raw?.processed_evidences, raw?.processedevidences),
        ),
        aggregated_text: asString(pickFirst(raw?.aggregated_text, raw?.aggregatedtext)),
        summary: mapOcrValidationSummary(raw?.summary ?? {}),
        results: Array.isArray(raw?.results) ? raw.results.map(mapOcrValidationItem) : [],
    }
}

function mapTranscription(raw: any): Transcription {
    return {
        id: asNumber(raw?.id),
        inspection_id: asNumber(pickFirst(raw?.inspection_id, raw?.inspectionid)),
        evidence_id: asNullableNumber(pickFirst(raw?.evidence_id, raw?.evidenceid)),
        source_file_path: asString(
            pickFirst(raw?.source_file_path, raw?.sourcefilepath),
        ),
        language: asNullableString(raw?.language),
        model_name: asString(pickFirst(raw?.model_name, raw?.modelname)),
        raw_text: asNullableString(pickFirst(raw?.raw_text, raw?.rawtext)),
        final_text: asNullableString(pickFirst(raw?.final_text, raw?.finaltext)),
        confidence: asNullableNumber(raw?.confidence),
        processed: asBoolean(raw?.processed),
        edited_manually: asBoolean(
            pickFirst(raw?.edited_manually, raw?.editedmanually),
        ),
        created_at: asString(pickFirst(raw?.created_at, raw?.createdat)),
        updated_at: asString(pickFirst(raw?.updated_at, raw?.updatedat)),
    }
}

function mapReportDraft(raw: any): ReportDraft {
    return {
        id: asNumber(raw?.id),
        inspection_id: asNumber(pickFirst(raw?.inspection_id, raw?.inspectionid)),
        title: asString(raw?.title),
        template_version: asString(
            pickFirst(raw?.template_version, raw?.templateversion),
        ),
        status: asString(raw?.status),
        generated_text: asString(pickFirst(raw?.generated_text, raw?.generatedtext)),
        edited_text: asNullableString(pickFirst(raw?.edited_text, raw?.editedtext)),
        source_snapshot: asRecord(
            pickFirst(raw?.source_snapshot, raw?.sourcesnapshot),
        ),
        generation_time_ms: asNullableNumber(
            pickFirst(raw?.generation_time_ms, raw?.generationtimems),
        ),
        created_at: asString(pickFirst(raw?.created_at, raw?.createdat)),
        updated_at: asString(pickFirst(raw?.updated_at, raw?.updatedat)),
    }
}

function mapReportStatus(raw: any): ReportStatus {
    return {
        report_draft_id: asNumber(
            pickFirst(raw?.report_draft_id, raw?.reportdraftid),
        ),
        status: asString(raw?.status),
        status_updated_at: asNullableString(
            pickFirst(raw?.status_updated_at, raw?.statusupdatedat),
        ),
        status_updated_by: asNullableNumber(
            pickFirst(raw?.status_updated_by, raw?.statusupdatedby),
        ),
        last_action: asNullableString(pickFirst(raw?.last_action, raw?.lastaction)),
    }
}

function mapReportStatusLog(raw: any): ReportStatusLog {
    return {
        id: asNumber(raw?.id),
        report_draft_id: asNumber(
            pickFirst(raw?.report_draft_id, raw?.reportdraftid),
        ),
        inspection_id: asNullableNumber(
            pickFirst(raw?.inspection_id, raw?.inspectionid),
        ),
        from_status: asNullableString(
            pickFirst(raw?.from_status, raw?.fromstatus),
        ),
        to_status: asNullableString(pickFirst(raw?.to_status, raw?.tostatus)),
        action: asString(raw?.action),
        actor_user_id: asNullableNumber(
            pickFirst(raw?.actor_user_id, raw?.actoruserid),
        ),
        actor_name: asNullableString(pickFirst(raw?.actor_name, raw?.actorname)),
        notes: asNullableString(raw?.notes),
        metadata_json: asRecord(
            pickFirst(raw?.metadata_json, raw?.metadatajson),
        ),
        created_at: asString(pickFirst(raw?.created_at, raw?.createdat)),
    }
}

export async function getInspections(): Promise<Inspection[]> {
    const response = await apiGet<any[]>("/inspections")
    return Array.isArray(response) ? response.map(mapInspection) : []
}

export async function getInspectionById(inspectionId: number): Promise<Inspection> {
    const response = await apiGet<any>(`/inspections/${inspectionId}`)
    return mapInspection(response)
}

export async function createInspection(
    payload: InspectionCreateInput,
): Promise<Inspection> {
    const response = await apiPost<any>("/inspections", {
        status: "draft",
        ...payload,
    })

    return mapInspection(response)
}

export async function convertInspectionRequest(
    inspectionRequestId: number,
    payload: InspectionRequestConvertInput,
): Promise<void> {
    await apiPatch(
        `inspection-requests/${inspectionRequestId}/convert`,
        {
            inspection_id: payload.inspection_id,
            status: payload.status ?? "converted",
        },
    )
}

export async function getInspectionFields(
    inspectionId: number,
): Promise<InspectionField[]> {
    const response = await apiGet<any[]>(`/inspections/${inspectionId}/fields`)
    return Array.isArray(response) ? response.map(mapInspectionField) : []
}

export async function createInspectionField(
    inspectionId: number,
    payload: InspectionFieldCreateInput,
): Promise<InspectionField> {
    const response = await apiPost<any>(`/inspections/${inspectionId}/fields`, {
        validation_status: "pending",
        ...payload,
    })

    return mapInspectionField(response)
}

export async function getInspectionEvidences(
    inspectionId: number,
): Promise<Evidence[]> {
    const response = await apiGet<any[]>(`/inspections/${inspectionId}/evidences`)
    return Array.isArray(response) ? response.map(mapEvidence) : []
}

export async function createInspectionEvidence(
    inspectionId: number,
    payload: EvidenceCreateInput,
): Promise<Evidence> {
    const formData = new FormData()
    const categoryValue = payload.evidence_category.trim()
    const captionValue = payload.caption?.trim() || null
    const rawLabelValue = payload.raw_label?.trim() || categoryValue
    const componentCodeValue = payload.component_code?.trim() || categoryValue
    const sideValue = payload.side?.trim() || null

    formData.append("file", payload.file)
    formData.append("evidence_category", categoryValue)

    if (captionValue !== null) {
        formData.append("caption", captionValue)
    }

    if (rawLabelValue) {
        formData.append("raw_label", rawLabelValue)
    }

    if (componentCodeValue) {
        formData.append("component_code", componentCodeValue)
    }

    if (payload.axle_number !== null && payload.axle_number !== undefined) {
        formData.append("axle_number", String(payload.axle_number))
    }

    if (sideValue) {
        formData.append("side", sideValue)
    }

    formData.append("is_reference", String(Boolean(payload.is_reference)))

    const response = await apiPostForm<any>(`/inspections/${inspectionId}/evidences`, formData)
    return mapEvidence(response)
}

export async function runEvidenceOcr(
    evidenceId: number,
): Promise<EvidenceOcrResponse> {
    const response = await apiPost<any>(`/evidences/${evidenceId}/ocr`)
    return mapEvidenceOcrResponse(response)
}

export async function extractEvidenceOcr(
    evidenceId: number,
): Promise<OcrExtractResponse> {
    const response = await apiPost<any>(`/ocr/evidences/${evidenceId}/extract`)
    return mapOcrExtractResponse(response)
}

export async function validateInspectionOcr(
    inspectionId: number,
): Promise<OcrValidationResponse> {
    const response = await apiPost<any>(`/ocr/inspections/${inspectionId}/validate`)
    return mapOcrValidationResponse(response)
}

export async function getInspectionTranscriptions(
    inspectionId: number,
): Promise<Transcription[]> {
    const response = await apiGet<any[]>(`/transcription/inspection/${inspectionId}`)
    return Array.isArray(response) ? response.map(mapTranscription) : []
}

export async function getTranscriptionById(
    transcriptionId: number,
): Promise<Transcription> {
    const response = await apiGet<any>(`/transcription/${transcriptionId}`)
    return mapTranscription(response)
}

export async function createTranscription(
    payload: TranscriptionCreateInput,
): Promise<Transcription> {
    const response = await apiPost<any>("/transcription", {
        language: "es",
        model_name: "base",
        ...payload,
    })

    return mapTranscription(response)
}

export async function updateTranscription(
    transcriptionId: number,
    payload: TranscriptionUpdateInput,
): Promise<Transcription> {
    const response = await apiPut<any>(`/transcription/${transcriptionId}`, payload)
    return mapTranscription(response)
}

export async function getInspectionDrafts(
    inspectionId: number,
): Promise<ReportDraft[]> {
    const response = await apiGet<any[]>(`/report-drafts/inspection/${inspectionId}`)
    return Array.isArray(response) ? response.map(mapReportDraft) : []
}

export async function getDraftById(draftId: number): Promise<ReportDraft> {
    const response = await apiGet<any>(`/report-drafts/${draftId}`)
    return mapReportDraft(response)
}

export async function generateReportDraft(
    inspectionId: number,
    payload?: ReportDraftGenerateInput,
): Promise<ReportDraft> {
    const response = await apiPost<any>(`/report-drafts/generate/${inspectionId}`, {
        template_version: payload?.template_version ?? "v1",
    })

    return mapReportDraft(response)
}

export async function generateLlmReportDraft(
    inspectionId: number,
    payload?: LlmReportGenerateInput,
): Promise<ReportDraft> {
    const response = await apiPost<any>(`/llm-report/generate/${inspectionId}`, {
        template_version: payload?.template_version ?? "llama3-v1",
    })

    return mapReportDraft(response)
}

export async function updateReportDraft(
    draftId: number,
    payload: ReportDraftUpdateInput,
): Promise<ReportDraft> {
    const response = await apiPut<any>(`/report-drafts/${draftId}`, {
        status: "edited",
        ...payload,
    })

    return mapReportDraft(response)
}

export async function getReportStatus(draftId: number): Promise<ReportStatus> {
    const response = await apiGet<any>(`/reports/${draftId}/status`)
    return mapReportStatus(response)
}

export async function updateReportStatus(
    draftId: number,
    payload: ReportStatusUpdateInput,
): Promise<ReportStatus> {
    const response = await apiPatch<any>(`/reports/${draftId}/status`, payload)
    return mapReportStatus(response)
}

export async function getReportHistory(
    draftId: number,
    limit = 50,
): Promise<ReportStatusLog[]> {
    const response = await apiGet<any[]>(`/reports/${draftId}/history?limit=${limit}`)
    return Array.isArray(response) ? response.map(mapReportStatusLog) : []
}

export function getExportPdfUrl(draftId: number): string {
    return `${API_BASE_URL}/report-export/pdf/${draftId}`
}

export function getExportDocxUrl(draftId: number): string {
    return `${API_BASE_URL}/report-export/docx/${draftId}`
}

export async function updateInspectionField(
    inspectionId: number,
    fieldId: number,
    payload: { final_value: string },
): Promise<InspectionField> {
    const response = await apiPut<any>(
        `/inspections/${inspectionId}/fields/${fieldId}`,
        payload,
    )
    return mapInspectionField(response)
}