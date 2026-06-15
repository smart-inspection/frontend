export const inspectionsKeys = {
    all: ["inspections"] as const,
    list: () => [...inspectionsKeys.all, "list"] as const,
    detail: (inspectionId: number) => [...inspectionsKeys.all, "detail", inspectionId] as const,
    fields: (inspectionId: number) => [...inspectionsKeys.all, "fields", inspectionId] as const,
    evidences: (inspectionId: number) => [...inspectionsKeys.all, "evidences", inspectionId] as const,
    ocrValidation: (inspectionId: number) =>
        [...inspectionsKeys.all, "ocr-validation", inspectionId] as const,
    transcriptions: (inspectionId: number) =>
        [...inspectionsKeys.all, "transcriptions", inspectionId] as const,
    drafts: (inspectionId: number) => [...inspectionsKeys.all, "drafts", inspectionId] as const,
    draft: (draftId: number) => [...inspectionsKeys.all, "draft", draftId] as const,
    reportStatus: (draftId: number) => [...inspectionsKeys.all, "report-status", draftId] as const,
    reportHistory: (draftId: number, limit: number) =>
        [...inspectionsKeys.all, "report-history", draftId, limit] as const,
    productivityByInspection: (inspectionId: number) =>
        [...inspectionsKeys.all, "productivity", inspectionId] as const,
}