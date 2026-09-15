import { useState } from "react"
import {
    useCreateInspectionEvidenceMutation,
    useCreateInspectionFieldMutation,
    useCreateTranscriptionMutation,
    useExtractEvidenceOcrMutation,
    useGenerateLlmReportDraftMutation,
    useGenerateReportDraftMutation,
    useRunEvidenceOcrMutation,
    useUpdateReportDraftMutation,
    useUpdateTranscriptionMutation,
    useValidateInspectionOcrMutation,
} from "@/features/inspections/api/inspections.queries"
import type {
    EvidenceCreateInput,
    TranscriptionCreateInput,
} from "@/features/inspections/types/inspections.types"

export function useInspectionActions(inspectionId: number) {
    const [runningEvidenceId, setRunningEvidenceId] = useState<number | null>(null)
    const [extractingEvidenceId, setExtractingEvidenceId] = useState<number | null>(null)
    const [savingTranscriptionId, setSavingTranscriptionId] = useState<number | null>(null)
    const [savingDraftId, setSavingDraftId] = useState<number | null>(null)

    const validateOcrMutation = useValidateInspectionOcrMutation(inspectionId)
    const createEvidenceMutation = useCreateInspectionEvidenceMutation(inspectionId)
    const runEvidenceOcrMutation = useRunEvidenceOcrMutation(inspectionId)
    const extractEvidenceOcrMutation = useExtractEvidenceOcrMutation(inspectionId)
    const createTranscriptionMutation = useCreateTranscriptionMutation(inspectionId)
    const updateTranscriptionMutation = useUpdateTranscriptionMutation(inspectionId)
    const generateDraftMutation = useGenerateReportDraftMutation(inspectionId)
    const generateLlmDraftMutation = useGenerateLlmReportDraftMutation(inspectionId)
    const updateDraftMutation = useUpdateReportDraftMutation(inspectionId)
    const createFieldMutation = useCreateInspectionFieldMutation(inspectionId)

    const handleValidateOcr = async () => {
        await validateOcrMutation.mutateAsync()
    }

    const handleUploadEvidence = async (payload: EvidenceCreateInput) => {
        await createEvidenceMutation.mutateAsync(payload)
    }

    const handleCreateField = async (payload: {
        field_key: string
        field_label: string
        field_group: string
        expected_type: string
        manual_value: string
    }) => {
        await createFieldMutation.mutateAsync(payload)
    }

    const handleRunEvidenceOcr = async (evidenceId: number) => {
        try {
            setRunningEvidenceId(evidenceId)
            await runEvidenceOcrMutation.mutateAsync(evidenceId)
        } finally {
            setRunningEvidenceId(null)
        }
    }

    const handleExtractEvidenceOcr = async (evidenceId: number) => {
        try {
            setExtractingEvidenceId(evidenceId)
            await extractEvidenceOcrMutation.mutateAsync(evidenceId)
        } finally {
            setExtractingEvidenceId(null)
        }
    }

    const handleCreateTranscription = async (
        payload: Omit<TranscriptionCreateInput, "inspection_id">,
    ) => {
        await createTranscriptionMutation.mutateAsync({
            inspection_id: inspectionId,
            ...payload,
        })
    }

    const handleSaveTranscription = async (
        transcriptionId: number,
        finalText: string,
    ) => {
        try {
            setSavingTranscriptionId(transcriptionId)
            await updateTranscriptionMutation.mutateAsync({
                transcriptionId,
                payload: {
                    final_text: finalText,
                },
            })
        } finally {
            setSavingTranscriptionId(null)
        }
    }

    const handleCreateVoiceTranscription = async (audioBlob: Blob) => {
        const audioFile = new File(
            [audioBlob],
            `inspection-${inspectionId}-${Date.now()}.webm`,
            { type: audioBlob.type || "audio/webm" },
        )

        const createdEvidence = await createEvidenceMutation.mutateAsync({
            file: audioFile,
            evidence_category: "audio",
            caption: "Audio grabado desde micrófono",
        })

        await createTranscriptionMutation.mutateAsync({
            inspection_id: inspectionId,
            evidence_id: createdEvidence.id,
            source_file_path: createdEvidence.file_path,
            language: "es",
            model_name: "base",
        })
    }

    const handleGenerateDraft = async (templateVersion?: string) => {
        await generateDraftMutation.mutateAsync(templateVersion)
    }

    const handleGenerateLlmDraft = async (templateVersion?: string) => {
        await generateLlmDraftMutation.mutateAsync(templateVersion)
    }

    const handleSaveDraft = async (draftId: number, editedText: string) => {
        try {
            setSavingDraftId(draftId)
            await updateDraftMutation.mutateAsync({
                draftId,
                edited_text: editedText,
                status: "edited",
            })
        } finally {
            setSavingDraftId(null)
        }
    }

    return {
        runningEvidenceId,
        extractingEvidenceId,
        savingTranscriptionId,
        savingDraftId,
        validateOcrMutation,
        createEvidenceMutation,
        createFieldMutation,
        createTranscriptionMutation,
        updateTranscriptionMutation,
        generateDraftMutation,
        generateLlmDraftMutation,
        updateDraftMutation,
        handleValidateOcr,
        handleUploadEvidence,
        handleCreateField,
        handleRunEvidenceOcr,
        handleExtractEvidenceOcr,
        handleCreateTranscription,
        handleSaveTranscription,
        handleCreateVoiceTranscription,
        handleGenerateDraft,
        handleGenerateLlmDraft,
        handleSaveDraft,
    }
}
