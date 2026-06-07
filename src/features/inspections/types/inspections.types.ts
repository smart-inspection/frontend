export type Inspection = {
    id: number
    code: string
    client_name: string
    equipment_type: string
    inspection_type: string
    inspection_date: string
    location: string | null
    requested_by: string | null
    responsible_inspector: string | null
    status: string
    created_at: string
    updated_at: string
}

export type InspectionCreateInput = {
    code: string
    client_name: string
    equipment_type: string
    inspection_type: string
    inspection_date: string
    location?: string | null
    requested_by?: string | null
    responsible_inspector?: string | null
    status?: string
}

export type InspectionRequestConvertInput = {
    inspection_id: number
    status?: string
}

export type InspectionField = {
    id: number
    inspection_id: number
    field_key: string
    field_label: string
    field_group: string
    expected_type: string
    manual_value: string | null
    ocr_value: string | null
    final_value: string | null
    validation_status: string
    validation_message: string | null
    confidence: number | null
    updated_at: string
}

export type InspectionFieldCreateInput = {
    field_key: string
    field_label: string
    field_group: string
    expected_type: string
    manual_value?: string | null
    ocr_value?: string | null
    final_value?: string | null
    validation_status?: string
    validation_message?: string | null
    confidence?: number | null
}

export type Evidence = {
    id: number
    inspection_id: number
    file_path: string
    file_url: string
    file_type: string
    evidence_category: string
    caption: string | null
    raw_label: string | null
    normalized_label: string | null
    evidence_slot: string | null
    component_code: string | null
    axle_number: number | null
    side: string | null
    is_reference: boolean
    label_confidence: number | null
    metadata_json: Record<string, unknown> | null
    ocr_extracted_text: string | null
    ocr_confidence: number | null
    ocr_processed: boolean
    ocr_last_processed_at: string | null
    uploaded_at: string
}

export type EvidenceCreateInput = {
    file: File
    evidence_category: string
    caption?: string | null
    raw_label?: string | null
    component_code?: string | null
    axle_number?: number | null
    side?: string | null
    is_reference?: boolean
}

export type EvidenceOcrResponse = {
    evidence_id: number
    ocr_extracted_text: string | null
    ocr_confidence: number | null
    ocr_processed: boolean
    ocr_last_processed_at: string | null
}

export type OcrExtractResponse = {
    evidence_id: number
    evidence_category: string
    file_path: string
    extracted_text: string
    confidence: number | null
}

export type OcrValidationItem = {
    field_id: number
    field_key: string
    field_label: string
    manual_value: string | null
    ocr_value: string | null
    final_value: string | null
    validation_status: string
    validation_message: string | null
    confidence: number | null
}

export type OcrValidationSummary = {
    matched: number
    mismatched: number
    not_found: number
    average_confidence: number | null
}

export type OcrValidationResponse = {
    inspection_id: number
    processed_evidences: number
    aggregated_text: string
    summary: OcrValidationSummary
    results: OcrValidationItem[]
}

export type Transcription = {
    id: number
    inspection_id: number
    evidence_id: number | null
    source_file_path: string
    language: string | null
    model_name: string
    raw_text: string | null
    final_text: string | null
    confidence: number | null
    processed: boolean
    edited_manually: boolean
    created_at: string
    updated_at: string
}

export type TranscriptionCreateInput = {
    inspection_id: number
    evidence_id?: number | null
    source_file_path: string
    language?: string | null
    model_name?: string
}

export type TranscriptionUpdateInput = {
    final_text: string
}

export type ReportDraft = {
    id: number
    inspection_id: number
    title: string
    template_version: string
    status: string
    generated_text: string
    edited_text: string | null
    source_snapshot: Record<string, unknown> | null
    generation_time_ms: number | null
    created_at: string
    updated_at: string
}

export type ReportDraftGenerateInput = {
    template_version?: string
}

export type ReportDraftUpdateInput = {
    edited_text: string
    status?: string
}

export type LlmReportGenerateInput = {
    template_version?: string
}

export type ReportStatus = {
    report_draft_id: number
    status: string
    status_updated_at: string | null
    status_updated_by: number | null
    last_action: string | null
}

export type ReportStatusUpdateInput = {
    status: string
    notes?: string | null
}

export type ReportStatusLog = {
    id: number
    report_draft_id: number
    inspection_id: number | null
    from_status: string | null
    to_status: string | null
    action: string
    actor_user_id: number | null
    actor_name: string | null
    notes: string | null
    metadata_json: Record<string, unknown> | null
    created_at: string
}