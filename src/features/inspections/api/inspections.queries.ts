import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createInspection,
    createInspectionEvidence,
    createInspectionField,
    createTranscription,
    extractEvidenceOcr,
    generateLlmReportDraft,
    generateReportDraft,
    getDraftById,
    getInspectionById,
    getInspectionDrafts,
    getInspectionEvidences,
    getInspectionFields,
    getInspectionTranscriptions,
    getInspections,
    getReportHistory,
    getReportStatus,
    runEvidenceOcr,
    updateReportDraft,
    updateReportStatus,
    updateTranscription,
    validateInspectionOcr, updateInspectionField,
} from "./inspections.api"

import { inspectionsKeys } from "./inspections.keys"

export function useInspectionsQuery() {
    return useQuery({
        queryKey: inspectionsKeys.list(),
        queryFn: getInspections,
    })
}

export function useInspectionDetailQuery(inspectionId: number) {
    return useQuery({
        queryKey: inspectionsKeys.detail(inspectionId),
        queryFn: () => getInspectionById(inspectionId),
        enabled: !!inspectionId,
    })
}

// Alias útil para mantener compatibilidad de nombres en páginas
export const useInspectionByIdQuery = useInspectionDetailQuery

export function useInspectionFieldsQuery(inspectionId: number) {
    return useQuery({
        queryKey: inspectionsKeys.fields(inspectionId),
        queryFn: () => getInspectionFields(inspectionId),
        enabled: !!inspectionId,
    })
}

export function useInspectionEvidencesQuery(inspectionId: number) {
    return useQuery({
        queryKey: inspectionsKeys.evidences(inspectionId),
        queryFn: () => getInspectionEvidences(inspectionId),
        enabled: !!inspectionId,
    })
}

export function useInspectionTranscriptionsQuery(inspectionId: number) {
    return useQuery({
        queryKey: inspectionsKeys.transcriptions(inspectionId),
        queryFn: () => getInspectionTranscriptions(inspectionId),
        enabled: !!inspectionId,
    })
}

export function useInspectionDraftsQuery(inspectionId: number) {
    return useQuery({
        queryKey: inspectionsKeys.drafts(inspectionId),
        queryFn: () => getInspectionDrafts(inspectionId),
        enabled: !!inspectionId,
    })
}

export function useDraftQuery(draftId: number) {
    return useQuery({
        queryKey: inspectionsKeys.draft(draftId),
        queryFn: () => getDraftById(draftId),
        enabled: !!draftId,
    })
}

export function useReportStatusQuery(draftId: number) {
    return useQuery({
        queryKey: inspectionsKeys.reportStatus(draftId),
        queryFn: () => getReportStatus(draftId),
        enabled: !!draftId,
    })
}

// Alias para compatibilidad si alguna página usa el otro nombre
export const useReportDraftStatusQuery = useReportStatusQuery

export function useReportHistoryQuery(draftId: number, limit = 50) {
    return useQuery({
        queryKey: inspectionsKeys.reportHistory(draftId, limit),
        queryFn: () => getReportHistory(draftId, limit),
        enabled: !!draftId,
    })
}

// Alias para compatibilidad si alguna página usa el otro nombre
export const useReportDraftHistoryQuery = useReportHistoryQuery

export function useInspectionOcrValidationQuery(
    inspectionId: number,
    enabled = false,
) {
    return useQuery({
        queryKey: inspectionsKeys.ocrValidation(inspectionId),
        queryFn: () => validateInspectionOcr(inspectionId),
        enabled: enabled && !!inspectionId,
        retry: false,
    })
}

export function useCreateInspectionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createInspection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.list() })
        },
    })
}

export function useCreateInspectionFieldMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: Parameters<typeof createInspectionField>[1]) =>
            createInspectionField(inspectionId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.fields(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.detail(inspectionId) })
        },
    })
}

export function useCreateInspectionEvidenceMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: Parameters<typeof createInspectionEvidence>[1]) =>
            createInspectionEvidence(inspectionId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.evidences(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.detail(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.ocrValidation(inspectionId) })
        },
    })
}

export function useRunEvidenceOcrMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (evidenceId: number) => runEvidenceOcr(evidenceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.evidences(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.fields(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.ocrValidation(inspectionId) })
        },
    })
}

export function useExtractEvidenceOcrMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (evidenceId: number) => extractEvidenceOcr(evidenceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.evidences(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.fields(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.ocrValidation(inspectionId) })
        },
    })
}

export function useValidateInspectionOcrMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => validateInspectionOcr(inspectionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.fields(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.evidences(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.ocrValidation(inspectionId) })
        },
    })
}

export function useCreateTranscriptionMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTranscription,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.transcriptions(inspectionId),
            })
        },
    })
}

export function useUpdateTranscriptionMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
                         transcriptionId,
                         payload,
                     }: {
            transcriptionId: number
            payload: Parameters<typeof updateTranscription>[1]
        }) => updateTranscription(transcriptionId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.transcriptions(inspectionId),
            })
        },
    })
}

export function useGenerateReportDraftMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (templateVersion?: string) =>
            generateReportDraft(inspectionId, { template_version: templateVersion ?? "v1" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.drafts(inspectionId) })
        },
    })
}

export function useGenerateLlmReportDraftMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (templateVersion?: string) =>
            generateLlmReportDraft(inspectionId, {
                template_version: templateVersion ?? "llama3-v1",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.drafts(inspectionId) })
        },
    })
}

export function useUpdateReportDraftMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
                         draftId,
                         edited_text,
                         status = "edited",
                     }: {
            draftId: number
            edited_text: string
            status?: string
        }) => updateReportDraft(draftId, { edited_text, status }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.drafts(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.draft(variables.draftId) })
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.reportStatus(variables.draftId),
            })
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.reportHistory(variables.draftId, 50),
            })
        },
    })
}

export function useUpdateReportStatusMutation(draftId: number, inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: { status: string; notes?: string | null }) =>
            updateReportStatus(draftId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.reportStatus(draftId),
            })
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.reportHistory(draftId, 50),
            })
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.draft(draftId),
            })
            queryClient.invalidateQueries({
                queryKey: inspectionsKeys.detail(inspectionId),
            })
        },
    })
}

export function useUpdateInspectionFieldMutation(inspectionId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
                         fieldId,
                         payload,
                     }: {
            fieldId: number
            payload: { final_value: string }
        }) => updateInspectionField(inspectionId, fieldId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.fields(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.detail(inspectionId) })
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.ocrValidation(inspectionId) })
        },
    })
}